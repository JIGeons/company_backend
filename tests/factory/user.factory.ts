/**
 * User Factory 파일
 */

import User from '@/models/user.model';
import {MONGO_URI} from "../../src/config";

export const createUser = async (overrides = {}) => {
  const userData = {
    "username": "test",
    "password": "test123!",
    ...overrides,
  }

  return await User.create(userData);
}

export const loggedinUser = async (overrides = {}) => {
  const userData = {
    "username": "test",
    "password": "test123!",
    "isLoggedIn": "true",
    ...overrides,
  }

  console.log("DataBase: ", MONGO_URI);
  return await User.create(userData);
}