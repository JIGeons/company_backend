/**
 * 파일/S3 관련 인터페이스
 */
import { Express } from "express";

// Interface
import { Result } from '@interfaces/result.interface';
// Utils
import { FileTypeEnum } from "@utils/enum";

export interface FileStorageServiceInterface {
  deleteFile(url: string): Promise<void>;
  deleteFiles(urls: string[]): Promise<void>;
  uploadFile(file: Express.Multer.File, filename: string, fileType: FileTypeEnum): Promise<Result>;
}