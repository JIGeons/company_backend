import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { HttpException } from "@exceptions/httpException";

// DTO
import {CreateContactDto, UpdateContactDto} from "@/dtos/contact.dto";

// Service
import { ContactService } from "@services/contact.service";

export class ContactController {
  private contactService = Container.get(ContactService);

  /* ==================== GET ====================*/
  public getAllContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactResult = await this.contactService.getAllContact();

      res.json({ success: true, count: contactResult.data.length, data: contactResult.data, message: "문의 내용 조회 성공" });
    } catch (error) {
      console.log("### 문의 내용 전체 조회 오류: ", String(error));
      next(error);
    }
  };

  public getContactById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const contactResult = await this.contactService.findById(id);

      res.json({ success: true, data: contactResult.data, message: "문의 내용 조회 성공" });
    } catch (error) {
      console.log("### 문의 내용 조회(by contactId) 오류: ", String(error));
      next(error);
    }
  }

  /* ==================== POST ====================*/
  public addContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const createContactDto = plainToInstance(CreateContactDto, { ...req.body });

      // 입력값 유효성 검사
      const contactValidateError = await validate(createContactDto);
      if (contactValidateError.length > 0) {
        const errorField = contactValidateError.map( validation => validation.property);  // 유효성 검사 실패 필드 추출
        return next(new HttpException(400, `입력값이 유효하지 않습니다.`, { field: errorField }));
      }

      const createContactResult = await this.contactService.createContact(createContactDto);

      res.json({ success: true, data: createContactResult.data, message: "문의가 성공적으로 등록되었습니다." });
    } catch (error) {
      console.log("### 문의 내용 추가 오류: ", String(error));
      next(error);
    }
  }

  /* ==================== PUT ====================*/
  public updateContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // 순수 자바스크립트 객체 -> 클래스 인스턴스로 변환
      const updateContactDto = plainToInstance(UpdateContactDto, {
        id,
        ...req.body,
      });

      // 유효성 검사
      const validateErrors = await validate(updateContactDto);
      if (validateErrors.length > 0) {
        const errorField = validateErrors.map( validation => validation.property);  // 유효성 검사 실패 필드 추출
        return next(new HttpException(400, `입력값이 유효하지 않습니다.`, { field: errorField }));
      }

      const updateContactResult = await this.contactService.updateContact(updateContactDto);

      res.json({ success: true, data: updateContactResult.data, message: "문의 상태가 성공적으로 수정되었습니다." });
    } catch (error) {
      console.log("### 문의 내용 수정 오류: ", String(error));
      next(error);
    }
  }

  /* ==================== DELETE ====================*/
  public deleteContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const deleteContactResult = await this.contactService.deleteContact(id);

      res.json({ success: true, data: deleteContactResult.data, message: "문의 상태가 성공적으로 삭제 되었습니다." });
    } catch (error) {
      console.log("### 문의 내용 삭제 오류: ", String(error));
      next(error);
    }
  }
}