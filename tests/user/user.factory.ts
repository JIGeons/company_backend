/**
 * User Factory 파일
 */

import { DB } from '../../src/database';
import { CreateUserDto } from "../../src/dtos/mysql/user.dto";

export const createUser = async (userRepo: any, overrides = {}) => {
  const userData = {
    "id": 12345,
    "userId": "test",
    "email": "test@test.com",
    "name": "test_name",
    "password": "test123!",
    ...overrides,
  }

  const user = userRepo.create(userData);
  return await userRepo.save(user);
}

export const createLoggedInUser = async (userRepo: any, overrides = {}) => {
  const userData = {
    "id": 12345,
    "userId": "test",
    "email": "test@test.com",
    "name": "test",
    "password": "test123!",
    "isLoggedIn": true,
    ...overrides,
  }

  const user = userRepo.create(userData);
  return await userRepo.save(user);
}