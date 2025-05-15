/**
 * Post Fixtures 파일
 * Post 정적 테스트 데이터
 */
import { Post } from "@/interfaces/post.interface";

export const postFixture: Post = {
  number: 1234,
  title: "testTitle",
  content: "testContent",
  fileUrl: [],  // 파일 URL 배열
  views: 0,
  viewLogs: [{
    ip: '127.0.0.1',
    userAgent: 'ios',
    timestamp: new Date(),
  }],
  createdAt: new Date(),
  updatedAt: new Date(),
}