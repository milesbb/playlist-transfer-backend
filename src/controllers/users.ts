import { createUser, getUser } from '@service/users';
import { Router, Response, Request } from 'express';
import { parseGetUserRequest, parseUserCreateRequest } from './parsing/users';

export const usersRoutePath = '/v1/users';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const createUserData = await parseUserCreateRequest(req.body);

    await createUser(createUserData);

    res.status(200).json({
      userCreated: true,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get('/user', async (req: Request, res: Response) => {
  try {
    const getUserData = parseGetUserRequest(req.body);

    const user = await getUser(getUserData);

    res.status(200);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error });
  }
});

export default router;
