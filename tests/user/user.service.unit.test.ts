/**
 * User Service Unit Test 파일
 */
import { describe } from "node:test";
import bcrypt from "bcrypt";
import { HttpException } from "@/exceptions/httpException";

// Dto
import { CreateUserDto } from "@/dtos/mysql/user.dto";

// Interface
import { AuthUser } from "@/interfaces/user.interface";

// Service
import { UserService } from "@/services/user.service";
import * as TokenService from "@/services/token.service";

// Mock 데이터
import { mockMailService } from "@tests/common/mail/mail.mock";
import { mockUserDao } from "./user.mock";
import express from "express";
import {storeBlackListToken} from "@/services/token.service";

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
  describe('signup()', () => {
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

      // 400 이미 존재하는 사용자 Error throw
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

  /**
   * 로그인 단위 테스트
   */
  describe('login()', () => {
    let clientIp = '123.12.1.12';
    let userId = 'testId';
    let password = 'test1234';
    let hashedPassword: string;

    beforeEach(async () => {
      hashedPassword = await bcrypt.hash(password, 10);
    })

    it("Failed - 1: 사용자가 존재하지 않는 경우 401 '사용자를 찾을 수 없습니다.' 오류를 반환한다.", async () => {
      // 사용자 조회 결과 false
      mockUserDao.findByUserIdWithPW.mockResolvedValue({ success: false, data: null });

      await expect(userService.login(clientIp, userId, password))
        .rejects.toThrow(new HttpException(401, '사용자를 찾을 수 없습니다.'));
    });

    it("Failed - 2: 비활성화 된 계정인 경우 401 '비활성화된 계정' 오류를 반환한다.", async () => {
      // 비활성화 된 계정 반환
      mockUserDao.findByUserIdWithPW.mockResolvedValue({ success: true, data: { userId, password: hashedPassword, isActive: false } });

      await expect(userService.login(clientIp, userId, password))
        .rejects.toThrow(new HttpException(401, '비활성화된 계정입니다. 관리자에게 문의하세요.'));
    });

    it("Failed - 3: 이미 로그인 상태인 경우 401 '이미 다른 기기에서 로그인' 오류를 반환한다.", async () => {
      // 로그인된 계정 반환
      mockUserDao.findByUserIdWithPW.mockResolvedValue({ success: true, data: { userId, password: hashedPassword, isActive: true, isLoggedIn: true } });

      await expect(userService.login(clientIp, userId, password))
        .rejects.toThrow(new HttpException(401, '이미 다른 기기에서 로그인이 되어있습니다.'));
    });

    it("Failed - 4: 비밀번호가 일치하지 않는 경우 실패 응답을 반환한다.", async () => {
      // 로그인된 계정 반환
      mockUserDao.findByUserIdWithPW.mockResolvedValue({ success: true, data: { userId, password: hashedPassword, isActive: true, isLoggedIn: false, failedLoginAttempts: 0 } });

      const response = await userService.login(clientIp, userId, 'test1234!');  // 일치하지 않는 비밀번호
      expect(response).toEqual({ success: false, error: "비밀번호가 일치하지 않습니다.", data: { remainingAttempts: 4 } });
    });

    it("Failed - 5: 비밀번호를 5회 이상 틀린 경우 401 '비밀번호를 5회 이상 틀려 계정 비활성화' 오류를 반환한다.", async () => {
      // 로그인된 계정 반환
      mockUserDao.findByUserIdWithPW.mockResolvedValue({ success: true, data: { userId, password: hashedPassword, isActive: true, isLoggedIn: false, failedLoginAttempts: 5 } });

      await expect(userService.login(clientIp, userId, 'test1234!'))  // 일치하지 않는 비밀번호
        .rejects.toThrow(new HttpException(401, "비밀번호 5회 이상 틀려 계정이 비활성화 됩니다."));
    });

    it("Success: 로그인 성공 시 AccessToken, RefreshToken을 응답으로 반환한다.", async () => {
      // 로그인된 계정 반환
      const user = { userId, password: hashedPassword, isActive: true, isLoggedIn: false, failedLoginAttempts: 0, ipAddress: clientIp };
      mockUserDao.findByUserIdWithPW.mockResolvedValue({ success: true, data: {...user} });

      const accessToken = "mock-access-token";
      const refreshToken = "mock-refresh-token";
      jest.spyOn(TokenService, "createAccessRefreshToken").mockResolvedValue({ accessToken, refreshToken });
      jest.spyOn(TokenService, "storeTokenToRedis").mockResolvedValue({ success: true, data: {} });

      user.isLoggedIn = true;
      const response = await userService.login(clientIp, userId, password);
      console.log("Response: ", response);
      expect(response).toEqual({
        success: true,
        data: {
          user: expect.objectContaining({ // user의 일부분만 검사
            ...user
          }),
          accessToken: accessToken,
          refreshToken: refreshToken,
        }
      });
    });
  });

  /**
   * 로그아웃 단위 테스트
   */
  describe("logout", () => {
    const user: AuthUser = {
      id: 1234,
      userId: 'testId',
      name: 'testName',
    };
    const accessToken = "mock-access-token";

    it ('Failed - 1: 로그인 유저를 찾을 수 없는 경우 실패 응답을 반환한다.', async () => {
      // 사용자 정보 없음
      mockUserDao.findByUserId.mockResolvedValue({ success: false, data: null });

      const response = await userService.logout(user, accessToken);

      expect(response).toEqual({ success: false, data: [], error: "로그인 유저를 찾을 수 없습니다." });
    });

    it ('Failed - 2: 로그인 유저 정보 업데이트 중 에러 발생 시 500 오류를 반환한다.', async () => {
      mockUserDao.findByUserId.mockResolvedValue({ success: true, data: user });
      // 사용자 정보 업데이트 실패: 서버 에러
      mockUserDao.update.mockResolvedValue({ success: false, data: null , error: 'User 업데이트 실패' });

      await expect(userService.logout(user, accessToken))
        .rejects.toThrow(new HttpException(500, 'Logout: User 업데이트 실패'));
    });

    it ('Success: 로그아웃 성공 응답 반환', async () => {
      // 사용자 검색 및 업데이트 성공
      mockUserDao.findByUserId.mockResolvedValue({ success: true, data: user });
      mockUserDao.update.mockResolvedValue({ success: true, data: user });

      // Redis 저장 및 삭제 서비스 성공 처리
      jest.spyOn(TokenService, "storeBlackListToken").mockResolvedValue({ success: true, data: {} });
      jest.spyOn(TokenService, "deleteTokenToRedis").mockResolvedValue({ success: true, data: {} });

      const response = await userService.logout(user, accessToken);
      expect(response).toEqual({ success: true, data: user });
    });
  });

  /**
   * 유저 삭제 단위 테스트
   */
  describe("deleteUser", () => {
    const userData = {
      id: 1234,
      userId: 'testId',
      name: 'testName'
    }

    it ('Failed: 삭제할 유저가 없는 경우 실패 응답 반환', async () => {
      mockUserDao.delete.mockResolvedValue({ success: false, data: null });

      const response = await userService.deleteUser(userData.id);

      expect(response).toEqual({ success: false, data: [], error: '삭제할 유저가 존재하지 않습니다.' });
    });

    it ('Success: 삭제에 성공한 경우 성공 응답 반환', async () => {
      mockUserDao.delete.mockResolvedValue({ success: true, data: userData });

      const response = await userService.deleteUser(userData.id);

      expect(response).toEqual({ success: true, data: userData });
    });
  });
});