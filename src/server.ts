import { App } from '@/app';

import { connectToDatabases } from "@/database";
import { createMailTransporter } from "@config/mail.config";

// Routes
import { ContactRoute } from '@routes/contact.route';
import { PostRoute } from '@routes/post.route';
import { UserRoute } from '@routes/user.route';
import { UploadRoute } from '@routes/upload.route';

// route생성 전 데이터 베이스 먼저 연결
connectToDatabases()
  // routes 생성 전 의존성 생성 메일 Transport 생성 및 Container 등록
  .then(() => { createMailTransporter(); })
  .then(() => {
    console.log("DB 연결 완료 이후 앱 실행");

    const routes = [
      new ContactRoute(),
      new PostRoute(),
      new UserRoute(),
      new UploadRoute(),
    ]
    // DB 연결 이후 App 실행
    const app = new App(routes);
    app.listen();
});