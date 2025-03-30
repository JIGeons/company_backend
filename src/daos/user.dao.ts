import { Service } from "typedi";
import User from "@models/User";

// Interface
import { Result } from '@interfaces/result.interface';

// Dto
import { CreateUserDto, UpdateUserDto } from "@/dtos/user.dto";

@Service()
export class UserDao {
  async findById(id: string): Promise<Result> {
    try {
      const findUserById = await User.findById(id).lean();
      if (!findUserById) {
        return { success: false, data: [] };
      }

      return { success: true, data: findUserById };
    } catch (error) {
      console.error("User 조회 실패: ", error);
      return { success: false, data: [], error: "User 조회 실패" };
    }
  }

  async findByUsername(username: string): Promise<Result> {
    try {
      const findUserResult = await User.findOne({ username }).lean();
      if (!findUserResult) {
        return { success: false, data: [] };
      }

      return { success: true, data: findUserResult };
    } catch (error) {
      console.error("User 조회 실패: ", error);
      return { success: false, error: "User 조회 실패" };
    }
  }

  async findByUsernameWithPw(username: string): Promise<Result> {
    try {
      const findUserResult = await User.findOne({ username }).select("+password");
      if (!findUserResult) {
        return { success: false, data: [] };
      }

      return { success: true, data: findUserResult };
    } catch (error) {
      console.error("User 조회 실패: ", error);
      return { success: false, error: "User 조회 실패" };
    }
  }

  async create(userDto: CreateUserDto): Promise<Result> {
    try {
      const createUser = await new User(userDto).save();
      return { success: true, data: createUser }
    } catch (error) {
      console.error('User 저장 실패:', error);
      return { success: false, error: "User 생성 실패" }
    }
  }

  async update(userDto: UpdateUserDto): Promise<Result> {
    try {
      const updateUser = await User.findByIdAndUpdate(userDto.id, userDto, { new: true }).lean();

      if (!updateUser) {
        return { success: false, data: [] };
      }

      return { success: true, data: updateUser };
    } catch (error) {
      console.error('User 업데이트 실패: ', error);
      return { success: false, error: "User 업데이트 실패" };
    }
  }

  async delete(userId: string): Promise<Result> {
    try {
      const deleteUser = await User.findByIdAndDelete(userId);
      if (!deleteUser) {
        return { success: false, data: [] };
      }

      return { success: true, data: deleteUser };
    } catch (error) {
      console.error('User 삭제 실패: ', error);
      return { success: false, error: "User 삭제 실패" };
    }
  }
}