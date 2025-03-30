import { Service } from "typedi";
import { HttpException } from "@exceptions/httpException";
import bcrypt from "bcrypt";
import axios from "axios";

// Interface
import { AuthUser } from "@interfaces/user.interface";
import { Result } from "@interfaces/result.interface";

// Dao
import { UserDao } from "@/daos/user.dao";

// Dto
import { CreateUserDto, UpdateUserDto } from "@/dtos/user.dto";


@Service()
export class UserService {
  constructor(
    private readonly userDao : UserDao,
  ) {}

  public async signup(username: string, password: string): Promise<Result> {
    // User가 존재하는지 확인
    const existingUser = await this.userDao.findByUsername(username);
    if (existingUser.error) {
      throw new HttpException(500, existingUser.error);
    }
    if (existingUser.success) {
      throw new HttpException(400, "이미 존재하는 사용자입니다.");
    }

    try {
      // 비밀번호 10진수 암호화
      const hashedPassword = await bcrypt.hash(password, 10);
      const createUser: CreateUserDto = { username, password: hashedPassword }

      // user 정보 생성
      const createUserResult = await this.userDao.create(createUser);

      return { success: true , data: createUserResult };
    } catch (error) {
      throw new HttpException(500, "회원가입에 실패했습니다.");
    }
  }

  public async login(username: string, password: string): Promise<Result> {
    const { success, data: user} = await this.userDao.findByUsernameWithPw(username);
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
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      user.failedLoginAttempts += 1;
      user.lastLoginAttempts = new Date();

      // 비밀번호를 5회 이상 틀렸을 시 계정 잠금
      if (user.failedLoginAttempts >= 5) {
        user.isActive = false;
        await user.save();
        throw new HttpException(401, "비밀번호 5회 이상 틀려 계정이 비활성화 됩니다.");
      }

      await user.save();
      return {
        success: false,
        error: "비밀번호가 일치하지 않습니다.",
        data: { remainingAttempts: 5 - user.failedLoginAttempts },
      }
    }

    user.failedLoginAttempts = 0;
    user.lastLoginAttempts = new Date();
    user.isLoggedIn = true;

    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      const ipAddress = response.data.ip; // 공인 ip
      user.ipAddress = ipAddress;
    } catch (error) {
      console.log("IP 주소를 가져오던 중 오류 발생: ", error);
    }

    await user.save();
    return { success: true, data: user };
  }

  public async logout (user: AuthUser): Promise<Result> {
    const findUser = await this.userDao.findById(user.userId);

    // 에러가 존재하는 경우
    if (findUser.error) {
      throw new HttpException(500, findUser.error);
    }
    // 유저가 존재하지 않는 경우
    if (!findUser.success) {
      return { success: false, data: [], error: "로그인 유저를 찾을 수 없습니다."}
    }

    // 로그인 유저 정보 update
    const updateUserDto: UpdateUserDto = { id: findUser.data._id.toString(), isLoggedIn: false };
    const updateUserResult = await this.userDao.update(updateUserDto);

    // 업데이트 도중 에러 발생
    if (updateUserResult.error) {
      throw new HttpException(500, updateUserResult.error);
    }

    return { success: true, data: updateUserResult };
  }

  public async deleteUser (userId: string): Promise<Result> {
    const deleteUser = await this.userDao.delete(userId);
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
}