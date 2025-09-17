/* eslint-disable @typescript-eslint/no-unused-vars */
import { requireAuth } from '@middlewares/auth';
import { Router, Request, Response, NextFunction } from 'express';

export const healthRoutePath = '/v1/health';

const router = Router();

router.get('/public', (req: Request, res: Response, next: NextFunction) => {
  res.json({ isHealthCheckComplete: true });
});

router.get(
  '/protected',
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ isHealthCheckComplete: true });
  },
);

export default router;
