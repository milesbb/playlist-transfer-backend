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
import { getCaptchaSecret, getJWTSecret } from '@utils/aws/auth';
import { verify } from 'hcaptcha';

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL as any | '15m';
const REFRESH_TOKEN_TTL_DAYS = 30;

export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password, { type: argon2.argon2id });
};

export const verifyPassword = async (hash: string, password: string) => {
  logger.info('Verifying password...');
  const passwordResult = await argon2.verify(hash, password);
  if (passwordResult) {
    logger.info('Password verification: passed');
  } else {
    logger.error('Password verification: failed');
    throw ErrorVariants.IncorrectPassword;
  }
};

export const generateAccessToken = async (user: User): Promise<string> => {
  logger.info('Generating access token');

  const JWT_SECRET = await getJWTSecret();
  return jwt.sign({ sub: user.userId, username: user.username }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
};

export const generateRefreshToken = async (
  userId: number,
  connection: PoolClient,
): Promise<string> => {
  logger.info('Generating refresh token.');
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = await argon2.hash(rawToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  await addRefreshToken(tokenHash, userId, expiresAt, connection);
  logger.info('Refresh token generated successfully.');

  return rawToken;
};

export const verifyRefreshToken = async (
  userId: number,
  refreshToken: string,
  connection: PoolClient,
) => {
  logger.info('Verifying refresh token');
  const tokensData = await getRefreshTokens(userId, connection);

  for (const tokenData of tokensData) {
    if (await argon2.verify(tokenData.tokenHash, refreshToken)) {
      logger.info('Valid refresh token found and validated.');
      return;
    }
  }

  logger.info('Refresh token not found/invalid.');
  throw ErrorVariants.InvalidRefreshToken;
};

export const verifyCaptchaToken = async (captchaToken: string) => {
  logger.info('Verifying Captcha');

  const captchaSecretKey = await getCaptchaSecret();
  const verifyResult = await verify(captchaSecretKey, captchaToken);

  if (!verifyResult || !verifyResult.success) {
    logger.error('Failed Captcha');
    throw ErrorVariants.CaptchaFailed;
  }
  logger.info('Passed Captcha');
};

export const loginUser = async (
  password: string,
  userIdData: UserIdentificationData,
): Promise<{ userId: number } & LoginTokens> => {
  let connection: PoolClient = undefined as unknown as PoolClient;

  logger.info('Starting loginUser');
  try {
    connection = await getConnection();

    logger.info('Getting user details.');
    const user = await getUser(userIdData, connection);

    await verifyPassword(user.passwordHash, password);

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.userId, connection);

    return {
      accessToken,
      refreshToken,
      userId: user.userId,
    };
  } finally {
    release(connection);
    logger.info('Ending loginUser');
  }
};

export const refreshUserToken = async (
  userId: number,
  refreshToken: string,
): Promise<string> => {
  let connection: PoolClient = undefined as unknown as PoolClient;

  logger.info('Starting refreshUserToken');
  try {
    connection = await getConnection();

    await verifyRefreshToken(userId, refreshToken, connection);

    logger.info('Getting user details.');
    const user = await getUser(
      {
        userId,
        username: undefined,
        email: undefined,
      },
      connection,
    );

    const accessToken = await generateAccessToken(user);
    return accessToken;
  } finally {
    release(connection);
    logger.info('Ending refreshUserToken');
  }
};

export const logoutUser = async (userId: number) => {
  let connection: PoolClient = undefined as unknown as PoolClient;

  logger.info('Starting logoutUser');
  try {
    connection = await getConnection();
    await revokeRefreshToken(userId, connection);
  } finally {
    release(connection);
    logger.info('Ending logoutUser');
  }
};
