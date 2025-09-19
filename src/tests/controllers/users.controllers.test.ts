import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import usersRouter, { usersRoutePath } from '@controllers/users';
import * as userService from '@service/users';
import * as authService from '@service/auth';
import { errorHandler } from '@middlewares/errorHandler';
import { LoginTokens } from '@typeDefs/auth';
import cookieParser from 'cookie-parser';

vi.mock('@service/users', () => ({
  createUser: vi.fn(),
  getUser: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock('@service/auth', () => ({
  loginUser: vi.fn(),
  refreshUserToken: vi.fn(),
  logoutUser: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock('@middlewares/auth', () => ({
  requireAuth: vi.fn().mockImplementation((req, res, next) => {
    req.user = { sub: 'fake', username: 'mocked-user' };
    next();
  }),
}));

describe('Users Controller (supertest)', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(cookieParser());
    app.use(express.json());
    app.use(usersRoutePath, usersRouter);
    app.use(errorHandler);

    vi.clearAllMocks();
  });

  describe('POST /v1/users/signup', () => {
    it('should create a user successfully', async () => {
      const mockRequestData = {
        username: 'alice',
        email: 'alice@example.com',
        password: 'testpass',
      };

      const mockCreateUserData = {
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: 'hashed',
      };

      (authService.hashPassword as any).mockResolvedValue(
        mockCreateUserData.passwordHash,
      );
      (userService.createUser as any).mockResolvedValue();

      const response = await request(app)
        .post(`${usersRoutePath}/signup`)
        .send(mockRequestData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User created successfully' });
      expect(userService.createUser).toHaveBeenCalledWith(mockCreateUserData);
    });

    it('should call next with error if parsing fails', async () => {
      (authService.hashPassword as any).mockResolvedValue('hashed');
      const response = await request(app)
        .post(`${usersRoutePath}/signup`)
        .send({ username: 3 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errorKey');
    });
  });

  describe('POST /v1/users/login', () => {
    it('should login a user successfully', async () => {
      const mockRequestData = {
        username: 'alice',
        email: 'alice@example.com',
        password: 'testpass',
      };

      const testTokens: LoginTokens & { userId: number } = {
        accessToken: 'test',
        refreshToken: 'test2',
        userId: 1,
      };

      (authService.loginUser as any).mockResolvedValue(testTokens);

      const response = await request(app)
        .post(`${usersRoutePath}/login`)
        .send(mockRequestData);

      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(response.status).toBe(200);
      expect(cookies).toBeDefined();
      const hasRefreshToken = cookies?.some((cookie: string) =>
        cookie.startsWith('refreshToken='),
      );
      expect(hasRefreshToken).toBe(true);
      expect(cookies![0]).toContain('HttpOnly');
      expect(cookies![0]).toContain('Max-Age=604800');
      expect(response.body).toEqual({
        accessToken: testTokens.accessToken,
        userId: testTokens.userId,
      });
      expect(authService.loginUser).toHaveBeenCalledWith(
        mockRequestData.password,
        {
          username: mockRequestData.username,
          email: mockRequestData.email,
        },
      );
    });

    it('should call next with error if parsing fails', async () => {
      const response = await request(app)
        .post(`${usersRoutePath}/login`)
        .send({ username: 'test', email: 'test' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errorKey');
    });
  });

  describe('POST /v1/users/refresh', () => {
    it('should refresh token successfully', async () => {
      const mockCookies = {
        userId: '1',
        refreshToken: 'test',
      };

      const testAccessToken = 'test2';

      (authService.refreshUserToken as any).mockResolvedValue(testAccessToken);

      const response = await request(app)
        .post(`${usersRoutePath}/refresh`)
        .set('Cookie', [
          `userId=${mockCookies.userId}`,
          `refreshToken=${mockCookies.refreshToken}`,
        ])
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ accessToken: testAccessToken });
      expect(authService.refreshUserToken).toHaveBeenCalledWith(
        1,
        mockCookies.refreshToken,
      );
    });

    it('should error 401 next with error if missing cookies', async () => {
      const response = await request(app)
        .post(`${usersRoutePath}/refresh`)
        .send({ username: 0 });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('errorKey');
    });
  });

  describe('POST /v1/users/logout', () => {
    it('should logout a user successfully', async () => {
      const testUserId = 1;

      (authService.logoutUser as any).mockResolvedValue();

      const response = await request(app)
        .post(`${usersRoutePath}/logout`)
        .send({ userId: testUserId });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User logged out' });
      expect(authService.logoutUser).toHaveBeenCalledWith(testUserId);
    });

    it('should call next with error if parsing fails', async () => {
      const response = await request(app)
        .post(`${usersRoutePath}/logout`)
        .send({ username: 0 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errorKey');
    });
  });

  describe('DELETE /v1/users/account', () => {
    it('should create a user successfully', async () => {
      const testUserId = 1;

      (userService.deleteUser as any).mockResolvedValue();

      const response = await request(app)
        .delete(`${usersRoutePath}/account`)
        .send({ userId: testUserId });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User account deleted' });
      expect(userService.deleteUser).toHaveBeenCalledWith(testUserId);
    });

    it('should call next with error if parsing fails', async () => {
      const response = await request(app)
        .delete(`${usersRoutePath}/account`)
        .send({ username: 0 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errorKey');
    });
  });
});
