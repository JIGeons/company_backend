import { Service } from "typedi";
import { DB } from '@/database';

// Interface
import { Result } from '@interfaces/result.interface';

// Dto
import { CreateUserDto, UpdateUserDto } from "@/dtos/mysql/user.dto";

@Service()
export class UserDao {
  private readonly User = DB.MYSQL.User;

  /**
   * ID로 사용자 정보 조회
   * @param id - User.id
   */
  async findById(id: number): Promise<Result> {
    try {
      const findUserById = await this.User.findOneBy({ id: id });
      if (!findUserById) {
        return { success: false, data: [] };
      }

      return { success: true, data: findUserById };
    } catch (error) {
      console.error("User 조회 실패: ", error);
      return { success: false, data: [], error: "User 조회 실패" };
    }
  }

  /**
   * UserId로 사용자 조회
   * @param userId - 사용자 ID
   */
  async findByUserId(userId: string): Promise<Result> {
    try {
      const findUserByUserId = await this.User.findOneBy({ userId: userId });
      if (!findUserByUserId) {
        return { success: false, data: null };
      }

      return { success: true, data: findUserByUserId };
    } catch (error) {
      console.log("UserId 조회 실패: ", error );
      return { success: false, data: null, error: "UserId 조회 실패" };
    }
  }

  /**
   * UserId로 password 정보를 포함한 사용자 정보 조회
   * @param userId - 사용자 ID
   */
  async findByUserIdWithPW(userId: string): Promise<Result> {
    try {
      const findUserByUserId = await this.User.findByUserIdWithPW(userId);
      if (!findUserByUserId) {
        return { success: false, data: null };
      }

      return { success: true, data: findUserByUserId };
    } catch (error) {
      console.log("UserId with pw 조회 실패: ", error );
      return { success: false, data: null, error: "UserId with pw 조회 실패" };
    }
  }

  /**
   * 유저 생성
   * @param userDto - CreateUserDto 유저 생성에 꼭 필요한 정보
   */
  async create(userDto: CreateUserDto): Promise<Result> {
    try {
      const createUser = this.User.create(userDto);       // 인스턴스 생성
      const savedUser = await this.User.save(createUser); // DB에 저장

      return { success: true, data: savedUser }
    } catch (error) {
      console.error('User 생성 실패:', error);
      return { success: false, error: "User 생성 실패" }
    }
  }

  /**
   * 유저 정보 수정
   * @param userDto - UpdateUserDto 유저 정보 수정에 필요한 정보 객체
   */
  async update(userDto: UpdateUserDto): Promise<Result> {
    try {
      const updateUser = await this.User.update({ id: userDto.id }, userDto);

      if (!updateUser) {
        return { success: false, data: [] };
      }

      return { success: true, data: updateUser };
    } catch (error) {
      console.error('User 업데이트 실패: ', error);
      return { success: false, error: "User 업데이트 실패" };
    }
  }

  /**
   * 유저 정보 삭제
   * @param id - 삭제할 유저의 ID
   */
  async delete(id: number): Promise<Result> {
    try {
      const deleteUser = await this.User.delete({ id: id });
      // 삭제된 user 정보가 없는 경우. affected = 삭제된 row의 수
      if (deleteUser.affected === 0) {
        return { success: false, data: null };
      }

      return { success: true, data: deleteUser };
    } catch (error) {
      console.error('User 삭제 실패: ', error);
      return { success: false, error: "User 삭제 실패" };
    }
  }
}