# Config/ Index.ts 설명

`config/index.ts`는 `.env.{NODE_ENV}` 파일에서 환경변수를 불러와 프로젝트 전역에 사용할 수 있도록 구성하는 설정 파일이다.

이 파일을 통해 환경 설정을 코드에서 직접 사용하는 대신, 하나의 진입접에서 관리할 수 있어 유지보수성과 일관성을 향상시켰다.

---

### ✅ 환경 변수 로드 방식

```tsx
config({ path: `.env.${process.env.NODE_ENV || 'test'}` });
```

- `NODE_ENV` 값에 따라 `.env.dev`, `.env.prod`, `.env.test` 등 특정 환경 파일을 자동으로 로드한다.
- `NODE_ENV`가 명시되지 않은 경우 기본값으로 `.env.test`를 사용한다.

---

### 📂 환경 변수 그룹

환경 변수는 목적에 따라 논리적으로 그룹화되어 export 했다.

### 관련 있는 환경 변수 데이터 별로 정의

```tsx
export const NODE_ENV = process.env.NODE_ENV || 'test';
export const UNIT_TEST = process.env.UNIT_TEST || 'false';
// Host 와 Port
export const { HOST, PORT } = process.env;
// URL 정보
export const { SERVER_URI, REDIS_URI } = process.env;
// MongoDB 정보
export const { MONGO_URI, MONGO_ROOT_USER, MONGO_ROOT_PASSWORD, MONGO_DATABASE, MONGO_URI_PORT } = process.env;
// MySQL 정보
export const { MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_URI_PORT } = process.env;
// JWT 관련 Secret 키
export const { ACCESS_SECRET, REFRESH_SECRET } = process.env;
// AWS 정보
export const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION } = process.env;
export const EXPIRES = 6 * 60 * 60;   // 6시간
```

**🧭 서버 실행 정보**

| 변수 | 설명 |
| --- | --- |
| `NODE_ENV`  | 실행 환경 (default: `'test'`) |
| `UNIT_TEST`  | 유닛 테스트 여부 (`true`/`false`) |
| `HOST`, `PORT`  | 서버 주소 및 포트 번호 |

### 🔗 서버 URI 및 Redis

| 변수 | 설명 |
| --- | --- |
| `SERVER_URI`  | 서버 베이스 URI |
| `REDIS_URI`  | Redis 연결 URI |

### 🍃 MongoDB 설정

| 변수 | 설명 |
| --- | --- |
| `MONGO_URI` | MongoDB 연결 URI |
| `MONGO_ROOT_USER` | Mongo 루트 사용자명 |
| `MONGO_ROOT_PASSWORD` | Mongo 루트 비밀번호 |
| `MONGO_DATABASE` | Mongo 기본 DB명 |
| `MONGO_URI_PORT` | MongoDB 포트 |

### 🐬 MySQL 설정

| 변수 | 설명 |
| --- | --- |
| `MYSQL_ROOT_PASSWORD` | MySQL 루트 비밀번호 |
| `MYSQL_DATABASE` | MySQL DB명 |
| `MYSQL_USER` | MySQL 사용자명 |
| `MYSQL_PASSWORD` | MySQL 사용자 비밀번호 |
| `MYSQL_URI_PORT` | MySQL 포트 |

### 🔐 JWT 관련

| 변수 | 설명 |
| --- | --- |
| `ACCESS_SECRET` | JWT AccessToken 서명 시크릿 키 |
| `REFRESH_SECRET` | JWT RefreshToken 서명 시크릿 키 |
| `EXPIRES` | AccessToken 기본 만료 시간 (6시간 = `6 * 60 * 60`) |

### ☁️ AWS S3 설정

| 변수 | 설명 |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | AWS 액세스 키 |
| `AWS_SECRET_ACCESS_KEY` | AWS 시크릿 키 |
| `AWS_BUCKET_NAME` | S3 버킷명 |
| `AWS_REGION` | S3 버킷 리전 |

📧 SMTP - 메일 설정

| 변수 | 설명 |
| --- | --- |
| `SMTP_HOST` | SMTP 서버 호스트 (예: `smtp.naver.com`) |
| `SMTP_PORT` | 포트 번호 (465: SSL, 587: TLS) |
| `SMTP_USER` | 발신자 이메일 계정 |
| `SMTP_PASSWORD` | SMTP 로그인 비밀번호 |
| `SMTP_SENDER_NAME` | 발신자 이름 (메일 상 표시) |
| `SMTP_SENDER_MAIL` | 발신자 이메일 주소 |

---

### 🛠️ 사용 예시

```tsx
import { NODE_ENV, PORT, REDIS_URI } from '@/config';

console.log(`[INFO] 현재 실행 환경: ${NODE_ENV}`);
console.log(`[INFO] Redis URI: ${REDIS_URI}`);
```

---

### `.env` 파일 구성 예시

```env
# 실행 환경
NODE_ENV=development
PORT=3000

# 서버
SERVER_URI=http://localhost:3000

# Redis
REDIS_URI=redis://localhost:6379

# MongoDB
MONGO_URI=mongodb://localhost:27017/mydb
MONGO_ROOT_USER=root
MONGO_ROOT_PASSWORD=secret
MONGO_DATABASE=mydb
MONGO_URI_PORT=27017

# MySQL
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=mydb
MYSQL_USER=myuser
MYSQL_PASSWORD=mypassword
MYSQL_URI_PORT=3306

# JWT
ACCESS_SECRET=myaccesssecret
REFRESH_SECRET=myrefreshsecret

# AWS
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=my-bucket
AWS_REGION=ap-northeast-2

# SMTP
SMTP_HOST=smtp.naver.com
SMTP_PORT=587
SMTP_USER=myemail
SMTP_PASSWORD=mailpassword
SMTP_SENDER_NAME=ABC-Company
SMTP_SENDER_MAIL=myemail@naver.com
```