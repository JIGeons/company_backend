import { App } from '@/app';

import { connectToDatabases } from "@/database";
import { Routes } from "@interfaces/routes.interface";

let app: App;

// 테스트용 서버 실행
export const startTestServer = async (routes: Routes[]) => {
  await connectToDatabases();

  app = new App(routes);

  app.listen();
  return app;
}