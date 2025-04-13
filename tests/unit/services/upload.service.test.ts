/**
 * User Service Unit Test 파일
 */

import 'reflect-metadata' // typedi를 쓸 때 필요함
import { UploadService } from "@/services/upload.service";
import { S3FileStorageService } from "@/services/file.service";
import { createMockReqFile } from "@tests/factory/file.factory";
import { FileTypeEnum } from "@/utils/enum";
import { describe } from "node:test";

// 모킹을 위한 jest.mock (class 자체를 대체하진 않고 instance만 목업)
jest.mock("@/services/file.service")

describe('UploadService', () => {
  let uploadService: UploadService;
  let s3FileStorageService: jest.Mocked<S3FileStorageService>;

  beforeEach(() => {
    // S3FileStorageService를 mock instance로 생성
    s3FileStorageService = {
      uploadFile: jest.fn(),
    } as unknown as jest.Mocked<S3FileStorageService>

    uploadService = new UploadService(s3FileStorageService);
  });

  describe('uploadImage()', () => {
    it('이미지를 성공적으로 업로드하고 URL을 반환한다.', async () => {
      const mockFile = createMockReqFile({ originalname: 'image.png'});

      s3FileStorageService.uploadFile.mockResolvedValue({
        success: true
      });

      const result = await uploadService.uploadImage(mockFile);

      expect(result.success).toBe(true);
      expect(result.data?.imageUrl).toContain('https://');
      expect(s3FileStorageService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        expect.stringMatching(/\.png$/),   // uuid + 확장자
        FileTypeEnum.IMAGE
      );
    });

    it('업로드 실패 시 예외를 던진다', async () => {
      const mockFile = createMockReqFile({ originalname: 'image.jpg' });

      s3FileStorageService.uploadFile.mockResolvedValue({
        success: false,
        error: '업로드 실패'
      });

      await expect(uploadService.uploadImage(mockFile)).rejects.toThrow('업로드 실패');
    });
  });

  describe('uploadFile()', () => {
    it('파일을 성공적으로 업로드 하고 URL을 반환한다.', async () => {
      const mockFile = createMockReqFile({ originalname: '문서.pdf' });

      s3FileStorageService.uploadFile.mockResolvedValue({
        success: true,
      });

      const result = await uploadService.uploadFile(mockFile, encodeURIComponent('문서.pdf'));

      expect(result.success).toBe(true);
      expect(result.data?.fileUrl).toContain('/post-files/');
      expect(s3FileStorageService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        '문서.pdf',
        FileTypeEnum.FILE
      )
    });

    it('업로드 실패 시 예외를 던진다', async () => {
      const mockFile = createMockReqFile({ originalname: '문서2.pdf' });

      s3FileStorageService.uploadFile.mockResolvedValue({
        success: false,
        error: '업로드 실패'
      });

      await expect(uploadService.uploadFile(mockFile, encodeURIComponent('문서2.pdf'))).rejects.toThrow('업로드 실패');
    });
  })
})