/**
 * MongoDB index.ts 파일
 */

import mongoose from "mongoose";
import { MONGO_ROOT_USER, MONGO_ROOT_PASSWORD, MONGO_URI_PORT, MONGO_DATABASE } from "@/config";

// MongoDB 연결 메서드
export const connectToMongoDB = async () => {
  const mongoURI = `mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@${MONGO_URI_PORT}/${MONGO_DATABASE}?authSource=admin`;

  return await mongoose.connect(mongoURI)
    .then(() => { console.log("Mongo DB 연결 성공.")})
    .catch((error) => {
      console.error('Mongo DB 연결 실패( error: ', error, ' )');
      return ;
    });
}

// 모델 import
import UserModel from '@models/user.model';

// 모델 주입
const User = UserModel();

export const MONGODB = {
  mongoose,
  User,
};