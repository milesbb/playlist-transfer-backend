import type { Request, Response, NextFunction } from 'express';

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
