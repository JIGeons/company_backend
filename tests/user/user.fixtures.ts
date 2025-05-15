/**
 * User Fixtures 파일
 * User 정적 테스트 데이터
 */
import { AuthUser, User } from "@/interfaces/user.interface";

export const authUserFixtures: AuthUser = {
  id: 1234,
  userId: 'test',
  name: 'testUser',
}

export const userFixtures: User = {
  ...authUserFixtures,
  email: 'test@example.com',
  password: 'testPW',
  isLoggedIn: true,
  isActive: true,
  failedLoginAttempts: 0,
  lastLoginDatetime: new Date(),
  ipAddress: `127.0.0.1`,  // 관리자 로그인 시 접속 네트워크의 IP 주소를 저장하는 필드
  verificationCode: undefined,
  createdAt: new Date(),
}