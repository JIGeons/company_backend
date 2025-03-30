# 🏢 나만의 회사 웹사이트 - Backend (Node.js + Express)

React 프론트엔드와 연동되는 백엔드 서버로,  
**회원 인증(JWT), 게시글 저장, 이미지 업로드(AWS S3)** 기능을 구현한 학습용 프로젝트입니다.  
MongoDB Atlas와 AWS S3를 연동하고, JWT는 **HTTP-only 쿠키 방식**으로 처리하여  
보안성과 실무 흐름에 대한 이해를 목표로 구성하였습니다.

---

## 🛠️ 사용 기술 (Tech Stack)

- **Language**: JavaScript (ES6+)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **ODM**: Mongoose
- **Authentication**: JWT (HTTP-only Cookie 기반)
- **File Storage**: AWS S3
- **Upload Handling**: Multer, Multer-S3
- **Environment Configuration**: dotenv

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

## 🔐 인증 처리 방식

- 로그인 시 JWT를 발급하여 **HTTP-only 쿠키에 저장**
- 쿠키 기반 인증 → `Authorization` 헤더 없이 인증 유지
- 클라이언트에서 JS로 쿠키 접근 불가 → **XSS 방어**
- 추후 **CSRF 대응 로직** 적용 예정

---
