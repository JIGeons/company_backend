/**
 * Upload Service
 */
import { Express } from 'express';
import { Service } from "typedi";
import { v4 as uuidv } from "uuid";
import { HttpException } from "@exceptions/httpException";

// Interface
import { Result } from "@interfaces/result.interface";
type ReqFile = Express.Multer.File; // File 타입 별칭 지정

// Service
import { S3FileStorageService } from '@services/file.service';

// Utils
import { FileTypeEnum } from "@utils/enum";

@Service()
export class UploadService {
  constructor(
    private readonly s3FileStorageService: S3FileStorageService // S3FileStorageService 의존성 주의
  ) {}

  public async uploadImage(file: ReqFile): Promise<Result> {
    const fileExtension = file.originalname.split(".").pop();  // 파일 확장자 분리
    const fileName = `${uuidv()}.${fileExtension}`;                   // uuidv 유니크한 파일 이름을 만들어 줌

    // S3에 이미지 업로드
    const uploadResult = await this.s3FileStorageService.uploadFile(file, fileName, FileTypeEnum.IMAGE);

    if (!uploadResult.success) {
      throw new HttpException(500, uploadResult.error);
    }

    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/post-images/${fileName}`;
    return { success: true, data: { imageUrl: imageUrl } };
  }

  public async uploadFile(file: ReqFile, originalName: string): Promise<Result> {
    const decodedFileName = decodeURIComponent(originalName);

    // S3에 이미지 업로드
    const uploadResult = await this.s3FileStorageService.uploadFile(file, decodedFileName, FileTypeEnum.FILE);

    if (!uploadResult.success) {
      throw new HttpException(500, uploadResult.error);
    }

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/post-files/${decodedFileName}`;
    return { success: true, data: { imageUrl: fileUrl } };
  }
}