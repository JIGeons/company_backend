/**
 * Post mock 파일
 */
import { PostDao } from "@/daos/mongo/post.dao";

export const postDaoMock: jest.Mocked<PostDao> = {
  findAll: jest.fn(),
  findOneById: jest.fn(),
  findOneByIdCanSave: jest.fn(),
  findOneByRecentNumber: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
} as any;