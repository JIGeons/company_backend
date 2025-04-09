import { config } from "dotenv";
import * as process from "node:process";
config({ path: `.env.${process.env.NODE_ENV || 'test'}` });

export const NODE_ENV = process.env.NODE_ENV || 'test';
export const { PORT } = process.env;
export const { SERVER_URI, REDIS_URI } = process.env;
export const { MONGO_URI, MONGO_ROOT_USER, MONGO_ROOT_PASSWORD, MONGO_DATABASE, MONGO_URI_PORT } = process.env;
export const { JWT_SECRET } = process.env;
export const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION } = process.env;