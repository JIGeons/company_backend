/**
 * Post Service Unit Test 파일
 */

import 'reflect-metadata';
import { describe } from "node:test";
import { marked } from "marked";

import { PostDao } from "@/daos/post.dao";
import { PostService } from '@/services/post.service';

// Interface
import { FileStorageServiceInterface } from "@/interfaces/file.interface";
import { HttpException } from "@/exceptions/httpException";

import {createMockPost, mockPost, mockPostResult} from "@tests/factory/post.factory";

// 모킹을 위한 jest.mock
jest.mock('@/services/file.service');

describe('PostService', () => {
  let postService: PostService;
  let mockFileStorageService: jest.Mocked<FileStorageServiceInterface>;
  let postDao: jest.Mocked<PostDao>;

  beforeEach(() => {
    // S3FileStorageService를 mock instance로 생성
    mockFileStorageService = {
      deleteFile: jest.fn(),
      deleteFiles: jest.fn(),
      uploadFile: jest.fn(),
    }

    postDao = {
      findAll: jest.fn(),
      findOneById: jest.fn(),
      findOneByIdCanSave: jest.fn(),
      findOneByRecentNumber: jest.fn(),
      createPost: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
    }

    postService = new PostService(postDao, mockFileStorageService);
  });

  describe('findAll()', async () => {
    it("전체 게시글 조회에 성공하고 데이터를 반환한다.", async () => {
      const mockPosts = [{id: 1, title: '테스트 게시글'}];
      postDao.findAll.mockResolvedValue({
        success: true,
        data: mockPosts
      });

      const result = await postService.findAll();

      expect(result).toEqual({ success: true, data: mockPosts });
      expect(postDao.findAll).toHaveBeenCalled();
    });

    it("전체 게시글 조회 내역이 없어서 404 오류를 반환한다.", async () => {
      postDao.findAll.mockResolvedValue({
        success: false,
        data: []
      });

      await expect(postService.findAll()).rejects.toThrow('게시글을 찾을 수 없습니다.');
      expect(postDao.findAll).toHaveBeenCalled();
    })

    it("전체 게시글 조회 중 오류 발생으로 500 에러 반환", async () => {
      postDao.findAll.mockResolvedValue({
        success: false,
        error: "전체 Post 조회 중 문제 발생"
      });

      await expect(postService.findAll()).rejects.toThrow('전체 Post 조회 중 문제 발생');
      expect(postDao.findAll).toHaveBeenCalled();
    })
  });

  describe("getPostByIdWithRender()", async () => {
    it("단일 게시글 조회에 성공하고 데이터를 반환한다.", async () => {
      postDao.findOneByIdCanSave.mockResolvedValue({
        success: true,
        data: mockPostResult
      });

      const mockViewer = { ip: "123", userAgent: undefined };

      const result = await postService.getPostByIdWithRender("1", mockViewer);
      const renderedContent = marked.parse(mockPost.content);

      expect(result).toEqual({ success: true, data: {...mockPost, renderedContent: renderedContent } });
    });

    it("단일 게시글 조회 시 존재하지 않는 데이터를 조회하면 404 에러를 던진다.", async () => {
      postDao.findOneByIdCanSave.mockResolvedValue({
        success: false,
        data: []
      });

      const mockViewer = { ip: "123", userAgent: undefined };

      await expect(postService.getPostByIdWithRender("123", mockViewer))
        .rejects.toThrow(new HttpException(404, "게시글을 찾을 수 없습니다."));
    });

    it("단일 게시글 조회 시 DB 조회 오류가 생긴 경우 500 에러를 던진다.", async () => {
      postDao.findOneByIdCanSave.mockResolvedValue({
        success: false,
        error: "Id로 Post 조회 중 문제 발생"
      });

      const mockViewer = { ip: "123", userAgent: undefined };

      await expect(postService.getPostByIdWithRender("123", mockViewer))
        .rejects.toThrow(new HttpException(500, "Id로 Post 조회 중 문제 발생"));
    });
  });

  describe("createPost()", async () => {
    it("게시글 생성에 성공하고, 데이터를 반환한다.", async () => {
      // 최근 게시물 조회 mock 설정 (데이터 없음)
      postDao.findOneByRecentNumber.mockResolvedValue({
        success: true,
        data: null
      });

      const title = "test";
      const content = "test content";
      const fileUrl: string[] = [];

      // 게시물 생성 결과 mock 생성
      const mockPost = createMockPost({ title, content, fileUrl });
      postDao.createPost.mockResolvedValue({
        success: true,
        data: mockPost
      });

      const result = await postService.createPost(title, content, fileUrl);

      expect(result).toEqual({ success: true, data: mockPost });
    });



    it("게시글 유효성 검사에 실패하여 400에러를 반환한다.", async () => {
      // 최근 게시물 조회 mock 설정 (데이터 없음)
      postDao.findOneByRecentNumber.mockResolvedValue({
        success: true,
        data: null
      });

      const title = "";
      const content = "test content";
      const fileUrl: string[] = [];
      const errorField = ["title"]; // 유효성 테스트 실패 필드명

      await expect(postService.createPost(title, content, fileUrl)).rejects.toThrow(new HttpException(400, "잘못된 입력값입니다.", errorField));
    });

    it("게시글 생성 중 DB 오류가 발생하여 500에러를 반환한다.", async () => {
      // 최근 게시물 조회 mock 설정 (데이터 없음)
      postDao.findOneByRecentNumber.mockResolvedValue({
        success: true,
        data: null
      });

      const title = "test";
      const content = "test content";
      const fileUrl: string[] = [];
      const errorMsg = "Create Post 중 문제 발생"

      // 게시물 생성 결과 mock 생성 (DB 생성 실패)
      postDao.createPost.mockResolvedValue({
        success: false,
        error: errorMsg
      });

      await expect(postService.createPost(title, content, fileUrl)).rejects.toThrow(new HttpException(500, errorMsg))
    });
  });

  describe("updatePost()", async () => {
    it("게시글 수정에 성공하고, 데이터를 반환한다.", async () => {
      const id = "1234";
      const title = "update test title";
      const content = "update test content";
      const fileUrl: string[] = [];
    });

    it("수정할 게시글이 존재하지 않아 404에러를 반환한다.", async () => {

    });

    it("게시글 수정 중 DB 오류가 발생하여 500에러를 반환한다.", async () => {

    });
  });

  describe("deletePost()", async () => {

  });
});