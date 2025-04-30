/**
 * Contact API(Controller) 단위 통합 테스트
 */

import request from "supertest";
import mongoose from "mongoose";
import { App } from '@/app';
import { startTestServer } from "@tests/test-server";
import { ContactRoute } from "@/routes/contact.route";
import {describe} from "node:test";
import jwt from "jsonwebtoken";

// Model
import { DB } from '@/database';
const Contact = DB.MONGO.Contact;

// Factory
import { createContact } from "@tests/factory/contact.factory";

// Interface
import { AuthUser } from "@interfaces/user.interface";

// ENV
import { MONGO_URI, ACCESS_SECRET } from "@/config";

describe('Contact 통합 테스트', () => {
  let app;
  let server: any;
  let jwtToken: string;

  beforeAll(async () => {
    app = await startTestServer([new ContactRoute()]);
    server = app['app'];  // 실제 Express 인스턴스

    // 테스트용 JWT 발급
    const payload: AuthUser = { id: 12345, userId: 'testId', name: 'test@test.com' };
    // @ts-ignore
    jwtToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '1h' });
  });

  describe('GET /api/contact', () => {

    afterEach(async () => {
      // 테스트 후 데이터 정리
      await Contact.deleteMany({});
    });

    // /api/contact 성공 테스트
    it('GET /api/contact - 인증된 사용자 & 조회 내용 존재', async () => {
      const mockContact = await createContact();

      const res = await request(server)
        .get('/api/contact')
        .set('Cookie', [`token=${jwtToken}`]);  // 쿠키로 jwt 토큰 전달

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.message).toBe('문의 내용 조회 성공')
    });

    // /api/contact 실패 테스트
    it('GET /api/contact - 인증된 사용자 & 조회 내용 없음', async () => {
      const res = await request(server)
        .get('/api/contact')
        .set('Cookie', [`token=${jwtToken}`]);  // 쿠키로 jwt 토큰 전달

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('문의 내역이 존재하지 않습니다.')
    });

    it('GET /api/contact/:id - 인증된 사용자 & ID 조회 성공', async () => {
      const mockContact = await createContact();
      const mockContactId = mockContact._id;
    })
  });
});