/**
 * User Repository 파일
 */

import { DataSource } from "typeorm";
import { UserModel } from "../models/user.model";

export const UserRepository = (dataSource: DataSource) =>
  dataSource.getRepository(UserModel).extend({
    // 비밀번호 정보를 추가한 조회 query 생성
    async findByUserIdWithPW(userId: string) {
      const result =
        await this.createQueryBuilder("user")
          .addSelect("user.password")
          .where("user.userId = :userId ", { userId })
          .getOne();

      return result;
    },

    async findByUsername(name: string) {
      return this.findOneBy({ name });
    }
  })