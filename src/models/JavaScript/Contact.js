const mongoose = require('mongoose');

const ContactStatusEnum = {
  IN_PROGRESS : "IN_PROGRESS",
  PENDING : "PENDING",
  COMPLETED :  "COMPLETED",
}

const contactSchema = new mongoose.Schema(
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

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;