import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      sub: string;
      username: string;
      iat?: number;
      exp?: number;
    };
  }
}
