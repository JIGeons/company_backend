/**
 * User Mock 파일
 * User 의존 모듈 Mock 구현
 */
import { UserDao } from "@/daos/mysql/user.dao";

// UserDao Mock 데이터
export const userDaoMock: jest.Mocked<UserDao> = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByUserIdWithPW: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as any;