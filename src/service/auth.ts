import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getConnection, release } from '@utils/connections';
import { PoolClient } from 'pg';
import {
  addRefreshToken,
  getRefreshTokens,
  revokeRefreshToken,
} from '@data/auth';
import { User, UserIdentificationData } from '@typeDefs/users';
import { LoginTokens } from '@typeDefs/auth';
import { getUser } from '@data/users';
import logger from '@utils/logging';
import { ErrorVariants } from '@utils/errorTypes';

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL as any | '15m';
const REFRESH_TOKEN_TTL_DAYS = 30;

export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password, { type: argon2.argon2id });
};

export const verifyPassword = async (hash: string, password: string) => {
  const passwordResult = await argon2.verify(hash, password);
  if (passwordResult) {
    logger.info('Password verification: passed');
  } else {
    logger.error('Password verification: failed');
    throw ErrorVariants.IncorrectPassword;
  }
};

export const generateAccessToken = (user: User): string => {
  return jwt.sign({ sub: user.userId, username: user.username }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
};

export const generateRefreshToken = async (
  userId: number,
  connection: PoolClient,
): Promise<string> => {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = await argon2.hash(rawToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  await addRefreshToken(tokenHash, userId, expiresAt, connection);

  return rawToken;
};

export const verifyRefreshToken = async (
  userId: number,
  refreshToken: string,
  connection: PoolClient,
) => {
  const tokensData = await getRefreshTokens(userId, connection);
  let relevantToken = undefined;
  for (const tokenData of tokensData) {
    if (await argon2.verify(tokenData.tokenHash, refreshToken)) {
      relevantToken = tokenData;
    }
  }

  if (!relevantToken) {
    throw ErrorVariants.InvalidRefreshToken;
  }
};

export const loginUser = async (
  password: string,
  userIdData: UserIdentificationData,
): Promise<LoginTokens> => {
  let connection: PoolClient = undefined as unknown as PoolClient;
  try {
    connection = await getConnection();
    const user = await getUser(userIdData, connection);

    await verifyPassword(user.passwordHash, password);

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.userId, connection);

    return {
      accessToken,
      refreshToken,
    };
  } finally {
    release(connection);
  }
};

export const refreshUserToken = async (
  userId: number,
  refreshToken: string,
): Promise<string> => {
  let connection: PoolClient = undefined as unknown as PoolClient;
  try {
    connection = await getConnection();
    await verifyRefreshToken(userId, refreshToken, connection);
    const user = await getUser(
      {
        userId,
        username: undefined,
        email: undefined,
      },
      connection,
    );
    const accessToken = generateAccessToken(user);
    return accessToken;
  } finally {
    release(connection);
  }
};

export const logoutUser = async (userId: number) => {
  let connection: PoolClient = undefined as unknown as PoolClient;
  try {
    connection = await getConnection();
    await revokeRefreshToken(userId, connection);
  } finally {
    release(connection);
  }
};
