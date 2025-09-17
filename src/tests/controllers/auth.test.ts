import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from '@middlewares/auth';
import { ErrorVariants } from '@utils/errorTypes';

const JWT_SECRET = process.env.JWT_SECRET!;

describe('requireAuth middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    req = { headers: {}, user: {} as any };
    res = {};
    next = vi.fn();
  });

  it('calls next with MissingAuthHeader when header is missing', () => {
    requireAuth(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(ErrorVariants.MissingAuthHeader);
  });

  it('calls next with InvalidAuthHeader when token is missing in header', () => {
    req.headers = { authorization: 'Bearer' };
    requireAuth(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(ErrorVariants.InvalidAuthHeader);
  });

  it('calls next with Unauthorized when token is invalid', () => {
    req.headers = { authorization: 'Bearer invalid.token' };
    requireAuth(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(ErrorVariants.Unauthorized);
  });

  it('attaches user and calls next() when token is valid', () => {
    const token = jwt.sign({ sub: '123', username: 'tester' }, JWT_SECRET);
    req = { headers: { authorization: `Bearer ${token}` }, user: {} as any };

    requireAuth(req as Request, res as Response, next as NextFunction);

    expect((req as any).user).toEqual({
      sub: '123',
      username: 'tester',
    });
    expect(next).toHaveBeenCalledWith();
  });
});
