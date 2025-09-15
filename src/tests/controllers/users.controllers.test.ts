import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import usersRouter, { usersRoutePath } from '@controllers/users';
import * as userService from '@service/users';
import * as userParsing from '@controllers/parsing/users';

vi.mock('@service/users', () => ({
  createUser: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock('@controllers/parsing/users', () => ({
  parseUserCreateRequest: vi.fn(),
  parseGetUserRequest: vi.fn(),
}));

describe('Users Controller (supertest)', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(usersRoutePath, usersRouter);

    vi.clearAllMocks();
  });

  describe('POST /v1/users/register', () => {
    it('should create a user successfully', async () => {
      const mockCreateUserData = {
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: 'hashedpw',
      };
      (userParsing.parseUserCreateRequest as any).mockResolvedValue(
        mockCreateUserData,
      );
      (userService.createUser as any).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`${usersRoutePath}/register`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ userCreated: true });
      expect(userParsing.parseUserCreateRequest).toHaveBeenCalled();
      expect(userService.createUser).toHaveBeenCalledWith(mockCreateUserData);
    });

    it('should call next with error if parsing fails', async () => {
      (userParsing.parseUserCreateRequest as any).mockRejectedValue(
        new Error('Parsing error'),
      );

      const response = await request(app)
        .post(`${usersRoutePath}/register`)
        .send({});

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /v1/users/user', () => {
    it('should get a user successfully', async () => {
      const mockUserData = { username: 'bob' };
      const mockUser = {
        userId: 1,
        username: 'bob',
        email: 'bob@example.com',
        passwordHash: 'pw',
      };

      (userParsing.parseGetUserRequest as any).mockReturnValue(mockUserData);
      (userService.getUser as any).mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`${usersRoutePath}/user`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(userParsing.parseGetUserRequest).toHaveBeenCalled();
      expect(userService.getUser).toHaveBeenCalledWith(mockUserData);
    });

    it('should call next with error if service fails', async () => {
      (userParsing.parseGetUserRequest as any).mockReturnValue({});
      (userService.getUser as any).mockRejectedValue(
        new Error('Service error'),
      );

      const response = await request(app)
        .get(`${usersRoutePath}/user`)
        .send({});

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
