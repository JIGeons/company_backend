/**
 * API Logger 미들웨어
 */

import { Request, Response, NextFunction } from 'express';

export const ApiLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();   // 요청 시작 시간

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log(`Body: ${JSON.stringify(req.body)}`);

  // API 요청이 끝나는 걸 감지
  res.on("finish", () => {
    const endTime = Date.now();   // 요청 종료 시간
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} completed with status ${res.statusCode} in ${endTime - startTime}ms`);
  });

  next();   // 다음 미들웨어로 넘어감
}