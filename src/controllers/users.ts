import { requireAuth } from '@middlewares/auth';
import { loginUser, logoutUser, refreshUserToken } from '@service/auth';
import { createUser, deleteUser } from '@service/users';
import { ErrorVariants } from '@utils/errorTypes';
import { Router, Response, Request, NextFunction } from 'express';
import { parseLoginRequest, parseUserCreateRequest } from './parsing/users';
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

      const { accessToken, refreshToken, userId } = await loginUser(password, {
        username: username,
        email: email,
      });

      res.status(200);
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // TODO: turn on when in prod
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.cookie('userId', userId, {
        httpOnly: true,
        secure: false, // TODO: turn on when in prod
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.json({ accessToken, userId });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const userId = req.cookies?.userId;

      const missingCookies: string[] = [];
      if (!refreshToken) missingCookies.push('refreshToken');
      if (!userId) missingCookies.push('userId');

      if (missingCookies.length) {
        return next(ErrorVariants.MissingCookies(missingCookies));
      }

      const accessToken = await refreshUserToken(
        parseInt(userId, 10),
        refreshToken!,
      );
      res.status(200).json({ accessToken });
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
