/**
 * User Service Unit Test 파일
 */
import { describe } from "node:test";
import { Container } from "typedi";
import { HttpException } from "@/exceptions/httpException";

import { CreateUserDto } from "@/dtos/mysql/user.dto";

import { UserService } from "@/services/user.service";

// Mock 데이터
import { mockMailService } from "@tests/common/mail/mail.mock";
import { mockUserDao } from "./user.mock";

/**
 * UserService 단위 테스트
 */
describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    // 테스트용 UserService 객체 생성
    userService = new UserService(mockUserDao, mockMailService);
  });

  /**
   * 회원가입 테스트 실패 3, 성공 1
   */
  describe('signup()', async () => {
    it("Failed - 1: 필요 데이터가 충분하지 않은 경우 400 '잘못된 입력값' 오류를 반환한다.", async () => {
      const testCreateUserData = {
        userId: 'testId',
        name: 'testUser',
        password: 'test1234',
      }

      // 400 Error throw
      await expect(userService.signup(testCreateUserData as CreateUserDto))
        .rejects.toThrow(new HttpException(400, '잘못된 입력값입니다.'));
    });

    it("Failed - 2: 데이터 타입이 일치하지 않은 경우 400 '잘못된 입력값' 오류를 반환한다.", async () => {
      // Email 형식이 아닌 데이터
      const testCreateUserData = {
        userId: 'testId',
        email: 'test.com',
        name: 'testUser',
        password: 'test1234',
      }

      // 400 Error throw
      await expect(userService.signup(testCreateUserData as CreateUserDto))
        .rejects.toThrow(new HttpException(400, '잘못된 입력값입니다.'));
    });

    it("Failed - 3: 이미 존재하는 사용자인 경우 400 '이미 존재하는 사용자' 오류를 반환한다.", async () => {
      // 이미 존재하는 사용자 ID
      const testCreateUserData: CreateUserDto = {
        userId: 'testId',
        email: 'test@test.com',
        name: 'testUser',
        password: 'test1234',
      }

      // 이미 존재하는 사용자일 경우 success: true 반환
      mockUserDao.findByUserId.mockResolvedValue({ success: true, data: testCreateUserData });
      await expect(userService.signup(testCreateUserData))
        .rejects.toThrow(new HttpException(400, '이미 존재하는 사용자입니다.'));
    });

    it("Success: User 정보 생성 성공 시 성공 플래그와 생성된 User 정보를 반환한다.", async () => {
      const testCreateUserData: CreateUserDto = {
        userId: 'testId',
        email: 'test@test.com',
        name: 'testUser',
        password: 'test1234',
      }

      // 존재하는 사용자가 없으면 false를 반환
      mockUserDao.findByUserId.mockResolvedValue({ success: false, data: null });
      // 사용자 생성 성공 응답
      mockUserDao.create.mockResolvedValue({ success: true, data: testCreateUserData });

      const response = await userService.signup(testCreateUserData);

      expect(response).toEqual({ success: true, data: testCreateUserData });
    });
  });
});