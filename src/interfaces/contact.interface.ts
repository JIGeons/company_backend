/**
 * Contact Interface
 */
import { ContactStatusEnum } from '@utils/enum';
import { Document } from "mongoose";

// Contact 인터페이스 정의
export interface Contact {
  name: string;
  email: string;
  phone: string;
  message: string;
  status: ContactStatusEnum;
  createdAt: Date;
}

// ContactModel 인터페이스 정의
export interface ContactDocument extends Contact, Document {}