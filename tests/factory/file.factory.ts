/**
 * File Factory 파일
 */
import { Express } from 'express';
type ReqFile = Express.Multer.File; // File 타입 별칭 지정

export const createMockReqFile = (overrides: Partial<ReqFile> = {}): ReqFile => ({
  fieldname: 'file',
  originalname: 'test-image.png',
  encoding: 'base64',
  mimetype: 'image/png',
  buffer: Buffer.from('mock file data'),
  size: 1234,
  stream: null as any,  // 필요 없으면 null 처리
  destination: '',
  filename: '',
  path: '',
  ...overrides,
});