/**
 * AWS Utils 파일
 */
import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-provider-env";

// Interface
import { Result } from "@interfaces/result.interface";

export function getS3Client () {
  try {
    return new S3Client({
      region: process.env.AWS_REGION,
      credentials: fromEnv(),
    });
  } catch {
    return null;
  }
}

// 파일 업로드 메소드
export async function s3UploadFiles (s3Client: S3Client, uploadParams: PutObjectCommandInput): Promise<Result> {
  // S3에 이미지 업로드
  const command = new PutObjectCommand(uploadParams);

  try {
    // AWS S3에 이미지 업로드
    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    return { success: false, error: "AWS S3 이미지 업로드 중 오류가 발생했습니다." };
  }
}