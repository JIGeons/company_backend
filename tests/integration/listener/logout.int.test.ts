/**
 * Logout Handler 통합 테스트
 */

import request from "supertest";
import mongoose from "mongoose";
import { App } from "@/app";
import { startTestServer } from "@tests/test-server";
import { logoutHandler } from "@/listeners/logout.handler";
import jwt from 'jsonwebtoken';
import { DB } from "@/database"

// Routes
import { UserRoute } from "@/routes/user.route";

// Factory
import { createLoggedInUser } from "@tests/factory/user.factory";

// ENV
import {ACCESS_SECRET, MONGO_URI} from "@/config";

describe("Logout Handler 통합 테스트", () => {
  let app: App;
  let server: any;
  let jwtToken: string;

  jest.setTimeout(30000);
  console.info("🔥 테스트에서 찍힌 로그입니다");

  beforeAll(async () => {
    // 테스트용 서버 실행
    app = await startTestServer([new UserRoute()]);

    console.info("app은? ", app);

    const UserRepo = DB.MYSQL.User;

    // 테스트용 로그인 계성 생성
    const loginResult = await createLoggedInUser(UserRepo);
    await new Promise(res => setTimeout(res, 100)); // 약간 기다림 (DB write 안정화)

    // @ts-ignore 테스트용 JWT 발급
    const payload = { id: loginResult.id, userId: loginResult.userId, name: loginResult.username };
    console.log(payload);
    // @ts-ignore
    jwtToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await app.close();
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