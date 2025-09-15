/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Request, Response, NextFunction } from 'express';

export interface RespError extends Error {
  status?: number;
  statusCode?: number;
  httpStatus?: number;
  errorCode?: number;
  errorKey?: string;
  body?: any;
}

export const errorHandler = (
  err: RespError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  res.status(err.httpStatus || err.status || 500);
  res.send({
    message: err.message,
    errorCode: err.errorCode,
    errorKey: err.errorKey,
    body: err.body,
  });
};
