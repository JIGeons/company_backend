/**
 * config index.ts 파일 환경변수 주입
 */

import { config } from "dotenv";
import * as process from "node:process";
config({ path: `.env.${process.env.NODE_ENV || 'test'}` });

// Server
export const NODE_ENV = process.env.NODE_ENV || 'test';
export const UNIT_TEST = process.env.UNIT_TEST || 'false';
export const { HOST, PORT } = process.env;
export const { SERVER_URI, REDIS_URI } = process.env;

// JWT
export const { ACCESS_SECRET, REFRESH_SECRET } = process.env;
// export const JWT_ACCESS_EXPIRE = 15 * 60; // 15분
export const JWT_ACCESS_EXPIRE = 10; // 15분
export const JWT_EXPIRES = 6 * 60 * 60;   // 6시간

// MongoDB
export const { MONGO_URI, MONGO_ROOT_USER, MONGO_ROOT_PASSWORD, MONGO_DATABASE, MONGO_URI_PORT } = process.env;

// MySQL
export const { MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_URI_PORT } = process.env;

// AWS
export const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION } = process.env;

// SMTP - mail
export const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SENDER_NAME, SMTP_SENDER_MAIL } = process.env;
