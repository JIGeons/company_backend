/**
 * Post Factory 파일
 */
import Post from '@/models/post.model';

export const mockPost = {
  _id: "1234",
  number: 1,
  title: "Test Post",
  content: "Test Post Content",
  fileUrl: [],
  views: 0,
  viewLogs: []
}

export const mockPostResult = {
  ...mockPost,
  toObject: () => ({
    ...mockPost,
  }),
  save: jest.fn(),
}

export const createMockPost = (overrides = {}) => {
  return {
    ...mockPost,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
    ...overrides,
  }
}