/**
 * test-server.ts
 */
import { App } from '@/app';

import { connectToDatabases } from "@/database";
import { createMailTransporter } from "@/config/mail.config";
import { Routes } from "@interfaces/routes.interface";

let app: App;

// 테스트용 서버 실행 전 의존성을 생성하는 메서드
export async function DIContainerSet () {
  await connectToDatabases();
  createMailTransporter();
}

// 테스트용 서버 실행
export const startTestServer = async (routes: Routes[]) => {
  app = new App(routes);

  app.listen();
  return app;
}