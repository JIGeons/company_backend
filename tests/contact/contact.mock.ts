/**
 * Contact Mock 파일
 * Contact 의존 모듈 Mock 구현
 */
import { ContactDao } from "@/daos/mongo/contact.dao";

// ContactDao Mock 데이터
export const contactDaoMock: jest.Mocked<ContactDao> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  delete: jest.fn(),
} as any;