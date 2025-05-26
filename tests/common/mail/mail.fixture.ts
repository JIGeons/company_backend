/**
 * Mail Fixtures 파일
 * Mail 정적 테스트 데이터 생성
 */
import { Result } from "@/interfaces/result.interface";
import { MailOptions } from "@/interfaces/mail.interface";

// MailService 응답 결과 Fixture
export const mailResultFixture: Result = {
  success: false,
  data: null,
  error: null,
}

// MailOptions Fixture
export const mailOptionsFixture: MailOptions = {
 to: "receiver@test.com",
 subject: "send mail title",
 html: "send mail content with html"
}

export const sendMailResultFixture = {
  accepted: [ 'receiver@test.com' ], // 받는 사람 메일
  rejected: [],
  ehlo: [
    'SIZE 39845888',
    '8BITMIME',
    'PIPELINING',
    'SMTPUTF8',
    'AUTH PLAIN LOGIN',
    'ENHANCEDSTATUSCODES'
  ],
  envelopeTime: 28,
  messageTime: 343,
  messageSize: 298,
  response: '250 2.0.0 OK aHbCHdu-S+qOMXMuHYLrug - nsmtp',
  envelope: { from: 'cwltjd98@naver.com', to: [ 'receiver@test.com' ] },
  messageId: '<c128254b-eca0-febf-090e-b952568f54d6@naver.com>'
}