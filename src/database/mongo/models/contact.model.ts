import mongoose, { Schema, Model } from 'mongoose';

// Interface
import { Contact } from '@interfaces/contact.interface';

// Enum
import { ContactStatusEnum } from '@utils/enum';

const contactSchema: Schema<Contact> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // 공백 제거
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ContactStatusEnum),
      default: ContactStatusEnum.IN_PROGRESS,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }, {
    timestamps: true,
  }
);

// Contact 모델 생성
const Contact: Model<Contact> = mongoose.model<Contact>("Contact", contactSchema);

export default Contact;