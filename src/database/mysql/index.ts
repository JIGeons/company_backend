/**
 * MySQL index.ts 파일
 */
import { DataSource } from "typeorm";
import { HOST, MYSQL_URI_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } from "@/config";

// 모델 import
import { UserModel } from '@/database/mysql/models/user.model';

// entities 정의
const entities = [ UserModel ];

const mysqlDataSource = new DataSource({
  type: "mysql",
  host: HOST,
  port: Number(MYSQL_URI_PORT),
  username: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  synchronize: true,
  logging: false,
  entities: entities,
  subscribers: [],
  migrations: [],
});

// MySQL 연결 메서드
export const connectToMysql = async () => {
  console.log("MySQL 연결 시도...");

  await mysqlDataSource.initialize();
  console.log("MySQL 연결 완료");
  return ;
}

// Repository import
import { UserRepository } from "@database/mysql/repository/user.repository";

// Repository 주입
const User = UserRepository(mysqlDataSource);

export const MYSQL = {
  MySQL: mysqlDataSource,

  User
}