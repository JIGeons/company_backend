# 🛠️ 실행 방법 (Run Guide)

이 프로젝트는 백엔드 서버를 **로컬 또는 Docker에서 실행**할 수 있고,</br>
MongoDB, MySQL, Redis는 Docker로 실행합니다.

---

## 📦 환경 파일 구성

프로젝트 실행 전 환경 파일을 먼저 구성해야합니다.

루트 디렉토리에 `.env.dev` 파일을 생성하고, 아래 내용을 참고하여 설정해주세요.</br>
\* 중괄호 `{}` 안에는 본인의 값을 채워넣어주세요.</br>
\* 소문자로 작성된 내용은 그대로 사용해도 됩니다.

📄 .env.dev 예시 보기

```
# VERSION
VERSION=0.0.1-company

# SERVER
SERVER=TEST
SERVER_URI=http://127.0.0.1:3000
CLIENT_URI=http://127.0.0.1:5173

# HOST & PORT
HOST=127.0.0.1
PORT=3000

# JWT
ACCESS_SECRET={ SECRET_KEY }
REFRESH_SECRET={ SECRET_KEY }

# DATABASE (MONGO_DB)
MONGO_URI=mongodb://{ MONGO_ROOT_USER }:{ MONGO_ROOT_PASSWORD }@{ MONGO_URI_PORT }/{ MONGO_DATABASE }?authSource=admin
MONGO_ROOT_USER={ mongo }
MONGO_ROOT_PASSWORD={ 1234 }
MONGO_DATABASE={ abc-company }
MONGO_URI_PORT=127.0.0.1:27017

# DATABASE (MYSQL_DB)
MYSQL_DATABASE={ abc-company-mysql }
MYSQL_URI_PORT={ 3307 }
MYSQL_USER={ mysql }
MYSQL_PASSWORD={ 1234 }
MYSQL_ROOT_PASSWORD={ 1234 }

# REDIS
REDIS_URI=redis://127.0.0.1:6379

# AWS
AWS_ACCESS_KEY_ID={ AWS-ACCESS-KEY }
AWS_SECRET_ACCESS_KEY={ AWS-SECRET-ACCESS-KEY }
AWS_BUCKET_NAME={ S3-BUCKET-NAME }
AWS_REGION={ AWS-REGION }

# SMTP
SMTP_HOST={ smtp.naver.com }
SMTP_PORT={ 587 }
SMTP_USER={ naver_id }
SMTP_PASSWORD={ naver_password }
SMTP_SENDER_NAME={ ABC-Company }
SMTP_SENDER_MAIL={ naver_email }
```

---

## 1️⃣ 전체 Docker로 실행하기 (백엔드 포함)

### 1. `.env.dev` 설정 후, Docker Desktop을 실행해주세요.

### 2. 다음 명령어로 Docker 컨테이너를 실행합니다.

package.json 파일에 script로 설정해 두었기 때문에 궁금하신 분은 package.json 파일의 script를 확인해주세요.

```bash
npm run docker:dev:up
```

📦 `docker-compose.dev.yml` 기반으로 다음 컨테이너를 실행합니다.

- MongoDB / MySQL / Redis / 백엔드 서버 (Node.js)

🔗 백엔드 서버는 기본적으로 `http://localhost:3000` 에서 실행됩니다.

---

## 2️⃣ 백엔드 서버만 로컬에서 실행하기

### 3. 백엔드 컨테이너 중지

```bash
docker stop abc-company-server
```

또는 Docker Desktop GUI에서 직접 `abc-company-server` 컨테이너를 직접 종료해도 됩니다.

### 4. 로컬에서 백엔드 실행

```bash
npm install
npm run start:local
```

- 서버는 `.env.dev` 환경을 기반으로 실행됩니다.
- DB 및 Redis는 Docker에서 실행 중인 컨테이너에 연결됩니다.

---

## ✅ 확인

| 항목 | 경로 |
| --- | --- |
| API 서버 주소 | http://localhost:3000 |
| 헬스 체크 | http://localhost:3000/health |
| 환경 연결 | `.env.dev` 파일에서 설정한 URI 기준 |