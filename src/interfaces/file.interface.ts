/**
 * 파일/S3 관련 인터페이스
 */

export interface FileStorageServiceInterface {
  deleteFile(url: string): Promise<void>;
  deleteFiles(urls: string[]): Promise<void>;
}