/**
 * Logout Handler 통합 테스트
 */

import request from "supertest";
import mongoose from "mongoose";
import { App } from "@/app";
import { logoutHandler } from "@/listeners/logout.handler";
import jwt from 'jsonwebtoken';

// Routes
import { UserRoute } from "@/routes/user.route";

// Factory
import { loggedinUser } from "@tests/factory/user.factory";

// ENV
import {JWT_SECRET, MONGO_URI} from "@/config";
import User from "../../../src/models/user.model";

describe("Logout Handler 통합 테스트", () => {
  let app: App;
  let server: any;
  let jwtToken: string;

  jest.setTimeout(30000);

  beforeAll(async () => {
    app = new App([new UserRoute()]);
    app.listen(); // 테스트용 서버 포트 실행

    // 테스트용 로그인 계성 생성
    const loginResult = await loggedinUser();
    await new Promise(res => setTimeout(res, 100)); // 약간 기다림 (DB write 안정화)
    const check = await User.findById(loginResult._id);
    console.log("DB에서 직접 찾은 유저:", check);

    // 테스트용 JWT 발급
    const payload = { userId: loginResult._id.toString(), username: loginResult.username };
    console.log(payload);
    // @ts-ignore
    jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    app.close();
    await mongoose.connection.close();
  })

  it('정상적인 accessToken을 전달하면 로그아웃이 성공해야한다.', async () => {

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => { console.info('[ERROR] ', args)});

    await logoutHandler(jwtToken);

    // 로그아웃 성공 메시지 출력 확인
    expect(consoleLogSpy).toHaveBeenCalledWith('자동 로그아웃 성공');
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
})