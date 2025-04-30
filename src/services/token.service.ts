/**
 * JWT Token 관련 서비스 계층
 */
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ACCESS_SECRET, REFRESH_SECRET, EXPIRES } from "@/config";
import { TokenTypeEnum } from "@utils/enum";

// Interface
import { AuthUser } from "@interfaces/user.interface";

/**
 * ACCESS Token 발급
 */
export const createAccessToken = async (authUser: AuthUser) => {
  return jwt.sign(
    authUser,
    ACCESS_SECRET,
    { expiresIn: '15m' }  // accessToken 만료 시간 15분 설정
  )
}

/**
 * REFRESH Token 발급
 */
export const createRefreshToken = async (authUser: AuthUser) => {
  return jwt.sign(
    authUser,
    REFRESH_SECRET,
    { expiresIn: EXPIRES }  // refreshToken 만료 시간 6시간 설정
  )
}

/**
 * 자동 로그아웃용 임시 Access Token 생성
 * @param authUser - { id: -1, userId: userId, name: auth-logout }
 */
export const createTemporaryAccessToken = async (authUser: AuthUser) => {
  return jwt.sign(
    authUser,
    ACCESS_SECRET,
    { expiresIn: '5s' }
  )
}

/**
 * ACCESS & REFRESH 토큰 발급
 */
export const createAccessRefreshToken = async (authUser: AuthUser) => {
  const accessToken = await createAccessToken(authUser);
  const refreshToken = await createRefreshToken(authUser);

  return {
    accessToken,
    refreshToken
  }
}

/**
 * 토큰 인증하기
 */
export const verifyToken = async (token: string, type: string) => {
  const result = { success: true, authUser: {}, code: 200, message: '' };
  const secretKey = type === TokenTypeEnum.ACCESS ? ACCESS_SECRET : REFRESH_SECRET;

  try {
    // AccessToken 인증
    const decoded = jwt.verify(token, secretKey);
    result.success = true;
    result.authUser = decoded as AuthUser;
  } catch (err) {
    result.success = false;
    // 토큰은 맞지만 유효기간이 만료된 경우, 401
    if (err instanceof TokenExpiredError) {
      result.code = 401;
      result.message = "유효기간이 만료된 토큰입니다.";
    }
    // 토큰 자체가 잘못됐거나 조작된 경우, 401이지만 만료와 구분하기 위해 402 사용
    else if (err instanceof JsonWebTokenError) {
      result.code = 402;
      result.message = "유효하지 않은 토큰입니다.";
    }
    // 기타 예상치 못한 에러, 500
    else if (err instanceof Error) {
      result.code = 500;
      result.message = "인증 중 서버 오류가 발생했습니다.";
    }
  }

  return result;
}