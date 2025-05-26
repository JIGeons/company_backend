/**
 * Mail Service 단위 테스트 파일
 */
import { describe } from "node:test";
import { MailService } from "@/services/mail.service";
import { Container } from "typedi";
import * as MailUtils from "@/utils/mail.util";
import * as Utils from "@/utils/utils";
// Interface
import { MailOptions } from "@/interfaces/mail.interface";

// Mock 데이터
import { unitMockTransporter } from "./mail.mock";
import { mailOptionsFixture, sendMailResultFixture } from "./mail.fixture";
import { userFixtures } from "@tests/user/user.fixtures";

describe("MailService Unit Test", () => {
  let mailService: MailService;

  beforeEach(() => {
    Container.set("mailTransporter", unitMockTransporter);

    mailService = new MailService(unitMockTransporter);
  });

  describe("sendMail()", () => {
    const sendData: MailOptions = { ...mailOptionsFixture }

    it("receiver@test.com으로 메일 전송을 성공하고 데이터를 반환한다.", async () => {
      unitMockTransporter.sendMail.mockResolvedValue({ ...sendMailResultFixture });

      const response = await mailService.sendMail(sendData);
      expect(response).toEqual({ success: true , data: {...sendMailResultFixture }});
    });

    it("메일 전송에 실패하여 error 메세지를 반환한다.", async () => {
      unitMockTransporter.sendMail.mockRejectedValue({});

      const response = await mailService.sendMail(sendData);
      expect(response.success).toEqual(false);
      expect(response.data).toEqual(null);
    });
  });

  describe("sendAbnormalAccessVerificationEmail()", () => {
    const verificationCode = "12345678";
    const dateToString = "2025.05.26 PM 02:30";
    const htmlTemplate = "<html>test-template</html>";
    let sendMailMock: jest.SpyInstance;

    const userInfo = { ...userFixtures };
    const clientIp = '1.2.3.4';

    beforeEach(() => {
      // 필수 함수 mock
      jest.spyOn(Utils, "generateVerificationCode").mockReturnValue(verificationCode);
      jest.spyOn(Utils, "formatDateToDateAMPM").mockReturnValue(dateToString);
      jest.spyOn(MailUtils, "renderMailTemplate").mockResolvedValue(htmlTemplate);

      sendMailMock = jest.spyOn(mailService, "sendMail");
    });

    // 각 테스트를 실행 후 Mock 초기화
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("정상적으로 비정상 접근 알림 메일을 보내고, verificationCode와 sendMailResult를 반환한다.", async () => {
      // sendMail 성공 케이스
        sendMailMock.mockResolvedValue({
          success: true,
          data: { ...sendMailResultFixture },
        });

        const response = await mailService.sendAbnormalAccessVerificationEmail(userInfo, clientIp);

        expect(Utils.generateVerificationCode).toHaveBeenCalled();
        expect(MailUtils.renderMailTemplate).toHaveBeenCalledWith("abnormalAccess", expect.any(Object));
        expect(sendMailMock).toHaveBeenCalledWith({
          to: userInfo.email,
          subject: expect.stringContaining(userInfo.name),
          html: htmlTemplate
        });

        expect(response.success).toBe(true);
        expect(response.data.verificationCode).toBe(verificationCode);
        expect(response.data.sendData).toEqual({ ...sendMailResultFixture });
    });

    it("메일 전송 실패시, error를 반환한다.", async () => {
      sendMailMock.mockResolvedValue({
        success: false,
        error: "SMTP 오류"
      });

      const result = await mailService.sendAbnormalAccessVerificationEmail(userInfo, clientIp);
      expect(result.success).toBe(false);
      expect(result.error).toBe("SMTP 오류");
    });
  });
});