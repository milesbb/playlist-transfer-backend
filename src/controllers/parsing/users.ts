import {
  CreateUserData,
  LoginData,
  UserIdentificationData,
} from '@typeDefs/users';
import { hashPassword } from '../../service/auth';
import { parseNumber, parseString } from './utils';

export const parseUserCreateRequest = async (
  body: any,
): Promise<CreateUserData> => {
  const passwordHash = await hashPassword(
    parseString(body.password, 'password', false),
  );
  return {
    username: parseString(body.username, 'username', false),
    email: parseString(body.email, 'email', false),
    passwordHash,
  };
};

export const parseGetUserRequest = (body: any): UserIdentificationData => {
  return {
    username: parseString(body.username, 'username', true),
    email: parseString(body.email, 'email', true),
  };
};

export const parseLoginRequest = (body: any): LoginData => {
  return {
    username: parseString(body.username, 'username', true),
    email: parseString(body.email, 'email', true),
    password: parseString(body.password, 'password', false),
  };
};

export const parseRefreshTokenRequest = (
  body: any,
): { userId: number; refreshToken: string } => {
  return {
    userId: parseNumber(body.userId, 'userId', false),
    refreshToken: parseString(body.refreshToken, 'refreshToken', false),
  };
};
