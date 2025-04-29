/**
 * database index.ts 파일
 */

import { NODE_ENV, UNIT_TEST } from "@/config";

import { connectToMongoDB, MONGODB } from "@/database/mongo";
import { connectToMysql, MYSQL } from "@database/mysql";

export const connectToDatabases = async () => {
  if (NODE_ENV === 'test' && UNIT_TEST === 'true') {
    console.log(`단위 테스트 DB 연결 안함.`);
    return;
  }

  // MongoDB, MySQL 연결
  await connectToMongoDB();
  await connectToMysql();
}

export const DB = {
  MONGO: MONGODB,
  MYSQL: MYSQL,
}