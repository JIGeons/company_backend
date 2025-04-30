declare namespace NodeJS {
  /* 환경변수 타입 확장 */
  interface ProcessEnv {

    VERSION: string;
    SERVER: string;
    SERVER_URI: string;
    PORT: number;

    // JWT
    ACCESS_SECRET: string;
    REFRESH_SECRET: string;

    // Redis
    REDIS_URI: string;

    // MongoDB
    MONGO_URI: string;
    MONGO_ROOT_USER: string;
    MONGO_ROOT_PASSWORD: string;
    MONGO_DATABASE: string;
    MONGO_URI_PORT: string;

    // MySQL
    MYSQL_USER: string;
    MYSQL_PASSWORD: string;
    MYSQL_URI_PORT: string;
    MYSQL_ROOT_PASSWORD: string;
    MYSQL_DATABASE: string;

    // AWS 설정
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_BUCKET_NAME: string;
    AWS_REGION: string;
  }
}