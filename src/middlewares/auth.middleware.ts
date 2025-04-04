import {Request, Response, NextFunction, RequestHandler} from "express";
import jwt from 'jsonwebtoken';

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded as AuthUser;
    next();
  } catch (error) {
    return next(new HttpException(403, "유효하지 않은 토큰입니다."));
  }
};