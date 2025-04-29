/**
 * config index.ts 파일 환경변수 주입
 */

import { config } from "dotenv";
import * as process from "node:process";
config({ path: `.env.${process.env.NODE_ENV || 'test'}` });

export const NODE_ENV = process.env.NODE_ENV || 'test';
export const UNIT_TEST = process.env.UNIT_TEST || 'false';
export const { HOST, PORT } = process.env;
export const { SERVER_URI, REDIS_URI } = process.env;
export const { MONGO_URI, MONGO_ROOT_USER, MONGO_ROOT_PASSWORD, MONGO_DATABASE, MONGO_URI_PORT } = process.env;
export const { MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_URI_PORT } = process.env;
export const { JWT_SECRET } = process.env;
export const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION } = process.env;
export const EXPIRES = 6 * 60 * 60;   // 6시간
// export const EXPIRES = 3 * 60;   // 6시간