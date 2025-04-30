/**
 * MongoDB index.ts 파일
 */

import mongoose from "mongoose";
import { Container } from "typedi";
import { MONGO_ROOT_USER, MONGO_ROOT_PASSWORD, MONGO_URI_PORT, MONGO_DATABASE } from "@/config";

// MongoDB 연결 메서드
export const connectToMongoDB = async () => {
  const mongoURI = `mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@${MONGO_URI_PORT}/${MONGO_DATABASE}?authSource=admin`;
  await mongoose.connect(mongoURI)  // MongoDB 연결
    .then(() => { console.log("Mongo DB 연결 성공.")})
    .catch((error) => {
      console.error('Mongo DB 연결 실패( error: ', error, ' )');
      return ;
    });
}

// 모델 import
import ContactModel from "./models/contact.model";
import PostModel from "./models/post.model";

// 모델 생성
const Contact = ContactModel();
const Post = PostModel();

// 의존성 주입
Container.set("ContactModel", Contact);
Container.set("PostModel", Post);

// MongoDB 정의
export const MONGODB = {
  mongoose,

  // 모델 주입
  Contact,
  Post
};