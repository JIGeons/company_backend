/**
 * Contact Fixture 파일
 * Contact 정적 테스트 데이터
 */
import { Contact } from "@/interfaces/contact.interface";
import { ContactStatusEnum } from "@/utils/enum";

export const contactFixture: Contact = {
  name: "test contact title",
  email: "test@test.com",
  phone: "010-1234-5678",
  message: "test contact message",
  status: ContactStatusEnum.IN_PROGRESS,
  createdAt: new Date()
}