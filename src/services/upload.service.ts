/**
 * Upload Service
 */
import { Express } from 'express';
import {Inject, Service} from "typedi";
import { v4 as uuidv } from "uuid";
import { HttpException } from "@exceptions/httpException";

// ENV
import { AWS_BUCKET_NAME, AWS_REGION } from "@/config";

// Interface
import { Result } from "@interfaces/result.interface";
type ReqFile = Express.Multer.File; // File 타입 별칭 지정

// Service
import { S3FileStorageService } from '@services/file.service';

import { FileStorageServiceInterface } from "@interfaces/file.interface";

// Utils
import { FileTypeEnum } from "@utils/enum";

@Service()
export class UploadService {
  constructor(
    @Inject(() => S3FileStorageService)
    private readonly s3FileStorageService: FileStorageServiceInterface // S3FileStorageService 의존성 주입
  ) {}

  public async uploadImage(file: ReqFile): Promise<Result> {
    const fileExtension = file.originalname.split(".").pop();  // 파일 확장자 분리
    const fileName = `${uuidv()}.${fileExtension}`;                   // uuidv 유니크한 파일 이름을 만들어 줌

    // S3에 이미지 업로드
    const uploadResult = await this.s3FileStorageService.uploadFile(file, fileName, FileTypeEnum.IMAGE);

    if (!uploadResult.success) {
      throw new HttpException(500, uploadResult.error);
    }

    const imageUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/post-images/${fileName}`;
    return { success: true, data: { imageUrl: imageUrl } };
  }

  // TODO:: 동일한 이름의 파일이 업로드 되는 경우 파일이 덮어쓰기된다. 파일 이름 뒤 key를 설정하거나 새로운 컬럼을 생성하여 중복 파일을 방지해야한다.
  public async uploadFile(file: ReqFile, originalName: string): Promise<Result> {
    const decodedFileName = decodeURIComponent(originalName);

    // S3에 파일 업로드
    const uploadResult = await this.s3FileStorageService.uploadFile(file, decodedFileName, FileTypeEnum.FILE);

    if (!uploadResult.success) {
      throw new HttpException(500, uploadResult.error);
    }

    const fileUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/post-files/${decodedFileName}`;
    return { success: true, data: { fileUrl: fileUrl } };
  }
}