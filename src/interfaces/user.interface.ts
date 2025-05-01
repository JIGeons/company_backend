/**
 *  User Interface
 */

// User 인터페이스 정의
export interface User {
  id: number;
  userId: string;
  email: string;
  name: string;
  password: string;
  isLoggedIn?: boolean;
  isActive?: boolean;
  failedLoginAttempts?: number;
  lastLoginDatetime?: Date;
  ipAddress?: string;  // 관리자 로그인 시 접속 네트워크의 IP 주소를 저장하는 필드
  createdAt?: Date;
}

export interface AuthHeader {
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: number;
  userId: string;
  name: string;
}

export interface userTokenInfo extends AuthHeader, AuthUser {}