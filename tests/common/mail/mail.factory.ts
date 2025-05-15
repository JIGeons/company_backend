/**
 * Mail Factory 파일
 * Mail 동적 테스트 데이터 생성
 */
import { Result } from "@/interfaces/result.interface";

// MailService 응답 결과 Factory
export const mailResultFactory = (overrides = {}): Result => {
  return {
    success: false,
    data: null,
    error: '메일 서비스 실패',
    ...overrides,
  };
}