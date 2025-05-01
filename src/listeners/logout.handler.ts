/**
 * 자동 로그아웃 핸들러
 */

import axios from "axios";

// ENV
import { SERVER_URI } from "@/config";

// interface
import { AuthUser } from "@interfaces/user.interface";

// Service
import { createTemporaryAccessToken } from "@services/token.service";

export async function logoutHandler (accessToken: string) {
  try {
    const { data: logoutResult } = await axios.post(`${SERVER_URI}/api/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

    console.log('📦 응답 받은 로그아웃 결과:', logoutResult);


    if (!logoutResult.success) {
      console.error("자동 로그아웃 실패: ", logoutResult.message);
    }

    console.log("자동 로그아웃 성공");
  } catch (error) {
    console.error("로그아웃 요청 실패: ", error);
  }
}

/**
 * 자동 로그아웃 요청 User 토큰 임시 생성 및 자동 로그아웃 요청
 * @param userId - User 모델의 userId
 */
export async function logoutRequestHandler (userId: string) {
  console.log(userId);
  const authUser: AuthUser = { id: -1 , userId: userId, name: "auto-logout" };
  const accessToken = await createTemporaryAccessToken(authUser);  // 자동 로그아웃용 Token 생성
  logoutHandler(accessToken); // 로그아웃 처리
}