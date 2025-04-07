import 'reflect-metadata';
import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import cookieParser from "cookie-parser";
import cors from "cors";
import { ErrorMiddleware } from "@middlewares/error.middleware";
import { PORT, MONGO_URI } from "@/config";

// Interface
import { Routes } from "@interfaces/routes.interface";

export class App {
  public app: express.Application;
  public port: string | number;

  public constructor(routes: Routes[]) {
    this.app = express();
    this.port = PORT || 3000;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`========================================`);
      console.log(`=== 🚀 Server listening on port ${this.port} ===`);
      console.log(`========================================`);
    })
  }

  // 데이터베이스 연결
  private async connectToDatabase() {
    mongoose.connect(MONGO_URI)
      .then(() => { console.log("Mongo DB 연결 성공.")})
      .catch((error) => { console.error('Mongo DB 연결 실패( error: ', error, ' )') });
  }

  // 미들웨어 관련 설정
  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: false}));
    this.app.use(cookieParser());

    // cors 설정
    this.app.use(cors({
      origin: 'http://localhost:5173', // frontURL 주소 cors 허용
      credentials: true,  // 쿠키 허용
    }));
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