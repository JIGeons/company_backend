import { Types } from "mongoose";
import { Service } from 'typedi';
import { HttpException } from "@exceptions/httpException";

// Interface
import { Result } from "@interfaces/result.interface";

// DTO
import { CreateContactDto, UpdateContactDto } from "@/dtos/contact.dto";

// Dao
import { ContactDao } from "@/daos/contact.dao";

@Service()
export class ContactService {
  constructor(
    private readonly contactDao: ContactDao,
  ) {}

  // Contact 전체 조회
  public async getAllContact(): Promise<Result> {
    const { success, data: contacts, error} = await this.contactDao.findAll();

    // 에러가 존재하는 경우
    if (error) {
      throw new HttpException(500, error);
    }

    // contact가 존재하지 않는 경우 error
    if (!success) {
      throw new HttpException(404, '문의 내역이 존재하지 않습니다.');
    }

    return { success: true, data: contacts };
  }

  // Contact Id로 조회
  public async findById(id: string | Types.ObjectId): Promise<Result> {
    const { success, data: contact, error } = await this.contactDao.findById(id);

    // 에러가 존재하는 경우
    if (error) {
      throw new HttpException(500, error);
    }

    // contact가 존재하지 않는 경우 error
    if (!success) {
      throw new HttpException(404, '문의를 찾을 수 없습니다.');
    }

    return { success: true, data: contact };
  }

  // Contact 생성
  public async createContact(createContactDto: CreateContactDto): Promise<Result> {
    const { success, data: contact, error } = await this.contactDao.create(createContactDto);

    // 에러가 존재하는 경우
    if (error) {
      throw new HttpException(500, error);
    }

    // contact가 존재하지 않는 경우 error
    if (!success) {
      throw new HttpException(404, '문의가 생성되지 않았습니다.');
    }

    return { success: true, data: contact };
  }

  // Contact 수정
  public async updateContact(updateContactDto: UpdateContactDto): Promise<Result> {
    const { success, data: contact, error } = await this.contactDao.updateById(updateContactDto.id, updateContactDto);

    if (error) {
      throw new HttpException(500, error);
    }

    if (!success) {
      throw new HttpException(404, '문의 수정에 실패했습니다.');
    }

    return { success: true, data: contact };
  }

  // Contact 삭제
  public async deleteContact(id: string): Promise<Result> {
    const { success, data: contact, error } = await this.contactDao.delete(id);

    if (error) {
      throw new HttpException(500, error);
    }

    if (!success) {
      throw new HttpException(404, '삭제할 문의가 없습니다.');
    }

    return { success: true, data: contact };
  }
}