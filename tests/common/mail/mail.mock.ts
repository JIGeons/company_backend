/**
 * Mail mock 파일
 */
import nodemailer, { Transporter } from "nodemailer";
import { MailService } from "@/services/mail.service";
import { MailServiceInterface } from "../../../src/interfaces/mail.interface";

// 단위 테스트용 Transporter mock 객체 생성
export const unitMockTransporter = {
  sendMail: jest.fn(),
} as unknown as jest.Mocked<Transporter>;

// mock Transporter 객체로 mockMailService 객체 생성
export const mailServiceWithTransporter: MailServiceInterface = new MailService(unitMockTransporter);

// 의존성 주입용 mockMailService 생성
export const mailServiceMock: jest.Mocked<MailServiceInterface> = {
  sendMail: jest.fn(),
  sendAbnormalAccessVerificationEmail: jest.fn(),
}

// 통합 테스트용 Transporter mock 객체 생성
export const intMockTransporter = nodemailer.createTransport({
  jsonTransport: true,  // 실제 전송은 안 하고 콘솔에 출력
});