/**
 * Mail config 파일
 */
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } from "@config/index";

/**
 * SMTP 메일 서버 구성 설정 객체
 */
export const mailConfig = {
  host: SMTP_HOST,            // SMTP 서버 호스트 주소 (예: smtp.naver.com. smtp.google.com 등)
  port: Number(SMTP_PORT),    // SMTP 서버 포트 번호 (보통 SSL은 465, TLS는 587)
  secure: false,              // true일 경우 SSL 보안 연결 사용
  auth: {                     // 인증 정보: 메일 서버 로그인 계정
    user: SMTP_USER,          // SMTP 로그인 계정 (발신자 이메일 주소)
    pass: SMTP_PASSWORD,      // SMTP 로그인 비밀번호 (일반 비밀번호 or 앱 비밀번호)
  }
}