/**
 * User Service 계층
 */

import {Service} from "typedi";
import {HttpException} from "@exceptions/httpException";
import bcrypt from "bcrypt";
import axios from "axios";
import {plainToInstance} from "class-transformer";
import {validate} from "class-validator";

// Utils
import {RedisStoreKeyActionEnum} from "@utils/enum";

// Interface
import {AuthUser} from "@interfaces/user.interface";
import {Result} from "@interfaces/result.interface";

// Service
import {
  createAccessRefreshToken,
  deleteTokenToRedis,
  storeBlackListToken,
  storeTokenToRedis
} from "@services/token.service";
// Dao
import { UserDao } from "@/daos/mysql/user.dao";

// Dto
import { CreateUserDto, UpdateUserDto } from "@/dtos/mysql/user.dto";

// Redis
import { getDataToRedis } from "@services//redis.service";

@Service()
export class UserService {
  // 생성자 주입을 통해 UserDao 의존성 주입
  constructor(
    private readonly userDao : UserDao,
  ) {}

  /**
   * 회원가입 서비스
   * @param createUserData
   */
  public async signup(createUserData: CreateUserDto): Promise<Result> {
    // Create User 정보 유효성 검사
    const createUserDto = plainToInstance(CreateUserDto, createUserData);
    const userValidateError  = await validate(createUserDto);
    if (userValidateError.length > 0) {
      // 유효성 검사 실패 필드 반환
      const errorField = userValidateError.map(validate => validate.property);
      throw new HttpException(400, "잘못된 입력값입니다.", errorField);
    }

    // User가 존재하는지 확인
    const existingUser = await this.userDao.findByUserId(createUserDto.userId);
    if (existingUser.error) {
      throw new HttpException(500, existingUser.error);
    }
    if (existingUser.success) {
      throw new HttpException(400, "이미 존재하는 사용자입니다.");
    }

    try {
      // 비밀번호 10진수 암호화
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = hashedPassword;

      // user 정보 생성
      const createUserResult = await this.userDao.create(createUserDto);

      return { success: true , data: createUserResult.data };
    } catch (error) {
      throw new HttpException(500, "회원가입에 실패했습니다.");
    }
  }

  /**
   * 로그인 서비스
   * @param userId
   * @param password
   */
  public async login(userId: string, password: string): Promise<Result> {
    const { success, data } = await this.userDao.findByUserIdWithPW(userId);
    const user: UpdateUserDto = data;
    if (!success) {
      throw new HttpException(401, "사용자를 찾을 수 없습니다.");
    }
    // 계정이 잠겨진 상태인 경우 401 응답
    if (!user.isActive) {
      throw new HttpException(401, "비활성화된 계정입니다. 관리자에게 문의하세요.");
    }

    // 로그인 상태인 경우
    if (user.isLoggedIn) {
      throw new HttpException(401, "이미 다른 기기에서 로그인이 되어있습니다.");
    }

    // @ts-ignore 암호화된 비밀번호가 동일한지 비교
    const isValidPassword = bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // @ts-ignore
      user.failedLoginAttempts += 1;
      // @ts-ignore
      user.lastLoginDatetime = new Date();

      // @ts-ignore 비밀번호를 5회 이상 틀렸을 시 계정 잠금
      if (user.failedLoginAttempts >= 5) {
        user.isActive = false;
        await this.userDao.update(user);
        throw new HttpException(401, "비밀번호 5회 이상 틀려 계정이 비활성화 됩니다.");
      }

      await this.userDao.update(user);
      return {
        success: false,
        error: "비밀번호가 일치하지 않습니다.",
        // @ts-ignore
        data: { remainingAttempts: 5 - user.failedLoginAttempts },
      }
    }

    user.failedLoginAttempts = 0;
    // @ts-ignore
    user.lastLoginDatetime = new Date();
    user.isLoggedIn = true;

    try {
      // 로그인 요청 IP 조회
      const response = await axios.get("https://api.ipify.org?format=json");
      const ipAddress = response.data.ip; // 공인 ip
      user.ipAddress = ipAddress;
    } catch (error) {
      console.log("IP 주소를 가져오던 중 오류 발생: ", error);
    }

    const authUser: AuthUser = {
      id: user.id,
      userId: user.userId,
      name: user.name!,
    }
    // 토큰 생성
    const { accessToken, refreshToken } = await createAccessRefreshToken(authUser);

    // Redis에 로그인 정보 저장 (자동 로그아웃 용)
    const storeResult = await storeTokenToRedis(userId, accessToken, refreshToken);
    if (!storeResult.success) {
      console.log("Redis 저장 실패: ", storeResult.error);
    }

    await this.userDao.update(user);
    return { success: true, data: { user: user, accessToken: accessToken, refreshToken: refreshToken } };
  }

  /**
   * 로그아웃 서비스
   * @param user
   * @param accessToken
   */
  public async logout (user: AuthUser, accessToken: string): Promise<Result> {
    const findUser = await this.userDao.findByUserId(user.userId);

    // 에러가 존재하는 경우
    if (findUser.error) {
      throw new HttpException(500, findUser.error);
    }
    // 유저가 존재하지 않는 경우
    if (!findUser.success) {
      return { success: false, data: [], error: "로그인 유저를 찾을 수 없습니다."}
    }

    // 로그인 유저 정보 update
    const updateUserDto: UpdateUserDto = { ...findUser.data, isLoggedIn: false };
    const updateUserResult = await this.userDao.update(updateUserDto);

    // 업데이트 도중 에러 발생
    if (updateUserResult.error) {
      throw new HttpException(500, updateUserResult.error);
    }

    // accessToken을 blackList에 등록 ( id == -1 은 임시토큰이므로 블랙리스트 등록 X )
    if (user.id !== -1) {
      const storeBlackResult = await storeBlackListToken(accessToken);
    }

    // redis에서 AccessToken, RefreshToken 삭제
    const deleteTokenResult = await deleteTokenToRedis(user.userId);

    return { success: true, data: updateUserResult.data };
  }

  /**
   * 유저 삭제 서비스
   * @param id
   */
  public async deleteUser (id: string): Promise<Result> {
    const deleteUser = await this.userDao.delete(Number(id));
    // 삭제 시 오류가 난 경우
    if (deleteUser.error) {
      throw new HttpException(500, deleteUser.error);
    }
    // 삭제할 유저가 존재하지 않는 경우
    if (!deleteUser.success) {
      return { success: false, data: [], error: "삭제할 유저가 존재하지 않습니다." }
    }

    // 삭제에 성공한 경우
    return { success: true, data: deleteUser.data };
  }

  /**
   * AccessToken 만료 시 RefreshToken을 사용하여 AccessToken을 재발급 하는 메서드
   * @param authUser
   * @param refreshToken
   */
  public async reissueAccessToken (authUser: AuthUser, refreshToken: string): Promise<Result> {
    const result: Result = { success: false, data: null };

    console.log("authUser", authUser);

    // redis에서 refreshToken 조회
    const getRefreshToken = await getDataToRedis(RedisStoreKeyActionEnum.REFRESH, authUser.userId);
    if (getRefreshToken.error) {
      throw new HttpException(500, getRefreshToken.error);
    }

    if (!getRefreshToken.success) {
      result.error = "Refresh Token이 존재하지 않습니다. AccessToken을 재발급할 수 없습니다.";
      return result;
    }

    // redis에 저장된 refresh 토큰과 cookie의 refresh 토큰을 비교
    const getTokenResult = getRefreshToken.data;
    if (refreshToken !== getTokenResult.refreshToken) {
      throw new HttpException(403, "비정상적인 접근입니다.");
    }

    // token 새로 생성 및 redis에 저장
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await createAccessRefreshToken(authUser);
    const storeTokenResult = await storeTokenToRedis(authUser.userId, newAccessToken, newRefreshToken);
    if (storeTokenResult.error) {
      throw new HttpException(500, storeTokenResult.error);
    }

    result.success = true;
    result.data = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
    return result;
  }
}