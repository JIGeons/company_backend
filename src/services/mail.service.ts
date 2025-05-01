/**
 * Mail Service.ts
 */
import { Inject, Service } from 'typedi';
import { Transporter } from "nodemailer";

// config
import { SERVER_URI } from "@/config";
import { mailConfig } from "@config/mail.config";

// interface
import { MailOptions } from "@interfaces/mail.interface";
import { Result } from "@interfaces/result.interface";
import { User } from "@interfaces/user.interface";

// Utils
import { renderMailTemplate } from "@utils/mail.util";
import { formatDateToDateAMPM, generateVerificationCode } from "@utils/utils";

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

  /**
   * 비정상 접근에 대한 메일을 생성하고 발송하는 메서드
   * @param userInfo - API 요청 토큰의 사용자 정보
   * @param clientIp - API 요청자의 IP
   */
  public async sendAbnormalAccessVerificationEmail(userInfo: User, clientIp: string | undefined): Promise<Result> {
    const result: Result = { success: false, data: null };

    // 인증코드 생성 (기본 8자리)
    const verificationCode = generateVerificationCode();
    const verificationUrl = `${SERVER_URI}/api/auth/verify?userId=${userInfo.userId}&code=${encodeURIComponent(verificationCode)}`;

    // 발송할 메일 생성
    const receiver = userInfo.email;
    const subject = `[ABC-Company] ${userInfo.name}님 계정으로 비정상 접근이 감지되었습니다.`;

    // AbnormalAccess 템플릿을 렌더링한다.
    const sendMailContent = await renderMailTemplate("abnormalAccess", {
      formattedTime: formatDateToDateAMPM(new Date()),
      ipAddress: clientIp || "IP 알 수 없음",
      verificationUrl: verificationUrl,
    });

    const sendMailData: MailOptions = {
      to: receiver,
      subject: subject,
      html: sendMailContent
    };

    // 메일 전송
    const sendMailResult = await this.sendMail(sendMailData);
    if (!sendMailResult.success) {
      console.error('메일 전송 실패: ', sendMailResult.error);
      result.error = sendMailResult.error;
    }

    result.success = true;
    result.data = {
      verificationCode: verificationCode,
      sendData: sendMailResult.data
    };

    return result;
  }
}