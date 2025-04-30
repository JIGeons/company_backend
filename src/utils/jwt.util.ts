/**
 * JWT Util 파일
 */
import jwt from "jsonwebtoken";
import { ACCESS_SECRET, REFRESH_SECRET, EXPIRES } from "@/config";

// Interface
import { AuthUser } from "@interfaces/user.interface";

export const createJWTToken = async (authUser: AuthUser) => {
  // JWT 토큰 발급
  const token = jwt.sign(
    authUser,
    ACCESS_SECRET,
    { expiresIn: EXPIRES }  // 토큰 유효기간 설정
  )

  return token;
}