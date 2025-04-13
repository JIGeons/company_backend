/**
 * JWT Util 파일
 */
import jwt from "jsonwebtoken";
import { JWT_SECRET, EXPIRES } from "@/config";

export const createJWTToken = async (userId: string, userName: string) => {
  // JWT 토큰 발급
  const token = jwt.sign(
    { userId: userId, username: userName },
    JWT_SECRET,
    { expiresIn: EXPIRES }  // 토큰 유효기간 설정
  )

  return token;
}