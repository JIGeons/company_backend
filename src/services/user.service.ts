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
import {AuthUser, User} from "@interfaces/user.interface";
import {Result} from "@interfaces/result.interface";

// Service
import {
  createAccessRefreshToken,
  deleteTokenToRedis,
  storeBlackListToken,
  storeTokenToRedis
} from "@services/token.service";
import { MailService } from "@services/mail.service";

// Dao
import { UserDao } from "@/daos/mysql/user.dao";

// Dto
import { CreateUserDto, UpdateUserDto } from "@/dtos/mysql/user.dto";

// Redis
import { getDataToRedis } from "@services//redis.service";
import {generateVerificationCode} from "@utils/utils";

@Service()
export class UserService {
  // 생성자 주입을 통해 UserDao 의존성 주입
  constructor(
    private readonly userDao : UserDao,
    private readonly mailService: MailService,
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
   * @param clientIp  - 요청자의 Ip
   * @param userId    - 사용자 Id
   * @param password  - 사용자 비밀번호
   */
  public async login(clientIp: string | undefined, userId: string, password: string): Promise<Result> {
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

    // 암호화된 비밀번호가 동일한지 비교
    const isValidPassword = await bcrypt.compare(password, user.password!);
    if (!isValidPassword) {
      user.failedLoginAttempts! += 1;
      user.lastLoginDatetime = new Date();

      // 비밀번호를 5회 이상 틀렸을 시 계정 잠금
      if (user.failedLoginAttempts! >= 5) {
        user.isActive = false;
        await this.userDao.update(user);
        throw new HttpException(401, "비밀번호 5회 이상 틀려 계정이 비활성화 됩니다.");
      }

      // 실패 정보 업데이트
      await this.userDao.update(user);
      return {
        success: false,
        error: "비밀번호가 일치하지 않습니다.",
        // @ts-ignore
        data: { remainingAttempts: 5 - user.failedLoginAttempts },
      }
    }

    user.failedLoginAttempts = 0;
    user.lastLoginDatetime = new Date();
    user.isLoggedIn = true;
    user.ipAddress = clientIp;  // 사용자 clientIp 저장

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
      // TODO:: Redis 저장 실패 시 전체 로그인 실패처리 -> 트랜잭션 롤백
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
      throw new HttpException(500, `Logout: ${updateUserResult.error}`);
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
   * AccessToken 재발급 서비스
   * AccessToken 만료 시 RefreshToken을 사용하여 AccessToken을 재발급 하는 메서드
   * @param authUser
   * @param refreshToken
   * @param clientIp
   */
  public async reissueAccessToken (authUser: AuthUser, refreshToken: string, clientIp: string | undefined): Promise<Result> {
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
      // 엑세스 토큰 재발급 요청 시 쿠키에 저장된 refresh 토큰과 redis에 저장된 refresh 토큰이 다른 경우
      // refresh 토큰을 탈취하여 accessToken을 비정상적으로 발급하려는 목적으로 간주.
      // 비정상 로그인 에러와 함께 User가 가입할때 등록한 메일로 비정상 로그인 메일 발송
      const {success: getResult, data: userInfo} = await this.userDao.findByUserId(authUser.userId);

      // user가 존재하지 않는 경우 비정상 접근 response
      if (!getResult) {
        throw new HttpException(403, "비정상적인 접근입니다.");
      }

      // 사용자에게 비정상 접근 메일 전송
      const sendMailResult = await this.mailService.sendAbnormalAccessVerificationEmail(userInfo, clientIp);
      if (sendMailResult.success) {
        const result = sendMailResult.data;

        // 전송 후 user 정보 update
        const userUpdateDto: UpdateUserDto = {
          ...userInfo,
          isLoggedIn: false,  // 로그아웃 처리
          isActive: false,    // 계정 잠금
          verificationCode: result.verificationCode,  // 인증번호 저장
        }

        const updateResult = await this.userDao.update(userUpdateDto);
        if (!updateResult.success) {
          console.error("사용자 정보 수정 실패: ", updateResult.error);
        }
      }

      // Redis에서 토큰 삭제
      const deleteTokenResult = await deleteTokenToRedis(userInfo.userId);

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

  /**
   * 사용자 계정 확성화 서비스
   * 비활성화된 계정의 사용자를 검증하고 활성화시키는 메서드
   * @param accountId
   * @param userPassword
   * @param code
   */
  public async verifyUserAccount (accountId: string, userPassword: string, code: string): Promise<Result> {
    console.log(accountId, userPassword, code);

    // 사용자 정보 조회
    const getUserInfo = await this.userDao.findByUserIdWithPW(accountId);
    if (getUserInfo.error) {
      console.log("### 사용자 재활성화 오류(서버 에러): ", getUserInfo.error);
      throw new HttpException(500, getUserInfo.error);
    } else if (!getUserInfo.success) {
      console.log("### 사용자 재활성화 오류: 입력한 정보의 사용자를 찾을 수 없음");
      throw new HttpException(404, "입력한 정보의 사용자를 찾을 수 없습니다.");
    }

    const user: User = getUserInfo.data;
    console.log(user.password);
    // 암호화된 비밀번호가 동일한지 비교
    const isValidPassword = await bcrypt.compare(userPassword, user.password!);
    console.log(isValidPassword);
    // 비밀번호가 동일하지 않은 경우 400 에러 반환
    if (!isValidPassword) {
      console.log("### 사용자 재활성화 실패: 입력한 비밀번호가 일치하지 않습니다.");
      throw new HttpException(400, "입력한 비밀번호가 일치하지 않습니다.");
    }

    // 일치하는 경우 verificationCode와 code를 비교
    if (user.verificationCode !== code) {
      console.log('### 사용자 재활성화 실패: 잘못된 code로의 접근입니다.');
      throw new HttpException(400, "잘못된 code로의 접근입니다. 다시 확인해주세요.");
    }

    // 비밀번호 & code가 일치하는 경우 사용자 계정 활성화
    user.isActive = true;
    user.verificationCode = '';
    const updateResult = await this.userDao.update(user as UpdateUserDto);
    if (updateResult.error) {
      console.error('### 사용자 재활성화 오류(서버 에러): ', updateResult.error);
      throw new HttpException(500, updateResult.error);
    } else if (!updateResult.success) {
      console.log('### 사용자 재활성화 실패: ', updateResult.error);
      throw new HttpException(403, "사용자의 정보를 수정할 수 없습니다.");
    }

    console.log("업데이트된 유저 정보: ", updateResult.data);
    return {
      success: true,
      data: updateResult.data,
    };
  }
}