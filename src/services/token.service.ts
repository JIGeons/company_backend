/**
 * JWT Token 관련 서비스 계층
 */
import jwt, {JsonWebTokenError, TokenExpiredError} from "jsonwebtoken";
import {ACCESS_SECRET, EXPIRES, REFRESH_SECRET} from "@/config";
import {RedisStoreKeyActionEnum, TokenTypeEnum} from "@utils/enum";

// Interface
import { AuthHeader, AuthUser, userTokenInfo } from "@interfaces/user.interface";
import { Result } from "@interfaces/result.interface";

// Service
import { deleteToRedis, getDataToRedis, storeToRedis } from "@services//redis.service";

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
  const result = {
    success: true,
    authHeader: {} as AuthHeader,
    authUser: {},
    code: 200, message: ''
  };
  const secretKey = type === TokenTypeEnum.ACCESS ? ACCESS_SECRET : REFRESH_SECRET;

  try {
    // AccessToken 인증
    const decoded = jwt.verify(token, secretKey) as userTokenInfo;
    result.success = true;
    result.authHeader = {
      iat: decoded.iat,
      exp: decoded.exp
    } as AuthHeader;
    result.authUser = {
      id: decoded.id,
      userId: decoded.userId,
      name: decoded.name,
    } as AuthUser;
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

/**
 * redis에 accessToken과 refreshToken은 저장하는 메서드
 * @param userId
 * @param accessToken
 * @param refreshToken
 */
export const storeTokenToRedis = async (userId: string, accessToken: string, refreshToken: string) => {
  // 저장 데이터 생성
  const accessData = { accessToken };
  const refreshData = { refreshToken };
  const result:Result = { success: false, data: null };

  try {
    // redis에 저장
    await storeToRedis(RedisStoreKeyActionEnum.LOGOUT, userId, accessData, EXPIRES);
    await storeToRedis(RedisStoreKeyActionEnum.REFRESH, userId, refreshData, EXPIRES);

    result.success = true;
    result.data = { accessToken, refreshToken };
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    console.log("Redis 토큰 저장 실패: ", result.error);
  }

  return result;
}

/**
 * Redis에서 Logout, Refresh 토큰을 삭제하는 메서드
 * @param userId - User 모델의 userId
 */
export const deleteTokenToRedis = async (userId: string) => {
  const result: Result = { success: false, data: null };

  try {
    // redis에서 토큰 삭제 token이 keyname에 사용 되었으므로 token을 넘긴다.
    const deleteAccessResult = await deleteToRedis(RedisStoreKeyActionEnum.LOGOUT, userId);
    const deleteRefreshResult = await deleteToRedis(RedisStoreKeyActionEnum.REFRESH, userId);
    console.log("delete Access Result: ", deleteAccessResult);
    console.log("delete Refresh Result: ", deleteRefreshResult);

    result.success = true;
    result.data = { userId };
  } catch (error) {
    console.log(error);
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

/**
 * Redis BlackList에 토큰을 삽입하는 메서드
 * @param accessToken
 */
export const storeBlackListToken = async (accessToken: string) => {
  const result: Result = { success: false, data: null };
  // exp를 알기 위해 토큰 검증
  const decodedResult = await verifyToken(accessToken, TokenTypeEnum.ACCESS);
  // 검증 실패 반환
  if (!decodedResult.success) {
    console.log(decodedResult.message);
    result.error = decodedResult.message;
    return result;
  }

  const authHeader = decodedResult.authHeader;
  const now = Math.floor(new Date().getTime() / 1000);  // 소수점을 제외한 현재 시간 구하기
  const expireTime = authHeader.exp - now;  // AccessToken 만료까지 남은 시간 계산
  const redisData = { authUser: decodedResult.authUser };  // redis에 저장할 데이터 생성

  // BlackList에 추가
  const storeResult = await storeToRedis(RedisStoreKeyActionEnum.BLACKLIST, accessToken, redisData, expireTime);
  if (!storeResult.success) {
    result.error = storeResult.error;
    return result;
  }

  console.log("블랙리스트 추가 성공: ", storeResult.data);
  result.success = true;
  result.data = { accessToken };
  return result;
}

/**
 * redis BlackList에 토큰이 존재하는지 확인하는 메서드
 * @param accessToken
 */
export const getTokenToBlackList = async (accessToken: string) => {
  const result: Result = { success: true, data: { accessToken } };

  // BlackList에 accessToken이 존재하는지 확인
  const getTokenResult = await getDataToRedis(RedisStoreKeyActionEnum.BLACKLIST, accessToken);
  // BlackList에 존재하지 않는 경우 사용자 인가
  if (!getTokenResult.success) {
    return result;
  }

  // BlackList에 존재하는 경우
  result.success = false;
  result.error = "Black List에 존재하는 Token 입니다. 사용할 수 없습니다.";
  return result;
}