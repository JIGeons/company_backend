/**
 * 파일/S3 관련 로직 분리
 */
import {Service} from "typedi";
import {Express} from "express";
import {DeleteObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client} from "@aws-sdk/client-s3";
import {fromEnv} from "@aws-sdk/credential-provider-env";

// Interface
import {FileStorageServiceInterface} from "@interfaces/file.interface";
import {Result} from "@interfaces/result.interface";

type ReqFile = Express.Multer.File; // File 타입 별칭 지정

// ENV
import { AWS_BUCKET_NAME, AWS_REGION } from "@/config";

// Utils
import { FileTypeEnum } from "@utils/enum";


@Service()
export class S3FileStorageService implements FileStorageServiceInterface {
  private readonly s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: AWS_REGION,
      credentials: fromEnv(),
    })
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
  public async deleteFile(url: string): Promise<void> {
    const key = this.getS3KeyFromUrl(url);
    // key값이 존재하지 않거나 s3객체가 존재하지 않으면 return;
    if (!key) throw new Error("Key not found.");

    try {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: key,
      }));
      console.log(`[S3] 파일 삭제 완료: ${key}`);
    } catch (error) {
      throw new Error(`[S3] 파일 삭제 실패`);
    }
  }

  // S3 파일 반복 삭제
  public async deleteFiles(urls: string[]): Promise<void> {
    try {
      for (const url of urls) {
        await this.deleteFile(url);
      }
    } catch (error) {
      // S3 파일을 삭제하다가 에러가 난 경우
      throw new Error(`[S3] 파일 삭제 중 에러 발생`);
    }
  }

  // S3 이미지/파일 업로드
  public async uploadFile(file: ReqFile, fileName: string, type: FileTypeEnum): Promise<Result> {
    // S3에 Upload할 파일 객체 생성
    const command: PutObjectCommandInput = {
      Bucket: AWS_BUCKET_NAME,
      Key: `post-images/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    }

    // type이 파일인 경우 Key 수정, ContentDisposition 속성 추가
    if (type === FileTypeEnum.FILE) {
      command.Key = `post-files/${fileName}`;
      command.ContentDisposition = `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`;
    }

    try {
      // AWS S3에 이미지 업로드
      await this.s3Client.send(new PutObjectCommand(command));
      return { success: true };
    } catch (error) {
      return { success: false, error: "AWS S3 이미지/파일 업로드 중 오류가 발생했습니다." };
    }
  }
}