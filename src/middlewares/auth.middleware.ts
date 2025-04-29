import {Request, Response, NextFunction, RequestHandler} from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

// ENV
import { JWT_SECRET } from "@/config";

// Interface
import { AuthUser } from '@interfaces/user.interface';

import { HttpException } from "@exceptions/httpException";

export const AuthMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  const path = req.path;

  if (!token) {
    if (path.includes("/logout")) {
      return next(new HttpException(401, "이미 로그아웃된 상태입니다."))
    }
    return next(new HttpException(401, "토큰이 존재하지 않습니다."));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded as AuthUser;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      console.log('auth TokenExpiredError');
      return next(new HttpException(403, "유효기간이 만료된 토큰입니다."));
    } else if (error instanceof JsonWebTokenError) {
      console.log('JsonWebTokenError');
    } else if (error instanceof Error) {
      console.log("기타 Error: ", error.message);
    }

    return next(new HttpException(403, "유효하지 않은 토큰입니다."));
  }
};