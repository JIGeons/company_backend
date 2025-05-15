/**
 * mail interface 정의 파일
 */
import { User } from "@interfaces/user.interface";
import { Result } from "@interfaces/result.interface";

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface MailServiceInterface {
  sendMail(sendData: MailOptions): Promise<Result>;
  sendAbnormalAccessVerificationEmail(userInfo: User, clientIp: string | undefined): Promise<Result>;
}