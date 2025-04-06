/**
 * 파일/S3 관련 로직 분리
 */
import { Service } from "typedi";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Interface
import { FileStorageServiceInterface } from "@interfaces/file.interface";

// Utils
import { getS3Client } from "@utils/aws.util";

@Service()
export class S3FileStorageService implements FileStorageServiceInterface {
  private readonly s3Client: S3Client;
  constructor() {
    this.s3Client = getS3Client();
  }

  private getS3KeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);   // 파라미터로 받은 url은 url객체로 생성
      return decodeURIComponent(urlObj.pathname.substring(1));  // urlObj의 pathname에서 앞에 '/'를 제거하고 디코딩을 하여 원래의 문자열로 반환
    } catch (error) {
      console.log("### URL 파싱 에러: ", error);
      return null;
    }
  }

  // S3 파일 하나 삭제
  async deleteFile(url: string): Promise<void> {
    const key = this.getS3KeyFromUrl(url);
    // key값이 존재하지 않거나 s3객체가 존재하지 않으면 return;
    if (!key) return;

    try {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      }));
      console.log(`[S3] 파일 삭제 완료: ${key}`);
    } catch (error) {
      console.error(`[S3] 파일 삭제 에러: `, error);
    }
  }

  // S3 파일 반복 삭제
  async deleteFiles(urls: string[]): Promise<void> {
    for (const url of urls) {
      await this.deleteFile(url);
    }
  }
}