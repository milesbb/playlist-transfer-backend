import { CreateUserData, User, UserIdentificationData } from '@typeDefs/users';
import { getConnection, release } from '@utils/connections';
import { PoolClient } from 'pg';
import * as usersDataLayer from '@data/users';
import logger from '@utils/logging';
import { ErrorVariants } from '@utils/errorTypes';

export const createUser = async (userData: CreateUserData) => {
  let connection: PoolClient = undefined as unknown as PoolClient;

  logger.info('Starting createUser');

  try {
    connection = await getConnection();

    logger.info('Checking if username and email are unique');
    const uniquenessResults = await usersDataLayer.areUsernameAndEmailUnique(
      userData,
      connection,
    );
    logger.info('Uniqueness results:', uniquenessResults);

    if (uniquenessResults.emailTaken || uniquenessResults.usernameTaken) {
      throw ErrorVariants.UsersError('Username or email already taken!');
    }

    await usersDataLayer.createUser(userData, connection);
  } finally {
    release(connection);
    logger.info('Ending createUser');
  }
};

export const getUser = async (
  userIdentificationData: UserIdentificationData,
): Promise<User> => {
  let connection: PoolClient = undefined as unknown as PoolClient;

  logger.info('Starting getUser');

  try {
    connection = await getConnection();

    const user = await usersDataLayer.getUser(
      userIdentificationData,
      connection,
    );

    return user;
  } finally {
    release(connection);
    logger.info('Ending getUser');
  }
};
