/**
 *  User Interface
 */

import { Document } from "mongoose";

// User 인터페이스 정의
export interface User {
  username: string;
  password: string;
  isLoggedIn?: boolean;
  isActive?: boolean;
  failedLoginAttempts?: number;
  lastLoginAttempt?: Date;
  ipAddress?: string;  // 관리자 로그인 시 접속 네트워크의 IP 주소를 저장하는 필드
  createdAt?: Date;
}

// UserModel 인터페이스 정의
export interface UserDocument extends User, Document {};

export interface AuthUser {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}