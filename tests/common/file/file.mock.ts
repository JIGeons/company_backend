/**
 * File mock 파일
 */

// interface
import { FileStorageServiceInterface } from "../../../src/interfaces/file.interface";

export const mockFileStorageService: jest.Mocked<FileStorageServiceInterface> = {
  deleteFile: jest.fn(),
  deleteFiles: jest.fn(),
  uploadFile:jest.fn(),
}