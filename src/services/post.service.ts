/**
 * Post Service
 */
import { Service } from "typedi";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { marked } from "marked";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Interface
import { Result } from "@interfaces/result.interface";
import { HttpException } from "@exceptions/httpException";

// Dao
import { PostDao } from "@/daos/post.dao";

// Dto
import { CreatePostDto, UpdatePostDto } from "@/dtos/post.dto";

// Utils
import { getClientIp } from "@utils/getClientIp";

@Service()
export class PostService {
  private s3Client: S3Client;

  constructor(
    private readonly postDao: PostDao
  ) {
    // 파일 업로드할 때 사용되는 사용자 정보로 s3 객체 생성
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });
  }

  public async findAll(): Promise<Result> {
    const { success, data: postsResult, error } = await this.postDao.findAll();
    if (error) {
      throw new HttpException(500, error);
    }
    if (!success) {
      throw new HttpException(404, "게시글을 찾을 수 없습니다.");
    }

    return { success: true, data: postsResult };
  }

  public async getPostByIdWithRender(id: string, viewer: { ip: string | undefined, userAgent?: string | string[] | undefined }): Promise<Result> {
    const { success, data: postResult, error } = await this.postDao.findOneByIdCanSave(id);
    if (error) {
      throw new HttpException(500, error);
    }
    if (!success) {
      throw new HttpException(404, "게시글을 찾을 수 없습니다.");
    }

    // user IP 조회
    const ipResult = await getClientIp();
    let ip = ipResult.data;   // ip 주입
    if (!ipResult.success) {
      ip = viewer.ip;                // ip 조회 실패시 requestIp 주입
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 어제 날짜를 구함
    // 최근 24시간 내에 같은 User가 조회한 기록이 있는지 확인.
    const hasRecentView = postResult.viewLogs.some(
        // log.ip와 현재 ip가 같고,
        (log: { ip: any; userAgent: string | undefined; timestamp: string | number | Date; }) => log.ip === ip
        && log.userAgent === viewer.userAgent   // log.userAgent와 UserAgent가 같고,
        && new Date(log.timestamp) > oneDayAgo  // 조회 시간이 24시간 이내인 경우
    )

    // 처음보거나, 24시간이 지난 경우 실행
    if (!hasRecentView) {
      postResult.views += 1;
      postResult.viewLogs.push({
        ip,
        userAgent: viewer.userAgent,
        timestamp: new Date(),
      });
      await postResult.save();
    }

    let htmlContent;
    try {
      htmlContent = marked.parse(postResult.content || '');
    } catch (error) {
      console.log("마크다운 변환 실패: ", error);
      htmlContent = postResult.content;
    }

    const responseData = {
      ...postResult.toObject(), // mongoose 객체를 일반 객체로 변환
      renderedContent: htmlContent,
    }

    return { success: true, data: responseData };
  }

  public async createPost(title: string, content: string, fileUrl: string): Promise<Result> {
    const { success: findSuccess, data: findByRecentNumberResult, error: findError } = await this.postDao.findOneByRecentNumber();
    if (findError) {
      throw new HttpException(500, findError);
    }

    const nextNumber = findByRecentNumberResult ? findByRecentNumberResult.number + 1 : 1;
    const createPostDto = plainToInstance(CreatePostDto, {
      number: nextNumber,
      title,
      content,
      fileUrl,
    });

    // 입력값 유효성 검사
    const postValidateError = await validate(createPostDto);
    if (postValidateError.length > 0) {
      // 유효성 검사 실패 필드 반환
      const errorField = postValidateError.map( validate => validate.property );
      throw new HttpException(400, "잘못된 입력값입니다.", errorField);
    }

    const { success: createSuccess, data: createPostResult, error: createError } = await this.postDao.createPost(createPostDto);
    if (createError) {
      throw new HttpException(500, createError);
    }
    if (!createSuccess) {
      throw new HttpException(400, "게시글 생성에 실패하였습니다." );
    }

    return { success: true, data: createPostResult };
  }

  public async updatePost(id: string, title: string, content: string, fileUrl: string): Promise<Result> {
    const findPost = await this.postDao.findOneById(id);
    if (findPost.error) {
      throw new HttpException(500, findPost.error);
    }
    if (!findPost.success) {
      throw new HttpException(404, "수정할 게시글이 존재하지 않습니다.");
    }
    const postData = findPost.data;

    // content에 포함된 이미지 파일 필터링
    const imgRegex = /https:\/\/[^"']*?\.(?:png|jpg|jpeg|gif|PNG|JPG|JPEG|GIF)/g;
    const oldContentImages: any[] = postData.content.match(imgRegex) || [];
    const newContentImages: any[] = content.match(imgRegex) || [];

    // 이미지&파일 삭제
    const deletedImages: any[] = oldContentImages.filter((url: string) => !newContentImages.includes(url));
    const deletedFiles: string[] = (postData.fileUrl ?? []).filter(
      (url: string) => !(fileUrl ?? []).includes(url)
    );

    // AWS S3 객체 불러옴.
    const getS3KeyFromUrl = (url: string) => {
      try {
        const urlObj = new URL(url);  // 파라미터로 받은 url은 url객체로 생성
        return decodeURIComponent(urlObj.pathname.substring(1));  // urlObj의 pathname에서 앞에 /를 제거하고 디코딩을 하여 원래의 문자열로 반환
      } catch (error) {
        console.log("### URL 파싱 에러: ", error);
        return null;
      }
    }

    // AWS S3 파일 삭제
    const allDeletedFiles = [...deletedImages, ...deletedFiles];
    for(const fileUrl of allDeletedFiles) {
      const key = getS3KeyFromUrl(fileUrl);
      if (key) {
        try {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          }));

          console.log("파일 삭제 완료: ", key);
        } catch (error) {
          console.log("s3 파일 삭제 에러: ", error);
        }
      }
    }


    const updatePostDto = plainToInstance(UpdatePostDto, {
      id: String(postData._id),  // mongoose 객체 id타입을 string 형으로 변환.
      title,
      content,
      fileUrl,
    });

    const updateValidateError = await validate(updatePostDto);
    if (updateValidateError.length > 0) {
      const errorField = updateValidateError.map( validate => validate.property );
      throw new HttpException(400, "잘못된 입력값입니다.", errorField);
    }

    const { success, data: updatePostResult, error } = await this.postDao.updatePost(updatePostDto);
    if (error) {
      throw new HttpException(500, error);
    }
    if (!success) {
      throw new HttpException(404, "수정 할 게시글을 찾을 수 없습니다.")
    }

    return { success: true, data: updatePostResult };
  }

  public async deletePost(id: string) {
    const findPost = await this.postDao.findOneById(id);
    if (findPost.error) {
      throw new HttpException(500, findPost.error);
    }
    if (!findPost.success) {
      throw new HttpException(404, "삭제할 게시글이 존재하지 않습니다.");
    }
    const postData = findPost.data;

    // content 내에 이미지 경로만 추출하기 위한 정규식 작성
    const imgRegex = /https:\/\/[^"']*?\.(?:png|jpg|jpeg|gif|PNG|JPG|JPEG|GIF)/g;
    const contentImages = postData.content.match(imgRegex) || [];

    const getS3KeyFromUrl = (url: string) => {
      try {
        const urlObj = new URL(url);  // 파라미터로 받은 url은 url객체로 생성
        return decodeURIComponent(urlObj.pathname.substring(1));  // urlObj의 pathname에서 앞에 /를 제거하고 디코딩을 하여 원래의 문자열로 반환
      } catch (error) {
        console.log("### URL 파싱 에러: ", error);
        return null;
      }
    }

    const allFiles: any[] = [...contentImages, ...(postData.fileUrl || [])];

    for(const fileUrl of allFiles) {
      const key = getS3KeyFromUrl(fileUrl);
      if (key) {
        console.log("삭제할 파일 키: ", key);

        try {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          }));
        } catch (error) {
          console.log("s3 파일 삭제 에러: ", error);
        }
      }
    }

    const { success, data: deletePostResult, error } = await this.postDao.deletePost(String(postData._id));
    if (error) {
      throw new HttpException(500, error);
    }
    if (!success) {
      throw new HttpException(404, "삭제할 게시글이 존재하지 않습니다.");
    }

    return { success: true, data: deletePostResult };
  }
}