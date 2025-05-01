/**
 * Utils.ts
 */
import { Request } from "express";
import requestIp from 'request-ip';
// interface
import { Result } from "@interfaces/result.interface";

/**
 * API 요청자의 IP를 조회하는 메서드
 */
export async function getRequestHostIP (req: Request) {
  const result:Result = { success: false, data: null };
  try {
    // 클라이언트의 IP 조회
    const clientIp = requestIp.getClientIp(req);

    result.success = true;
    result.data = { ip: clientIp };
  } catch (error) {
    console.error("요청 IP 조회 실패: ", String(error));
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

/**
 * 인증 코드를 발생하는 메서드
 * @param length - 최소 6자리 이상 length가 없는 경우 default 8자리로 생성.
 */
export function generateVerificationCode(length: number = 8): string {
  if (length < 6) throw new Error("인증 코드는 최소 6자 이상부터 발급 가능합니다.");

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const specials = '!@#$%^&*+=?/';

  let result = '';

  // 특수 문자 1개 무조건 포함
  result += specials[Math.floor(Math.random() * specials.length)];

  // 나머지 문자 채우기
  for (let i = 1; i < length; i++) {
    const all = chars + specials;
    const randomIndex = Math.floor(Math.random() * all.length);
    result += all[randomIndex];
  }

  // 특수문자가 첫 번째에만 고정되지 않도록 셔플
  return shuffleString(result);
}

/**
 * 문자열을 랜덤하게 섞는 함수
 * @param str
 */
function shuffleString(str: string): string {
  const arr = str.split('');

  // 랜던하게 순서 재조합
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];  // swap
  }

  // 하나의 문자열로 반환
  return arr.join('');
}

