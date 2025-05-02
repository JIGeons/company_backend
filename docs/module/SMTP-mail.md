# Mail 모듈 설명

이 모듈은 네이버 SMTP 기반의 메일 전송 기능을 제공하며,</br>
설정 초기화(Config), 비즈니스 로직(Service), 템플릿 렌더링(Util)의 책임을 분리하여 설계하였다.

---

### ✅ 메일 전송 흐름 개요

1. 앱 시작 시 `createMailTransporter()`를 한 번만 호출하여 SMTP 연결을 초기화하고 DI 컨테이너에 등록한다.
2. `MailService` 클래스는 의존성 주입을 통해 등록된 메일 트랜스포터를 사용하여 메일을 전송한다.
3. 메일 내용은 EJS 템플릿(`.ejs`) 파일을 렌더링하여 동적으로 생성한다.

---

### 🔗 `createMailTransPorter()`

- SMTP 서버와의 연결을 초기화하고, Nodemailer 트랜스포터를 DI 컨테이너에 등록하는 메서드이다.
- 이 메서드는 라우터 객체 생성 이전, 데이터베이스 연결과 함께 호출하여,</br>
  앱 실행 시 SMTP 의존성이 누락되는 오류를 방지했다.

---

### 📦 메일 서비스의 주요 기능

- 메일 전송 - `sendMail(data)`
  - 순수하게 입력받은 정보로 메일을 전송하는 메서드
- 비정상 접근 대응 - `sendAbnormalAccessVerificationEmail(user, ip)`

  비정상 접근이 발생했을 경우, 사용자에게

  - 접근한 IP와 시간
  - 계정을 재활성화할 수 있는 URL

  을 포함한 알림 메일을 전송하는 메서드


---

### 📨 메일 발송 템플릿 구조

```
src/templates/
     └─ abnormalAccess.template.ejs   // 비정상 접근 알림용 메일 템플릿
```

- 템플릿은 `mail.util.ts`의 `renderMailTemplate()`를 통해 렌더링되며, </br>
  HTML 형태의 문자열로 메일 본문에 삽입된다.

---

### ✅ 예시 흐름: 비정상 접근 메일 전송

```tsx
await mailService.sendAbnormalAccessVerificationEmail(userInfo, clientIp);
```

- 인증코드 생성 → 검증 URL 생성
- 템플릿 렌더링 → 메일 전송
- 결과 반환 (메일 전송 성공 여부 + 인증코드)

---

## 📂 코드 분리 및 설계 원칙

### ✅ `mail.config.ts`

- 역할: 메일 서버 연결 설정 및 트랜스포터 생성
- 책임
  - SMTP 서버 설정 구성 (host, port, auth 등)
  - nodemailer를 이용한 메일 transporter 생성
  - 앱 실행 시 `createMailTransporter()`를 한 번만 호출하여 SMTP 연동 및 DI 컨테이너 등록
- 이유: 메일 전송 설정과 Transporter 생성을 Config 파일로 분리하여 초기 연결만을 관리

---

### ✅ `mail.service.ts`

- 역할: 메일 전송 비즈니스 로직을 수행
- 책임
  - 메일 옵션 설정 및 전송
  - 비정상 로그인 시 인증 메일 생성 및 전송
  - 결과 응답 처리 및 에러 로깅
- 이유: 메일 전송은 실제로 SMTP 서버에 요청을 보내는 비즈니스 로직이므로 service 계층에 위치

---

### ✅ `mail.util.ts`

- 역할: 템플릿 기반 메일 콘텐츠 렌더링
- 책임
  - `EJS` 템플릿 파일을 읽고, 데이터 바인딩하여 HTML 문자열 반환
- 이유: SMTP나 nodemailer와의 직접적인 연관이 없고, 순수한 문자열 렌더링만 수행하므로 유틸로 분리