// middlewares/error.middleware.ts
import {Request, Response, NextFunction, ErrorRequestHandler} from 'express';
import { HttpException } from '@exceptions/httpException';

export const ErrorMiddleware: ErrorRequestHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  try {
    if (err instanceof HttpException) {
      res.status(err.status).send({
        success: false,
        message: err.message,
      });
      return ;
    }

    res.status(500).send({
      success: false,
      message: '서버 오류',
      error: err.stack,
    });
  } catch (error) {
    _next(error);
  }
};
