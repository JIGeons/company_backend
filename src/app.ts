import 'reflect-metadata';
import express from "express";
import mongoose from "mongoose";

import cookieParser from "cookie-parser";
import cors from "cors";
import { PORT } from "@/config";
import { DB } from "@/database";
import { initializeRedis, redisClient, redisSubscriber } from "@config/redis";
import { healthCheck } from "@utils/healthCheck";

// Middleware
import { ErrorMiddleware } from "@middlewares/error.middleware";
import { ApiLoggerMiddleware } from "@middlewares/apiLogger.middleware";


// Interface
import { Routes } from "@interfaces/routes.interface";

export class App {
  public app: express.Application;
  public port: string | number;
  private server: any;

  public constructor(routes: Routes[]) {
    this.app = express();
    this.port = PORT || 3000;

    this.initializeRedisEvents();
    this.initializeHealthCheck();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    this.server = this.app.listen(this.port, () => {
      console.log(`========================================`);
      console.log(`=== 🚀 Server listening on port ${this.port} ===`);
      console.log(`========================================`);
    })
  }

  public async close(): Promise<void> {
    if (this.server) {
      await mongoose.connection.close().then(() => {
        console.log("몽고 DB 연결 종료");
      });
      await DB.MYSQL.MySQL.destroy().then(() => {
        console.log("MySQL 연결 종료");
      })
      await redisClient.quit().then(() => {
        console.log("Redis 연결 종료");
      });
      await redisSubscriber.quit().then(() => {
        console.log("구독용 Redis 연결 종료");
      });

      this.server.close();
    }
  }

  // Redis 연결 및 이벤트 설정
  private async initializeRedisEvents() {
    await initializeRedis();
  }

  // 미들웨어 관련 설정
  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: false}));
    this.app.use(cookieParser());
    this.app.use(ApiLoggerMiddleware);

    // cors 설정
    this.app.use(cors({
      origin: 'http://localhost:5173', // frontURL 주소 cors 허용
      credentials: true,  // 쿠키 허용
    }));
  }

  private initializeHealthCheck() {
    // @ts-ignore
    this.app.get("/health", healthCheck);
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }
}