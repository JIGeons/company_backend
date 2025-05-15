/**
 * Mongo Service 파일
 * mongoose의 트랜잭션의 관리
 */
import { Service } from 'typedi';
import { ClientSession } from "mongoose";
import { DB } from "@/database";
import { MongoServiceInterface } from "@interfaces/database.interface";
import {HttpException} from "@exceptions/httpException";

/**
 * MongoDB 트랜잭션 클래스
 */
@Service()
export class MongoService implements MongoServiceInterface {
  private readonly MongoDB = DB.MONGO.mongoose;

  public async withTransaction<T>(callback: (session: ClientSession) => Promise<T>): Promise<T> {
    console.log("### [MongoService] 트랜잭션 시작");
    // 트랜잭션 시작
    const session = await this.MongoDB.startSession();
    session.startTransaction();

    try {
      // 세션 단위 메서드 실행
      const result = await callback(session);
      // 성공 시 트랜잭션 커밋
      await session.commitTransaction();
      console.log("### [MongoService] 커밋");
      return result;  // 결과 반환
    } catch (error) {
      // 세션 실행 중 오류 발생 시 트랜잭션 롤백
      await session.abortTransaction();
      console.log("### [MongoService] 롤백");

      // error가 HttpException 타입인 경우
      if (error instanceof HttpException) {
        throw new HttpException(error.status, error.message, error?.error);
      } else {  // HttpException 타입이 아닌 경우
        throw error;
      }
    } finally {
      // 트랜잭션 세션 종료
      await session.endSession();
      console.log("### [MongoService] 세션 종료");
    }
  }
}