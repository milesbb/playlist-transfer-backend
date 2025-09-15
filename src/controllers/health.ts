/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router, Request, Response, NextFunction } from 'express';

export const healthRoutePath = '/v1/health';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({ isHealthCheckComplete: true });
});

export default router;
