/**
 * Contact Service Unit Test 파일
 */

import {describe} from "node:test";
import {ContactService} from "@/services/contact.service";
import {HttpException} from "@/exceptions/httpException";

// Interface
import {CreateContactDto, UpdateContactDto} from "@/dtos/mongo/contact.dto";

// Mock 데이터
import {contactDaoMock} from "./contact.mock";
import {contactFixture} from "./contact.fixture";
import {ContactStatusEnum} from "../../src/utils/enum";

describe("ContactService", () => {
  let contactService: ContactService;

  beforeEach(() => {
    // 테스트용 ContactService 객체 생성
    contactService = new ContactService(contactDaoMock);
  });

  describe("getAllContact", () => {
    it("전체 문의글 조회에 성공하고 데이터를 반환한다.", async () => {
      const mockContacts = [
        {...contactFixture, _id: "1234"},
        {...contactFixture, _id: "1235"}
      ];
      contactDaoMock.findAll.mockResolvedValue({ success: true, data: mockContacts });

      const response = await contactService.getAllContact();
      expect(response).toEqual({ success: true, data: mockContacts });
    });

    it("전체 문의글 조회 중 서버 에러가 발생하여 500 에러 반환한다.", async () => {
      contactDaoMock.findAll.mockResolvedValue({ success: false, data: null, error: "Contact 전체 조회 실패. (Error: )" });

      await expect(contactService.getAllContact())
        .rejects.toThrow(new HttpException(500, "Contact 전체 조회 실패. (Error: )"));
    });

    it("전체 문의글 조회 중 문의 내역이 존재하지 않아 404 에러 반환한다.", async () => {
      contactDaoMock.findAll.mockResolvedValue({ success: false, data: null });

      await expect(contactService.getAllContact())
        .rejects.toThrow(new HttpException(404, "문의 내역이 존재하지 않습니다."));
    });
  });

  describe("findById", () => {
    const mockContact = { _id: "1234", ...contactFixture };
   it("특정 문의글 조회에 성공하고 데이터를 반환한다.", async () => {
     contactDaoMock.findById.mockResolvedValue({ success: true, data: mockContact });

     const response = await contactService.findById(mockContact._id);
     expect(response).toEqual({ success: true, data: mockContact });
   });

    it("특정 문의글 조회 중 서버 에러가 발생하여 500 에러 반환한다.", async () => {
      const errorMessage = "Contact 조회 실패.";
      contactDaoMock.findById.mockResolvedValue({ success: false, data: null, error: errorMessage });

      await expect(contactService.findById(mockContact._id))
        .rejects.toThrow(new HttpException(500, errorMessage));
    });

    it("특정 문의글 조회 중 문의 내역이 존재하지 않아 404 에러 반환한다.", async () => {
      contactDaoMock.findById.mockResolvedValue({ success: false, data: null });

      await expect(contactService.findById(mockContact._id))
        .rejects.toThrow(new HttpException(404, "문의를 찾을 수 없습니다."));
    });
  });

  describe("createContact", () => {
    const createContactDto: CreateContactDto = { ...contactFixture };

    it("문의글 생성에 성공하고 데이터를 반환한다.", async () => {
      const createContactResult = { _id: "1234", ...contactFixture };
      contactDaoMock.create.mockResolvedValue({ success: true, data: createContactResult });

      const response = await contactService.createContact(createContactDto);
      expect(response).toEqual({ success: true, data: createContactResult });
    });

    it("문의글 생성 중 서버 에러가 발생하여 500 에러를 반환한다.", async () => {
      const errorMsg = "Contact 생성에 실패했습니다.";
      contactDaoMock.create.mockResolvedValue({ success: false, data: null, error: errorMsg });

      await expect(contactService.createContact(createContactDto))
        .rejects.toThrow(new HttpException(500, errorMsg));
    });

    it("문의글 생성에 실패하여 422 에러를 반환한다.", async () => {
      contactDaoMock.create.mockResolvedValue({ success: false, data: null });

      await expect(contactService.createContact(createContactDto))
        .rejects.toThrow(new HttpException(422, '문의가 생성되지 않았습니다.'));
    });
  });

  describe("updateContact", () => {
    const updateContactDto: UpdateContactDto = { _id: "1234", status: ContactStatusEnum.PENDING };

    it("문의글 수정에 성공하고 데이터를 반환한다.", async () => {
      const updateResult = { ...contactFixture, _id: "1234", status: ContactStatusEnum.PENDING };
      contactDaoMock.updateById.mockResolvedValue({ success: true, data: updateResult });

      const response = await contactService.updateContact(updateContactDto);
      expect(response).toEqual({ success: true, data: updateResult });
    });

    it("문의글 수정 중 서버 에러가 발생하여 500에러를 반환한다.", async () => {
      const errorMsg = "Contact 수정 중 문제 발생.";
      contactDaoMock.updateById.mockResolvedValue({ success: false, data: null, error: errorMsg });

      await expect(contactService.updateContact(updateContactDto))
        .rejects.toThrow(new HttpException(500, errorMsg));
    });

    it("수정할 문의글을 찾을 수 없어 404에러를 반환한다.", async () => {
      contactDaoMock.updateById.mockResolvedValue({ success: false, data: null });

      await expect(contactService.updateContact(updateContactDto))
        .rejects.toThrow(new HttpException(404, '수정할 문의글을 찾을 수 없어 수정에 실패했습니다.'));
    });
  });

  describe("deleteContact", () => {
    const _id = "1234";

    it("문의글 삭제에 성공하여 데이터를 반환한다.", async () => {
      const deleteResult = { ...contactFixture, _id };
      contactDaoMock.delete.mockResolvedValue({ success: true, data: deleteResult });

      const response = await contactService.deleteContact(_id);
      expect(response).toEqual({ success: true, data: deleteResult });
    });

    it("문의글 삭제 중 서버 에러가 발생하여 500에러를 반환한다.", async () => {
      const errorMsg = "Contact 삭제 중 문제 발생.";
      contactDaoMock.delete.mockResolvedValue({ success: false, data: null, error: errorMsg });

      await expect(contactService.deleteContact(_id))
        .rejects.toThrow(new HttpException(500, errorMsg));
    });

    it("삭제할 문의를 찾을 수 없어 404에러를 반환한다.", async () => {
      contactDaoMock.delete.mockResolvedValue({ success: false, data: null });

      await expect(contactService.deleteContact(_id))
        .rejects.toThrow(new HttpException(404, '삭제할 문의가 없습니다.'));
    });
  });
});