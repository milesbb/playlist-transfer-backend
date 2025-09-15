import { CreateUserData, UserIdentificationData } from '@typeDefs/users';
import { hashPassword } from '../../auth/auth';
import { parseString } from './utils';

export const parseUserCreateRequest = async (
  body: any,
): Promise<CreateUserData> => {
  const passwordHash = await hashPassword(
    parseString(body.passwordHash, 'passwordHash', false),
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
