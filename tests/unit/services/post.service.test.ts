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

import { mockPost, mockPostResult } from "@tests/factory/post.factory";

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
});