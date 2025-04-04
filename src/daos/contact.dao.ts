/**
 * contact.dao.ts
 */
import { Service } from "typedi";
import { Types } from "mongoose";

// Model
import Contact from '@models/contact.model';

// Interface
import { Result } from "@interfaces/result.interface";

// DTO
import { CreateContactDto } from "@/dtos/contact.dto";

// enum
import { ContactStatusEnum } from "@utils/enum";

@Service()
export class ContactDao {
  async findAll(): Promise<Result> {
    try {
      const contactAllResult = await Contact.find().sort({ createdAt: -1 }).lean();  // 최신순으로 조회

      if (!contactAllResult || contactAllResult.length === 0) {
        return { success: false, data:[] }
      }

      return { success: true, data: contactAllResult };
    } catch (error) {
      return { success: false, error: "Contact 전체 조회 실패." }
    }
  }

  async findById(id: string | Types.ObjectId): Promise<Result> {
    try {
      const contactResult = await Contact.findById(id);

      if (!contactResult) {
        return { success: false, data:[] };
      }

      return { success: true, data: contactResult };
    } catch (error) {
      return { success: false, error: "Contact 조회 실패." };
    }
  }

  async create(contactData: CreateContactDto) {
    try {
      const contact = await new Contact(contactData).save();

      if (!contact) {
        return { success: false, data:[] };
      }

      return { success: true, data: contact };
    } catch (error) {
      return { success: false, error: "Contact 생성에 실패했습니다." };
    }
  }

  async updateById(id: string, updateData: Partial<CreateContactDto>) {
    try {
      const updateContactResult = await Contact.findByIdAndUpdate(id, updateData, { new: true }).lean();

      if (!updateContactResult) {
        return { success: false, data:[] };
      }

      return { success: true, data: updateContactResult };
    } catch (error) {
      return { success: false, error: "Contact 수정 중 문제 발생." };
    }
  }

  async delete(id: string): Promise<Result> {
    try {
      const deleteResult = await Contact.findByIdAndDelete(id);

      if (!deleteResult) {
        return { success: false, data:[] };
      }

      return { success: true, data: deleteResult };
    } catch (error) {
      return { success: false, error: "Contact 삭제 중 문제 발생." };
    }
  }
}