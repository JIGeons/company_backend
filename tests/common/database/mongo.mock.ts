/**
 * Mongo Mock 파일
 * Mongo 의존 모듈 Mock 구현
 */
import { MongoServiceInterface } from "@/interfaces/database.interface";
import { ClientSession } from "mongoose";

// MongoService mock 구현
export const mongoServiceMock = {
  // transaction mock 구현
  withTransaction: jest.fn(<T>(callback: (session: ClientSession) => Promise<T>) => {
    return callback({} as ClientSession); // 최소 mockSession
  }),
} as jest.Mocked<MongoServiceInterface>;