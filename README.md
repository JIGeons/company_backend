# 🏢 나만의 회사 웹사이트 - Backend (Node.js + Express)

React 프론트엔드와 연동되는 백엔드 서버로,  
**회원 인증(JWT), 게시글 저장, 이미지 업로드(AWS S3)** 기능을 구현한 학습용 프로젝트입니다.  
MongoDB Atlas와 AWS S3를 연동하고, JWT는 **HTTP-only 쿠키 방식**으로 처리하여  
보안성과 실무 흐름에 대한 이해를 목표로 구성하였습니다.

---

## 🛠️ 사용 기술 (Tech Stack)

| 분류            | 기술 스택                                                                 |
|-----------------|---------------------------------------------------------------------------|
| **Framework**   | Node.js, Express.js                                                       |
| **Language**    | TypeScript 5.x (초기 개발은 JavaScript(ES6+), 이후 리팩토링)                    |
| **DBMS / ODM**  | MongoDB, Mongoose                                                         |
| **Public Cloud**| AWS (EC2 - 서버 배포, S3 - 이미지/파일 업로드)                                   |
| **DevOps**      | Docker, Docker Compose, dotenv                                            |
| **Others**      | JWT(HTTP-only Cookie 기반), Redis, Multer, Multer-S3                       |


---

## 📌 주요 기능

- **회원가입 / 로그인**
  - JWT 발급 후 HTTP-only 쿠키에 저장
  - 로그인 실패 시 로그인 시도 횟수 증가 및 계정 비활성화 처리
  - 로그인 중복 방지 (동시 로그인 제한)

- **게시글 CRUD**
  - 게시글 등록 / 목록 조회 / 상세 조회
  - MongoDB에 게시글 및 사용자 정보 저장

- **이미지 업로드**
  - AWS S3에 이미지 업로드
  - 게시글 등록 시 이미지 URL을 DB에 저장

---

## 🚀 프로젝트 고도화

실무에 가까운 아키텍처와 보안, 유지보수성을 고려하여 아래와 같은 고도화를 진행하였습니다:

### 1. JavaScript → TypeScript 리팩토링
- 타입 안정성과 IDE 자동완성, 오류 방지를 위한 전체 코드베이스 마이그레이션

### 2. SOLID 원칙 기반 구조 설계
- 서비스, 컨트롤러, DAO 분리 및 의존성 주입 방식 설계
- 관심사 분리를 통한 테스트 용이성과 유지보수성 향상

### 3. Redis를 활용한 자동 로그아웃 기능
- Redis Keyspace Notification을 활용하여 자동 로그아웃 처리
- 실시간 보안 기능 강화

### 4. Jest 기반 테스트 코드 작성
- 주요 서비스 로직에 대한 **단위 테스트(Unit Test)** 작성
- Redis 이벤트 기반 로그아웃 흐름을 포함한 **통합 테스트(Integration Test)** 구성  
  → 예: Redis의 TTL 만료 이벤트 발생 시  `logoutHandler`가 정상 동작 테스트
- 테스트 디렉토리 구조 및 Mocking 전략 적용

### 5. Docker 기반 배포 환경 구성
- `Dockerfile`, `docker-compose.yml` 작성
- Node.js, MongoDB, Redis, Nginx 등의 서비스를 컨테이너 기반으로 통합 관리

---

## 🔐 인증 처리 방식

- 로그인 시 JWT를 발급하여 **HTTP-only 쿠키에 저장**
- 쿠키 기반 인증 → `Authorization` 헤더 없이 인증 유지
- 클라이언트에서 JS로 쿠키 접근 불가 → **XSS 방어**

---
