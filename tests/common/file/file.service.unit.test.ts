/**
 * File Service Unit Test
 */

import {S3FileStorageService} from "@/services/file.service";
import {FileTypeEnum} from "@/utils/enum";

// S3 SDK Mock
const sendMock = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: sendMock,
    })),
    DeleteObjectCommand: jest.fn(),
    PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  };
});

describe("S3FileStorageService", () => {
  let fileService: S3FileStorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    fileService = new S3FileStorageService();
  });

  describe("getS3KeyFromUrl", () => {
    it("정상적인 S3 URL에서 Key 추출", async () => {
      const url = 'https://bucket.s3.amazonaws.com/post-images/file.png';
      const key = (fileService as any).getS3KeyFromUrl(url);
      expect(key).toBe('post-images/file.png');
    });

    it("잘못된 URL 처리", async () => {
      const url = "not-a-url";
      const key = (fileService as any).getS3KeyFromUrl(url);
      expect(key).toBeNull();
    });
  });

  // S3 파일 하나 삭제
  describe("delete one file", () => {
    const url = 'https://bucket.s3.amazonaws.com/post-images/file.png';

    beforeEach(() => {
      (fileService as any).getS3KeyFromUrl = jest.fn();
    });

    it("정상적으로 파일 삭제 (key 추출 성공)", async () => {
      (fileService as any).getS3KeyFromUrl.mockReturnValueOnce('s3-post-image.png');
      sendMock.mockResolvedValueOnce({}); // 성공케이스
      await expect(fileService.deleteFile(url)).resolves.toBeUndefined();
      expect(sendMock).toHaveBeenCalled();
    });

    it("key 추출 실패 오류 throw", async () => {
      (fileService as any).getS3KeyFromUrl.mockReturnValueOnce(null);

      await expect(fileService.deleteFile(url)).rejects.toThrow(new Error("Key not found."));
    });

    it("S3 삭제 중 예외 발생 시 오류 throw", async () => {
      (fileService as any).getS3KeyFromUrl.mockReturnValueOnce('s3-post-image.png');
      // AWS S3 전송 중 Reject 발생 정의
      sendMock.mockRejectedValueOnce(new Error("AWS Error"));

      await expect(fileService.deleteFile(url)).rejects.toThrow(new Error("[S3] 파일 삭제 실패"));
    });
  });

  describe("deleteFiles", () => {
    const urls = [
      'https://bucket.s3.amazonaws.com/post-images/file-1.png',
      'https://bucket.s3.amazonaws.com/post-images/file-2.png',
    ];

    it('여러 개 파일 삭제 시 deleteFile 반복 호출', async () => {
      sendMock.mockResolvedValue({}); // 모두 성공
      await expect(fileService.deleteFiles(urls)).resolves.toBeUndefined();
      expect(sendMock).toHaveBeenCalledTimes(2);
    });

    it('중간에 삭제 실패 시 예외 처리', async () => {
      sendMock.mockRejectedValueOnce(new Error("AWS Error"));
      await expect(fileService.deleteFiles(urls)).rejects.toThrow(new Error("[S3] 파일 삭제 중 에러 발생"));
    });
  });

  describe("uploadFile", () => {
    const fakeFile = {
      buffer: Buffer.from('dummy file'),
      mimeType: 'image/png',
    } as any;

    it('이미지 업로드 성공', async () => {
      sendMock.mockResolvedValueOnce({});
      const response = await fileService.uploadFile(fakeFile, 'test.png', FileTypeEnum.IMAGE);
      expect(response.success).toBe(true);
      expect(sendMock).toHaveBeenCalled();
    });

    it('파일 업로드 시 ContentDisposition 추가', async () => {
      sendMock.mockResolvedValueOnce({});
      const response = await fileService.uploadFile(fakeFile, 'test.doc', FileTypeEnum.FILE);
      expect(response.success).toBe(true);

      // 실제로 전달된 파라미터 검증 (PutObjectCommandInput)
      const callArgs = sendMock.mock.calls[0][0].input;
      expect(callArgs.ContentDisposition).toContain("attachment;");
      expect(callArgs.Key).toBe('post-files/test.doc');
    });

    it('S3 업로드 실패시 에러 반환', async () => {
      sendMock.mockRejectedValueOnce(new Error("AWS File Upload Error"));
      const response = await fileService.uploadFile(fakeFile, 'fail.png', FileTypeEnum.IMAGE);
      expect(response.success).toBe(false);
      expect(response.error).toContain('AWS S3 이미지/파일 업로드 중 오류가 발생했습니다.');
    })
  })
});
