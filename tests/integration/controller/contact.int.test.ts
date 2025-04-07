/**
 * Contact API(Controller) 단위 통합 테스트
 */

import request from "supertest";
import mongoose from "mongoose";
import { App } from '@/app';
import { ContactRoute } from "@/routes/contact.route";
import {describe} from "node:test";
import jwt from "jsonwebtoken";

import { MONGO_URI, JWT_SECRET } from "@/config";

beforeAll(async () => {
  await mongoose.connect(MONGO_URI || '');
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Contact 통합 테스트', () => {
  let app;
  let server: any;
  let jwtToken: string;

  beforeAll(() => {
    app = new App([new ContactRoute()]);
    server = app['app'];  // 실제 Express 인스턴스

    // 테스트용 JWT 발급
    const payload = { userId: 'testId', username: 'test@test.com' };
    jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  });

  describe('GET /api/contact', () => {
    // /api/contact 성공 테스트
    it('GET /api/contact - 인증된 사용자', async () => {
      const res = await request(server)
        .get('/api/contact')
        .set('Cookie', [`token=${jwtToken}`]);  // 쿠키로 jwt 토큰 전달

      expect(res.statusCode).toBe(404);
    });
  });
});