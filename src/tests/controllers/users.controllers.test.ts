import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import usersRouter, { usersRoutePath } from '@controllers/users';
import * as userService from '@service/users';
import { ErrorVariants } from '@utils/errorTypes';
import { errorHandler } from '@middlewares/errorHandler';

vi.mock('@service/users', () => ({
  createUser: vi.fn(),
  getUser: vi.fn(),
}));

describe('Users Controller (supertest)', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(usersRoutePath, usersRouter);
    app.use(errorHandler);

    vi.clearAllMocks();
  });

  describe('POST /v1/users/register', () => {
    it('should create a user successfully', async () => {
      const mockRequestData = {
        username: 'alice',
        email: 'alice@example.com',
        password: 'testpass',
      };

      const mockCreateUserData = {
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: expect.anything(),
      };

      (userService.createUser as any).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`${usersRoutePath}/register`)
        .send(mockRequestData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ userCreated: true });
      expect(userService.createUser).toHaveBeenCalledWith(mockCreateUserData);
    });

    it('should call next with error if parsing fails', async () => {
      const response = await request(app)
        .post(`${usersRoutePath}/register`)
        .send({ username: 0 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errorKey');
    });
  });

  describe('GET /v1/users/user', () => {
    it('should get a user successfully', async () => {
      const mockUserData = { username: 'bob' };
      const mockUser = {
        userId: 1,
        username: 'bob',
        email: 'bob@example.com',
        passwordHash: expect.anything(),
      };

      (userService.getUser as any).mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`${usersRoutePath}/user`)
        .send(mockUserData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(userService.getUser).toHaveBeenCalledWith({
        email: undefined,
        username: mockUserData.username,
      });
    });

    it('should call next with 500 error if service fails', async () => {
      (userService.getUser as any).mockRejectedValue(
        ErrorVariants.ParsingError('test'),
      );

      const response = await request(app)
        .get(`${usersRoutePath}/user`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errorKey');
    });
  });
});
