/* eslint-disable @typescript-eslint/no-unused-vars */
import { getJWTSecret } from '@utils/aws/auth';
import { ErrorVariants } from '@utils/errorTypes';
import logger from '@utils/logging';
import type { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    username: string;
  };
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.info('Starting auth process...');
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    logger.info('Failed auth due to missing header.');
    next(ErrorVariants.MissingAuthHeader);
    return;
  }

  const token = authHeader!.split(' ')[1]; // Expect "Bearer <token>"
  if (!token) {
    logger.info('Failed auth due to malformed header.');
    next(ErrorVariants.InvalidAuthHeader);
    return;
  }

  const JWT_SECRET = await getJWTSecret();

  try {
    const decoded = jwt.verify(token!, JWT_SECRET) as JwtPayload;
    const user = {
      sub: decoded.sub!,
      username: decoded.username,
    };
    req.user = user;

    logger.info('Passed auth.');
    next();
    return;
  } catch (err) {
    logger.info('Failed auth due to lack of authorization.');
    next(ErrorVariants.Unauthorized);
    return;
  }
};
