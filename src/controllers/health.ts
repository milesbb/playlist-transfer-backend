import { Router, Response } from 'express';

export const healthRoutePath = '/v1/health';

const router = Router();

router.get('/', (res: Response) => {
  res.json({ isHealthCheckComplete: true });
});

export default router;
