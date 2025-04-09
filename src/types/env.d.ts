declare namespace NodeJS {
  /* 환경변수 타입 확장 */
  interface ProcessEnv {

    VERSION: string;
    SERVER: string;
    SERVER_URI: string;
    PORT: number;

    JWT_SECRET: string;   // JWT
    REDIS_URI: string;    // Redis

    // MongoDB
    MONGO_URI: string;
    MONGO_ROOT_USER: string;
    MONGO_ROOT_PASSWORD: string;
    MONGO_DATABASE: string;
    MONGO_URI_PORT: string;

    // AWS 설정
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_BUCKET_NAME: string;
    AWS_REGION: string;
  }
}