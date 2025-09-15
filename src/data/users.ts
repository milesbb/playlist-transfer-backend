import { PoolClient } from 'pg';
import { queryOne, query } from '@utils/connections';
import {
  CreateUserData,
  UniquenessResults,
  User,
  UserIdentificationData,
} from '@typeDefs/users';
import { parseColumnValue } from './utils';
import { ErrorVariants } from '@utils/errorTypes';

export const createUser = async (
  userData: CreateUserData,
  connection: PoolClient,
) => {
  await queryOne(
    `INSERT INTO users
        (
            email,
            username,
            password_hash
        )
        VALUES
        (
            $1,$2,$3
        )
        `,
    [userData.email, userData.username, userData.passwordHash],
    connection,
  );
};

export const areUsernameAndEmailUnique = async (
  userData: CreateUserData,
  connection: PoolClient,
): Promise<UniquenessResults> => {
  const result = await query(
    `SELECT
            (EXISTS (SELECT 1 FROM users WHERE username = $1)) AS "usernameTaken",
            (EXISTS (SELECT 1 FROM users WHERE email = $2)) AS "emailTaken";
        `,
    [userData.username, userData.email],
    connection,
  );

  return {
    usernameTaken: parseColumnValue(result[0], 'usernameTaken'),
    emailTaken: parseColumnValue(result[0], 'emailTaken'),
  };
};

const parseRowToUser = (row: any): User => {
  return {
    userId: parseColumnValue(row, 'id'),
    username: parseColumnValue(row, 'username'),
    email: parseColumnValue(row, 'email'),
    passwordHash: parseColumnValue(row, 'password_hash'),
  };
};

export const getUser = async (
  userData: UserIdentificationData,
  connection: PoolClient,
): Promise<User> => {
  let searchString = '';
  let queryParams: string[] = [];
  if (userData.email) {
    searchString = `WHERE email = $1`;
    queryParams = [userData.email];
  } else if (userData.username) {
    searchString = `WHERE username = $1`;
    queryParams = [userData.username];
  } else {
    throw ErrorVariants.UsersError(
      'No valid email or username to search for user by during getUser!',
    );
  }

  const result = await queryOne(
    `SELECT
          id,
          username,
          email,
          password_hash
        FROM users
        ${searchString}
          `,
    queryParams,
    connection,
  );

  return parseRowToUser(result);
};
