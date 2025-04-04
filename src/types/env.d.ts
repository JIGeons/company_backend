declare namespace NodeJS {
  /* 환경변수 타입 확장 */
  interface ProcessEnv {
    MONGO_URI: string;    // MongoDB

    JWT_SECRET: string;   // JWT

    // AWS 설정
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_BUCKET_NAME: string;
    AWS_REGION: string;
  }
}