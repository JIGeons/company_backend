/**
 * Post Factory 파일
 */

export const mockPost = {
  id: "1234",
  number: 1,
  title: "Test Post",
  content: "Test Post Content",
  fileUrl: [],
  views: 1,
  viewLogs: []
}

export const mockPostResult = {
  ...mockPost,
  toObject: () => ({
    ...mockPost,
  }),
  save: jest.fn(),
}