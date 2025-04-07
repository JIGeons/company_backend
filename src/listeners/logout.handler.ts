/**
 * 자동 로그아웃 핸들러
 */

import axios from "axios";

// ENV
import { SERVER_URI } from "@/config";

export async function logoutHandler (accessToken: string) {
  try {
    const { data: logoutResult } = await axios.post(`${SERVER_URI}/api/auth/logout`,
      {},
      {
        headers: {
          Cookie: `token=${accessToken}`
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