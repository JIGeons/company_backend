/**
 * Post Interface
 */

export interface Post {
  number: number;
  title: string;
  content: string;
  fileUrl: string[];  // 파일 URL 배열
  views: number;
  viewLogs: {   // 동일 유저 반복 조회 방지
    ip: string;
    userAgent: string;
    timestamp: Date;  // MongoDB 스타일 제거하고 Date 타입 적용
  }[];
  createdAt?: Date; // 선택적 필드로 변경
  updatedAt?: Date; // 선택적 필드로 변경
}