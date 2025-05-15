/**
 * Database interface 파일
 */
import { ClientSession } from "mongoose";

export interface MongoServiceInterface {
  withTransaction<T>(callback: (session: ClientSession) => Promise<T>): Promise<T>;
}