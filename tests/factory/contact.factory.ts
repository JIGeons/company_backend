/**
 * Contact Factory 파일
 */
import ContactModel from '@/database/mongo/models/contact.model';

export const createContact = async (overrides = {}) => {
  const contactData = {
    name: 'test',
    email: 'test@example.com',
    phone: '010-1234-5678',
    message: 'test message',
    ...overrides, // 사용자 정의 속성으로 덮어쓰기
  };

  const Contact = ContactModel();
  return await Contact.create(contactData);
}