import { App } from '@/app';

import { ContactRoute } from '@routes/contact.route';
import { PostRoute } from '@routes/post.route';
import { UserRoute } from '@routes/user.route';
import { UploadRoute } from '@routes/upload.route';

import { connectToDatabases } from "@/database";
import { Routes } from "@interfaces/routes.interface";

// route생성 전 데이터 베이스 먼저 연결
connectToDatabases().then(() => {
  console.log("DB 연결 완료 이후 앱 실행");
  // DB 연결 이후 App 실행
  const app = new App([
    new ContactRoute(),
    new PostRoute(),
    new UserRoute(),
    new UploadRoute(),
  ]);


  app.listen();
});