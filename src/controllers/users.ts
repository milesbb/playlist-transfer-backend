import { requireAuth } from '@middlewares/auth';
import { loginUser, logoutUser, refreshUserToken } from '@service/auth';
import { createUser, deleteUser } from '@service/users';
import { ErrorVariants } from '@utils/errorTypes';
import { Router, Response, Request, NextFunction } from 'express';
import {
  parseLoginRequest,
  parseRefreshTokenRequest,
  parseUserCreateRequest,
} from './parsing/users';
import { parseNumber } from './parsing/utils';

export const usersRoutePath = '/v1/users';

const router = Router();

// PUBLIC

router.post(
  '/signup',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const createUserData = await parseUserCreateRequest(req.body);

      await createUser(createUserData);

      res.status(200);
      res.json({
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { password, username, email } = parseLoginRequest(req.body);

      const tokens = await loginUser(password, {
        username: username,
        email: email,
      });

      res.status(200);
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, refreshToken } = parseRefreshTokenRequest(req.body);

      const accessToken = await refreshUserToken(userId, refreshToken);

      res.status(200);
      res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  },
);

// PROTECTED

router.post(
  '/logout',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseNumber(req.body.userId, 'userId', false);

      await logoutUser(userId);

      res.status(200);
      res.json({ message: 'User logged out' });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/account',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseNumber(req.body.userId, 'userId', false);

      await deleteUser(userId);

      res.status(200);
      res.json({ message: 'User account deleted' });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw ErrorVariants.Unauthorized;
      }

      res.status(200);
      res.json({ id: req.user.sub, username: req.user.username });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
