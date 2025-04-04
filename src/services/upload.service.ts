/**
 * Upload Service
 */
import { Express } from 'express';
import { Service } from "typedi";
import {v4 as uuidv4, v4 as uuidv} from "uuid";
import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { HttpException } from "@exceptions/httpException";

// Interface
import { Result } from "@interfaces/result.interface";
type ReqFile = Express.Multer.File; // File 타입 별칭 지정

// Utils
import { getS3Client, s3UploadFiles } from "@utils/aws.util";

@Service()
export class UploadService {
  private s3Client = getS3Client();
  constructor() {}

  public async uploadImage(file: ReqFile): Promise<Result> {
    const fileExtension = file.originalname.split(".").pop();  // 파일 확장자 분리
    const fileName = `${uuidv()}.${fileExtension}`;                   // uuidv 유니크한 파일 이름을 만들어 줌

    // S3에 Upload할 파일 객체 생성
    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `post-images/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    }

    // s3Client가 존재하지 않는 경우
    if (!this.s3Client) {
      throw new HttpException(400, "AWS S3 객체를 생성하지 못했습니다.");
    }

    // S3에 파일 업로드
    const uploadResult = await s3UploadFiles(this.s3Client, uploadParams);

    if (!uploadResult.success) {
      throw new HttpException(500, uploadResult.error);
    }

    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/post-images/${fileName}`;
    return { success: true, data: { imageUrl: imageUrl } };
  }

  public async uploadFile(file: ReqFile, originalName: string): Promise<Result> {
    const decodedFileName = decodeURIComponent(originalName);

    // S3에 Upload할 파일 객체 생성
    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `post-files/${decodedFileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(decodedFileName)}`,
    };

    // s3Client가 존재하지 않는 경우
    if (!this.s3Client) {
      throw new HttpException(400, "AWS S3 객체를 생성하지 못했습니다.");
    }

    // S3에 파일 업로드
    const uploadResult = await s3UploadFiles(this.s3Client, uploadParams);

    if (!uploadResult.success) {
      throw new HttpException(500, uploadResult.error);
    }

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/post-files/${decodedFileName}`;
    return { success: true, data: { imageUrl: fileUrl } };
  }
}