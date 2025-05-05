# **🏢 나만의 회사 웹사이트 - Backend (Node.js + Express)**

이 프로젝트는 **JWT, MongoDB, AWS를 학습**하기 위한 백엔드 서버로 **인프런 강의**를 기반으로 시작했습니다.

강의 수강 이후, 백엔드 구조를 **Node.js + TypeScript**로 **직접 재설계하며 고도화 중인 개인 프로젝트**입니다.

- 서비스 간 결합도를 낮추기 위해, **책임분리**와 **의존성 주입(DI)** 기반으로 설계하도록 노력했습니다.
- **테스트 코드를 작성**하여, 새로운 서비스 추가나 기존 코드 수정시 **테스트 코드를 실행**하여 프로젝트에 안정성을 유지하고자 하였습니다.
- 협업을 대비해, **사용 모듈 및 설계 방식을 Markdown 문서로 정리**하는 습관을 기르고 있습니다.

> ⏱ **개발 기간**: 2025.03.18 ~ (진행 중) </br>
⌛ **강의 수강 기간**: 2025.03.18 ~ 2025.03.29 </br>
⏳ **고도화 기간**: 2025.03.30 ~ (진행 중)

---

## 📖 목차

1. [🚀 실행 방법](#-실행-방법)
2. [🛠 기술 스택](#-기술-스택-tech-stack)
3. [✨ 주요 구현 기능](#-주요-구현-기능)
4. [🏗 아키텍처 설계](#-시스템-아키텍처)
5. [📚 학습한 내용](#-학습한-내용)
6. [🔧 프로젝트 고도화 내용](#-프로젝트-고도화-내용)
7. [📈 앞으로의 개선 방향](#-앞으로의-개선-방향)
8. [📦 모듈별 설계 방식](#-모듈별-설계-방식)

---

## **🚀 실행 방법**

**👉 [📄 실행 가이드 보러가기](./docs/SETUP.md)**

---

## **🛠️ 기술 스택 (Tech Stack)**

| **분류** | **기술 스택** |
| --- | --- |
| **Framework** | `Node.js 23.x`, `Express.js` |
| **Language** | `TypeScript 5.x` (초기 개발은 JavaScript(ES6+), 이후 리팩토링) |
| **DBMS / ODM ORM** | `MongoDB`, `MySQL`, `Mongoose`, `typeORM` |
| **Public Cloud** | `AWS` (EC2 - 서버 배포, S3 - 이미지/파일 업로드) |
| **Test** | `Jest` |
| **DevOps** | `Docke`, `Docker Compose`, `dotenv` |
| **Others** | `JWT`, `Redis`, `SMTP`, `Multer` |

---

## ✨ **주요 구현 기능**

### 🔹 Node 기반 아키텍처 설계

- ExpressJS + Node 환경에서 서비스 구조를 설계하고, 라우팅, 미들웨어, 비즈니스 로직을 계층별로 분리하여 구현했습니다.
- MongoDB와 MySQL을 동시에 사용하는 멀티 데이터베이스 구조로 다양한 데이터를 효율적으로 처리할 수 있도록 설계하였습니다.
- DI 기반 서비스 구조와 유틸/리스너 분리를 통해 유지보수성과 재사용성을 높였습니다.

<details>

<summary>프로젝트 구조</summary>

  ```
  ├── src/
  │   ├── app.ts
  │   ├── server.ts
  │   ├── controllers/
  │   │   ├── contact.controller.ts
  │   │   ├── post.controller.ts
  │   │   ├── upload.controller.ts
  │   │   └── user.controller.ts
  │   ├── services/
  │   │   ├── contact.service.ts
  │   │   ├── file.service.ts
  │   │   ├── mail.service.ts
  │   │   ├── post.service.ts
  │   │   ├── redis.service.ts
  │   │   ├── token.service.ts
  │   │   ├── upload.service.ts
  │   │   └── user.service.ts
  │   ├── daos/
  │   │   ├── mongo/
  │   │   │   ├── contact.dao.ts
  │   │   │   └── post.dao.ts
  │   │   └── mysql/
  │   │       └── user.dao.ts
  │   ├── dtos/
  │   │   ├── mongo/
  │   │   │   ├── contact.dto.ts
  │   │   │   └── post.dto.ts
  │   │   └── mysql/
  │   │       └── user.dto.ts
  │   ├── database/
  │   │   ├── mongo/
  │   │   │   ├── models/
  │   │   │   │   ├── contact.model.ts
  │   │   │   │   └── post.model.ts
  │   │   │   └── index.ts
  │   │   ├── mysql/
  │   │   │   ├── models/
  │   │   │   │   └── user.model.ts
  │   │   │   ├── repository/
  │   │   │   │   └── user.repository.ts
  │   │   │   └── index.ts
  │   │   └── index.ts
  │   ├── middlewares/
  │   │   ├── apiLogger.middleware.ts
  │   │   ├── auth.middleware.ts
  │   │   └── error.middleware.ts
  │   ├── config/
  │   │   ├── index.ts
  │   │   ├── mail.config.ts
  │   │   └── redis.config.ts
  │   ├── listeners/
  │   │   └── logout.hanlder.ts
  │   └── templates/
  │       ├── mail/
  │       │   └── abnormalAccess.template.ejs
  │       └── account-verify.template.ejs
  ├── tests/
  │   ├── __mock__/    // 비어있는 디렉토리
  │   ├── factory/
  │   │   ├── contact.factory.ts
  │   │   ├── file.factory.ts
  │   │   ├── post.factory.ts
  │   │   └── user.factory.ts
  │   ├── fixtures/    // 비어있는 디렉토리
  │   ├── integration/
  │   │   ├── controller/
  │   │   │   └── contact.int.test.ts
  │   │   ├── listener/
  │   │   │   └── logout.ini.test.ts
  │   │   └── service/    // 비어있는 디렉토리
  │   ├── unit/
  │   │   └── service/
  │   │       ├── post.service.test.ts
  │   │       └── upload.service.test.ts
  │   └── test-server.ts
  ├── docker-compose.dev.yml
  ├── Dockerfile
  └── README.md
  ```


</details>

### 🔹 JWT 기반 인증 시스템 구현: Refresh Token Rotation 패턴

- Access Token은 헤더로, Refresh Token은 HTTP-Only 쿠키로 관리합니다.
- Refresh Token Rotation 패턴을 적용해 매 재발급 시 토큰을 폐기하고 새 토큰으로 교체합니다.
- 새 Refresh Token은 Redis에 저장되며, 재사용 방지를 통해 보안을 강화했습니다.

### 🔹 MongoDB를 활용한 게시글(Post) 데이터 관리

- MongoDB의 스키마 유연성을 활용하여 게시글의 메타데이터, 첨부파일 경로 등 비정형 데이터를 효율적으로 저장하였습니다.
- 게시글에 여러 개의 파일을 첨부할 수 있도록, URI를 배열 형태로 관리하는 구조로 설계하였습니다.
- 동일한 유저(IP + User-Agent)가 반복 조회 시 조회수가 과도하게 증가하는 것을 방지하기 위해 `viewLogs` 필드를 도입하고, 중복 조회를 제한하는 로직을 구현하였습니다.
- 게시글 관련 도메인을 DAO/DTO/Service 레이어로 분리하여 비즈니스 로직의 명확성과 테스트 용이성을 확보했습니다.

### 🔹 AWS S3에서 게시글 첨부파일 관리

- 게시글 작성 시, 본문 이미지 및 첨부파일을 AWS S3에 업로드하여 외부 저장소로 분리 관리하였습니다.
- 게시글 삭제 시, 해당 게시글에 연결된 모든 파일을 S3에서 함께 제거하였습니다.
- 게시글 수정 시, 기존 파일의 삭제 및 신규 파일 업로드를 반영하여 S3 내 파일 상태를 동기화하였습니다.

### 🔹 Redis 기반 세션 저장 및 자동 로그아웃 처리 (Keyspace Notification 활용)

- Redis를 활용하여 `LOGIN`, `REFRESH`, `BLACKLIST` 상태를 관리하도록 설계하였습니다.
- 로그인 시 Access Token을 Redis에 저장하고, TTL 만료 시 Keyspace Notification 이벤트를 통해 자동 로그아웃을 처리하였습니다.
- Refresh Token은 유저별로 Redis에 저장되며, 한 번 사용된 토큰은 폐기되어 재사용을 방지합니다.
- 로그아웃 시, 해당 Access Token은 만료 시간까지 Redis의 `BLACKLIST`에 등록되어 더 이상 사용되지 않도록 차단하였습니다.

### 🔹 GitHub Actions 기반 CI 설정

- GitHub Actions 워크플로우(`push-pull.yml`)를 통해 develop 브랜치의 코드 변경 시
  자동 테스트를 실행하도록 설정하였습니다.

### 🔹 배포

- Docker Hub에 이미지를 푸시한 후, AWS EC2에서 수동으로 컨테이너를 실행하여 배포하였습니다.

---

## **🏗 시스템 아키텍처**

![ABC-Company 시스템 아키텍처 가로](https://github.com/user-attachments/assets/a0498550-38e6-46fb-8ca1-e9254ec3f53e)

---

## 📚 학습한 내용

### 1. JWT   **👉 [자세히 보기](./docs/learning/JWT.md)**

### 2. MongoDB   **👉 [자세히 보기](./docs/learning/Mongo.md)**

### 3. AWS   **👉 [자세히 보기](./docs/learning/AWS.md)**

---

## 🔧 **프로젝트 고도화 내용**

### 🔶 **JavaScript → TypeScript 마이그레이션 + 계층형 아키텍처 재설계**

- 타입 안정성 및 자동완성 향상을 위해 전체 코드 TypeScript로 전환하였습니다.
- Controller / Service / DAO 계층으로 분리하고 의존성 주입(DI) 기반 설계를 하였습니다.
- 관심사 분리를 통해 테스트 용이성과 유지보수성을 확보하였습니다.

### 🔶 User 스키마 MongoDB → MySQL로 마이그레이션

- 초기에는 User 데이터를 MongoDB에 저장했으나, 사용자 정보는 명확한 정형 구조를 가짐
- 관계형 데이터 모델에 적합한 MySQL로 이전하여 스키마 관리 및 데이터 무결성 향상

### 🔶 JWT 기반 인증 시스템 개선

- 초기에는 단순 JWT 발급 방식이었으나, 보안 강화를 위해 Refresh Token Rotation 패턴으로 개선
- Refresh Token 재발급 시 Redis `LOGIN`, `REFRESH`에 저장 및 TTL을 갱신하고, 이전 토큰은 폐기하여 재사용 방지
- 로그아웃 시 Access Token을 Redis `BLACKLIST`에 등록되어 만료 시점까지 차단

### 🔶 **Redis를 활용한 자동 로그아웃 기능**

- TTL 만료 이벤트 발생 시, Redis KeyName을 `prefix:key:suffix` 형태에서 `:` 기준으로 파싱
- prefix가 `LOGIN`인 경우, 5초간 유효한 임시 토큰을 발급하여 로그아웃 API를 자동 호출
- 비정상 세션 종료를 방지하고, 만료 이벤트 기반으로 로그아웃을 자동화

### 🔶 **Jest 기반 테스트 코드 작성**

- 주요 서비스 로직에 대한 **단위 테스트(Unit Test)** 작성하였습니다.
- Redis 이벤트 기반 로그아웃 흐름을 포함한 **통합 테스트(Integration Test)** 구성하였습니다. </br>
> ex. TTL 만료 시 `logoutHandler` 동작 검증
- 테스트 디렉토리 구조 설계 및 Mock 전략을 적용했습니다.

### 🔶 **Docker 기반 배포 환경 구성**

- `Dockerfile`, `docker-compose.yml` 작성으로 로컬/운영 환경을 통합하였습니다.
- Node.js, MongoDB, MySQL, Redis 서비스를 컨테이너 기반으로 통합 관리하였습니다.
- Docker Hub → AWS EC2 배포 프로세스를 구축하였습니다. </br>
> 로컬 빌드 → Hub 푸시 → EC2 pull → 컨테이너 실행

---

## 📈 앞으로의 개선 방향

### 1. 문의사항(Contact) 스키마 MySQL로 마이그레이션

- 정형 구조를 가진 문의사항 데이터를 현재 MongoDB(비정형 저장소)에 저장하고 있음
- 데이터 특성에 적합한 관계형 DB인 MySQL로 이전하여, 구조적 일관성과 관리 편의성 확보

### 2. AWS S3 파일 업로드 수정

- 문제: 게시글 첨부파일 업로드 시 같은 이름의 파일이 있는 경우 해당 파일이 덮어쓰기가 된다.
- 해결 방법: 첨부파일 업로드 시 S3에 게시글별 디렉토리를 생성하여 저장

### 3. Swagger 문서 작성

- 문제 : API 명세가 존재하지 않아 사용하는 API의 요청/응답의 데이터를 알 수 없다.
- 해결 방법: Swagger 패키지를 사용하여 API 명세 문서화

### 4. 테스트 코드의 다양화

- 문제: 테스트를 하고 있는 서비스에 양이 몇 개 되지 않아 신규 구현 및 수정 시 정상작동 여부를 알 수 없는 서비스도 존재
- 해결 방법: 현재 사용중인 서비스의 테스트 코드 작성

### 5. GitHub Actions + Docker 활용 CI/CD 자동화 파이프라인 구축

- 문제: 서버 배포 시 Docker 이미지 생성 Docker Hub 업로드 등 배포에 관련 모든 작업이 수동으로 이루어진다.
- 해결 방법: GibHub Actions를 활용하여 AWS EC2 서버에 자동 배포

### 6. 이메일 인증 & 인증번호 확인 API 개발

- 문제: 회원가입 시 이메일 검증을 하지 않아 이메일이 유효한 이메일인지 확인이 불가능하다.
- 해결 방법:
  - 이메일 인증 API 개발 </br>
  - 인증번호 생성 메서드를 사용하여 유저가 입력한 이메일로 인증번호를 전송하고 Redis에 저장 후 이메일 전송 성공/실패 결과 반환
  - 인증번호 확인 API 개발 </br>
  - 인증번호를 입력받으면 서버는 Redis에 저장된 인증번호를 확인하고 인증 성공/실패 결과 반환

---

## 📦 모듈별 설계 방식

**👉 [Redis](./docs/module/Redis.md)** </br>
**👉 [mail(SMTP)](./docs/module/SMTP-mail.md)**

