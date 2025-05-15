/**
 * Auth 미들웨어
 */
import {Request, Response, NextFunction, RequestHandler} from "express";
import requestIp from "request-ip";

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

  console.log(authHeader);

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

  // 사용자 IP 조회
  const clientIp = requestIp.getClientIp(req);
  req.clientIp = clientIp || undefined;
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
  const accessHeader = req.headers.authorization;

  if (!refreshToken || !accessHeader) {
    return next(new HttpException(401, "access 또는 refresh 토큰이 존재하지 않습니다."));
  }

  const accessToken = accessHeader.split(' ')[1];
  const accessVerifyResult = await verifyToken(accessToken, TokenTypeEnum.ACCESS);
  // accessToken이 만료된 상태가 아닌 경우(유효한 상태)에 return
  if (accessVerifyResult.success) {
    return next(new HttpException(403, "accessToken이 아직 유효하여 재발급이 불가능합니다."));
  }
  if (accessVerifyResult.code !== 401) {
    return next(new HttpException(403, "accessToken이 재발급 받을 수 있는 상태가 아닙니다."));
  }

  // refreshToken 유효성 검사
  const { success, authUser, code, message } = await verifyToken(refreshToken, TokenTypeEnum.REFRESH);
  if (!success) return next(new HttpException(code, message));

  // 사용자 IP 조회
  const clientIp = requestIp.getClientIp(req);
  req.clientIp = clientIp || undefined;
  req.user = authUser as AuthUser;
  req.refreshToken = refreshToken;
  next();
}