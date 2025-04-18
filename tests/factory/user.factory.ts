/**
 * User Factory 파일
 */

import { DB } from '@/database';

const User = DB.MONGO.User;

export const createUser = async (overrides = {}) => {
  const userData = {
    "username": "test",
    "password": "test123!",
    ...overrides,
  }

  return await User.create(userData);
}

export const loggedInUser = async (overrides = {}) => {
  const userData = {
    "username": "test",
    "password": "test123!",
    "isLoggedIn": "true",
    ...overrides,
  }

  return await User.create(userData);
}