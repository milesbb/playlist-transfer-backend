import { createUser, getUser } from '@service/users';
import { Router, Response, Request, NextFunction } from 'express';
import { parseGetUserRequest, parseUserCreateRequest } from './parsing/users';

export const usersRoutePath = '/v1/users';

const router = Router();

router.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const createUserData = await parseUserCreateRequest(req.body);

      await createUser(createUserData);

      res.status(200).json({
        userCreated: true,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/user',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const getUserData = parseGetUserRequest(req.body);

      const user = await getUser(getUserData);

      res.status(200);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
