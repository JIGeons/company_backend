/**
 * Mail Service.ts
 */
import { Inject, Service } from 'typedi';
import { Transporter } from "nodemailer";
import ejs from 'ejs';
import path from "path";
import { mailConfig } from "@config/mail.config";

// interface
import { MailOptions } from "@interfaces/mail.interface";
import { Result } from "@interfaces/result.interface";

/**
 * 메일 서비스 Class
 */
@Service()
export class MailService {
  constructor(
    // 메일 Transporter 의존성 주입
    @Inject("mailTransporter")
    private readonly mailSender: Transporter,
  ) {}

  /**
   * 메일을 전송하는 메서드
   * @param sendData = {
   *   to:        수신자 메일
   *   subject:   전송 메일 제목
   *   html:      전송하려는 내용 (ejs 파일)
   * }
   */
  public async sendMail(sendData: MailOptions): Promise<Result> {
    const result: Result = { success: false, data: null };
    // 메일 전송 옵션 설정
    const mailOptions = {
      from: `"${mailConfig.senderName}" <${mailConfig.senderEmail}>`,
      ...sendData,
    }

    try {
      // 메일 전송
      const sendMailResult = await this.mailSender.sendMail(mailOptions);
      console.log("### SendMailResult: ", sendMailResult);

      result.success = true;
      result.data = sendMailResult;
      return result;
    } catch (error) {
      console.error("!-- 매일 전송 실패: ", error);
      result.error = error instanceof Error ? error.message : String(error);
      return result;
    }
  }
}