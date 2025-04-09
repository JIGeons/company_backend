/**
 * 서버 헬스 체크 메서드
 */
import { Request, Response } from "express";
import mongoose from "mongoose";
import { redisClient } from "@config/redis";

export const healthCheck = async (req: Request, res: Response): Promise<Response> => {
  console.log("## 헬스 체크");
  try {
    // mongoDB 헬스
    const mongoDB = mongoose.connection.db;
    const mongoOk = await mongoDB?.admin().ping();
    // Redis 헬스 체크
    const redisOk = await redisClient.ping();

    if (!mongoOk) {
      console.log("### MongoDB unhealthy")
    }

    if (!redisOk) {
      console.log("### Redis unhealthy")
    }

    if (mongoOk && redisOk === 'PONG') {
      return res.status(200).type('text/plain').send('OK');
    }

    return res.status(500).type('text/plain').send('Unhealthy');
  } catch (err) {
    console.log("### Server unhealthy ", err);
    return res.status(500).type('text/plain').send('Unhealthy');
  }
}