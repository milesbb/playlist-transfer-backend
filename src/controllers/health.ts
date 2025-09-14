import type { Request, Response, NextFunction } from 'express';

// Check health of API

export const checkApiHealth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.json({ isHealthCheckComplete: true });
  } catch (error) {
    next(error);
  }
};
