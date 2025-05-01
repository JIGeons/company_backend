import {Request, Response, NextFunction, RequestHandler} from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

// ENV
import { ACCESS_SECRET } from "@/config";

// Service
import {getTokenToBlackList, verifyToken} from "@services/token.service";

// Interface
import { AuthUser } from '@interfaces/user.interface';

import { HttpException } from "@exceptions/httpException";
import { TokenTypeEnum } from "@utils/enum";

/**
 * 사용자 인증 미들웨어
 * @param req
 * @param res
 * @param next
 * @constructor
 */
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

  // BlackList에서 AccessToken 검사
  const blackListResult = await getTokenToBlackList(accessToken);
  // BlackList에 토큰이 존재하는 경우 접근 불가 응답 반환.
  if (!blackListResult.success) {
    return next(new HttpException(403, blackListResult.error));
  }

  // 토큰 유효성 검사
  const tokenVerifyResult = await verifyToken(accessToken, TokenTypeEnum.ACCESS);
  if (!tokenVerifyResult.success) {
    return next(new HttpException(tokenVerifyResult.code, tokenVerifyResult.message));
  }

  // 토큰 검사 성공 시
  req.user = tokenVerifyResult.authUser as AuthUser;
  next();
};

/**
 * AccessToken 재발급 시 Refresh 토큰 검증하는 미들웨어
 * @param req
 * @param res
 * @param next
 * @constructor
 */
export const RefreshTokenMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies['refreshToken'];

  if (!refreshToken) {
    return next(new HttpException(401, "refresh 토큰이 존재하지 않습니다."));
  }

  // refreshToken 유효성 검사
  const { success, authUser, code, message } = await verifyToken(refreshToken, TokenTypeEnum.REFRESH);
  if (!success) return next(new HttpException(code, message));

  req.user = authUser as AuthUser;
  req.refreshToken = refreshToken;
  next();
}