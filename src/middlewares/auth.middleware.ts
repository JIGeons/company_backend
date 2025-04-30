import {Request, Response, NextFunction, RequestHandler} from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

// ENV
import { ACCESS_SECRET } from "@/config";

// Service
import { verifyToken } from "@services/token.service";

// Interface
import { AuthUser } from '@interfaces/user.interface';

import { HttpException } from "@exceptions/httpException";
import { TokenTypeEnum } from "@utils/enum";

export const AuthMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const path = req.path;

  // 토큰이 존재하지 않는 경우
  if (!authHeader) {
    if (path.includes("/logout")) {
      return next(new HttpException(401, "이미 로그아웃된 상태입니다."))
    }
    return next(new HttpException(401, "토큰이 존재하지 않습니다."));
  }

  // 토큰이 'Bearer '로 시작하지 않는 경우
  if (!authHeader.startsWith("Bearer ")) {
    return next(new HttpException(401, "잘못된 토큰입니다."));
  }

  const accessToken = authHeader.split(' ')[1];
  req.accessToken = accessToken;  // request에 accessToken 저장

  // 토큰 유효성 검사
  const tokenVerifyResult = await verifyToken(accessToken, TokenTypeEnum.ACCESS);
  if (!tokenVerifyResult.success) {
    return next(new HttpException(tokenVerifyResult.code, tokenVerifyResult.message));
  }

  // 토큰 검사 성공 시
  req.user = tokenVerifyResult.authUser as AuthUser;
  next();
};

export const RefreshTokenMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies['refreshToken'];

  if (!refreshToken) {
    return next(new HttpException(401, "토큰이 존재하지 않습니다."));
  }

  const { success, authUser, code, message } = await verifyToken(refreshToken, "REFRESH");
  if (!success)
    return next(new HttpException(code, message));

  req.user = authUser as AuthUser;
  next();
}