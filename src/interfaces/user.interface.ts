import { ObjectId } from 'mongodb';

export interface AuthUser {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}

export interface User {
  _id: ObjectId;
  username: string;
  isLoggedIn: boolean;
  isActive: boolean;
  failedLoginAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  ipAddress: string;
  lastLoginAttempts: Date;
}