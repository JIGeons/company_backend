/**
 * Contact Interface
 */

import { ContactStatusEnum } from '@utils/enum';

// Contact 인터페이스 정의
export interface Contact {
  name: string;
  email: string;
  phone: string;
  message: string;
  status: ContactStatusEnum;
  createdAt: Date;
}