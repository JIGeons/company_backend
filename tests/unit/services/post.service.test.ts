/**
 * Post Service Unit Test 파일
 */

import 'reflect-metadata';
import { PostService } from '@/services/post.service';
import { S3FileStorageService } from "@/services/file.service";
import { PostDao } from "@/daos/post.dao";
import { describe } from "node:test";

// 모킹을 위한 jest.mock
jest.mock('@/services/file.service');

describe('PostService', () => {
  let postService: PostService;
  let s3FileStorageService: jest.Mocked<S3FileStorageService>;
  let postDao: jest.Mocked<PostDao>;

  beforeEach(() => {
    // S3FileStorageService를 mock instance로 생성
    s3FileStorageService = {
      deleteFiles: jest.fn(),
    } as unknown as jest.Mocked<S3FileStorageService>;

    postDao = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<PostDao>;

    postService = new PostService(postDao, s3FileStorageService);
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
});