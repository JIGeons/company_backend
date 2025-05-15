/**
 * Post Service
 */
import { Service, Inject } from "typedi";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { marked } from "marked";
import { HttpException } from "@exceptions/httpException";

// Database
import { DB } from '@/database';

// Interface
import { Result } from "@interfaces/result.interface";
import { MongoServiceInterface } from "@interfaces/database.interface";
import { FileStorageServiceInterface } from "@interfaces/file.interface";

// Service
import { S3FileStorageService } from "@services/file.service";

// Dao
import { PostDao } from "@/daos/mongo/post.dao";

// Dto
import { CreatePostDto, UpdatePostDto } from "@/dtos/mongo/post.dto";

// Utils
import { getClientIp } from "@utils/getClientIp";

@Service()
export class PostService {
  constructor(
    private readonly postDao: PostDao,
    private readonly mongoService: MongoServiceInterface,

    // 인터페이스 기반 의존성 주입 (구현체: S3FileStorageService)
    @Inject(() => S3FileStorageService)
    private readonly s3FileStorageService: FileStorageServiceInterface
  ) {}

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

  public async createPost(title: string, content: string, fileUrl: string[]): Promise<Result> {
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

    // console.log(createPostDto);

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

  public async updatePost(id: string, title: string, content: string, fileUrl: string[]): Promise<Result> {
    // mongoose 트랜잭션 세션 시작
    return await this.mongoService.withTransaction(async (session) => {
      const findPost = await this.postDao.findOneById(id, session);
      if (findPost.error) {
        throw new HttpException(500, findPost.error);
      }
      if (!findPost.success) {
        throw new HttpException(404, "수정할 게시글이 존재하지 않습니다.");
      }
      const postData = findPost.data;
      // updatePostDto 객체 생성
      const updatePostDto = plainToInstance(UpdatePostDto, {
        id: String(postData._id),  // mongoose 객체 id타입을 string 형으로 변환.
        title,
        content,
        fileUrl,
      });

      // updatePostDto 유효성 검사
      const updateValidateError = await validate(updatePostDto);
      if (updateValidateError.length > 0) {
        const errorField = updateValidateError.map(validate => validate.property);
        throw new HttpException(400, "잘못된 입력값입니다.", errorField);
      }

      const {success, data: updatePostResult, error} = await this.postDao.updatePost(updatePostDto, session);
      if (error) {
        throw new HttpException(500, error);
      }
      if (!success) {
        throw new HttpException(500, error);
      }

      // content에 포함된 이미지 파일 필터링
      const imgRegex = /https:\/\/[^"']*?\.(?:png|jpg|jpeg|gif|PNG|JPG|JPEG|GIF)/g;
      const oldContentImages: any[] = postData.content.match(imgRegex) || [];
      const newContentImages: any[] = content.match(imgRegex) || [];

      // 이미지&파일 삭제
      const deletedImages: any[] = oldContentImages.filter((url: string) => !newContentImages.includes(url));
      const deletedFiles: string[] = (postData.fileUrl).filter(
        (url: string) => !(fileUrl).includes(url)
      );

      // AWS S3 파일 삭제 실패시 error Throw
      const allDeletedFiles = [...deletedImages, ...deletedFiles];
      await this.s3FileStorageService.deleteFiles(allDeletedFiles);

      return { success: true, data: updatePostResult };
    });
  }

  public async deletePost(id: string) {
    // Mongo 트랜잭션 내에서 실행
    return await this.mongoService.withTransaction( async (session) => {
      // 삭제할 게시글 조회
      const findPost = await this.postDao.findOneById(id, session);
      if (findPost.error) {
        throw new HttpException(500, findPost.error);
      }
      if (!findPost.success) {
        throw new HttpException(404, "삭제할 게시글이 존재하지 않습니다.");
      }
      const postData = findPost.data;

      // 게시글 삭제
      const { success, data: deletePostResult, error } = await this.postDao.deletePost(String(postData._id), session);
      if (error) {
        throw new HttpException(500, error);
      }
      if (!success) {
        throw new HttpException(404, "삭제할 게시글이 존재하지 않습니다.");
      }

      // content 내에 이미지 경로만 추출하기 위한 정규식 작성
      const imgRegex = /https:\/\/[^"']*?\.(?:png|jpg|jpeg|gif|PNG|JPG|JPEG|GIF)/g;
      const contentImages = postData.content.match(imgRegex) || [];

      // AWS S3 삭제 파일
      const allFiles: any[] = [...contentImages, ...(postData.fileUrl || [])];
      await this.s3FileStorageService.deleteFiles(allFiles);

      await session.commitTransaction();  // 삭제 성공 시 트랜잭션 커밋

      return { success: true, data: deletePostResult };
    });
  }
}