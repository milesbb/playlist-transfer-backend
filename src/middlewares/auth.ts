/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorVariants } from '@utils/errorTypes';
import type { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    username: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET!;

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    next(ErrorVariants.MissingAuthHeader);
    return;
  }

  const token = authHeader!.split(' ')[1]; // Expect "Bearer <token>"
  if (!token) {
    next(ErrorVariants.InvalidAuthHeader);
    return;
  }

  try {
    const decoded = jwt.verify(token!, JWT_SECRET) as JwtPayload;
    const user = {
      sub: decoded.sub!,
      username: decoded.username,
    };
    req.user = user;
    next();
    return;
  } catch (err) {
    next(ErrorVariants.Unauthorized);
    return;
  }
};
