import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as authService from '@service/auth';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import hcaptcha from 'hcaptcha';
import * as connections from '@utils/connections';
import * as authData from '@data/auth';
import * as userData from '@data/users';
import { ErrorVariants } from '@utils/errorTypes';
import { getJWTSecret, getCaptchaSecret } from '@utils/aws/auth';

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL!;

vi.mock('argon2');
vi.mock('jsonwebtoken');
vi.mock('crypto');
vi.mock('hcaptcha');
vi.mock('@utils/connections');
vi.mock('@data/auth', () => ({
  addRefreshToken: vi.fn(),
  getRefreshTokens: vi.fn(),
  revokeRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
  generateAccessToken: vi.fn(),
}));
vi.mock('@utils/aws/auth', () => ({
  getJWTSecret: vi.fn(),
  getCaptchaSecret: vi.fn(),
}));
vi.mock('@data/users', () => ({
  getUser: vi.fn(),
}));

describe('authService', () => {
  let mockConnection: any;

  beforeEach(() => {
    mockConnection = {};
    (connections.getConnection as any).mockResolvedValue(mockConnection);
    (connections.release as any).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('hashPassword', () => {
    it('calls argon2.hash and returns hashed password', async () => {
      (argon2.hash as any).mockResolvedValue('hashedPassword');
      const result = await authService.hashPassword('mypassword');
      expect(argon2.hash).toHaveBeenCalledWith('mypassword', {
        type: argon2.argon2id,
      });
      expect(result).toBe('hashedPassword');
    });
  });

  describe('verifyPassword', () => {
    it('passes for correct password', async () => {
      (argon2.verify as any).mockResolvedValue(true);
      await authService.verifyPassword('hash', 'password');
    });

    it('throws for incorrect password', async () => {
      (argon2.verify as any).mockResolvedValue(false);
      await expect(authService.verifyPassword('hash', 'password')).rejects.toBe(
        ErrorVariants.IncorrectPassword,
      );
    });
  });

  describe('generateAccessToken', () => {
    it('calls jwt.sign and returns token', async () => {
      (getJWTSecret as any).mockResolvedValue('test-secret');
      (jwt.sign as any).mockReturnValue('token');
      const user = { userId: 1, username: 'alice', passwordHash: 'hash' };
      const token = await authService.generateAccessToken(user as any);
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: 1, username: 'alice' },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL || '15m' },
      );
      expect(token).toBe('token');
    });
  });

  describe('generateRefreshToken', () => {
    it('calls argon2.hash and addRefreshToken, returns raw token', async () => {
      (crypto.randomBytes as any).mockReturnValue(Buffer.from('a'.repeat(64)));
      (argon2.hash as any).mockResolvedValue('hashedtoken');
      (authData.addRefreshToken as any).mockResolvedValue(undefined);

      const token = await authService.generateRefreshToken(1, mockConnection);
      expect(token).toBeDefined();
      expect(argon2.hash).toHaveBeenCalled();
      expect(authData.addRefreshToken).toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('returns tokens when password correct', async () => {
      (userData.getUser as any).mockResolvedValue({
        userId: 1,
        username: 'alice',
        passwordHash: 'hash',
      });
      (argon2.verify as any).mockResolvedValue(true);
      (jwt.sign as any).mockReturnValue('accessToken');
      (crypto.randomBytes as any).mockReturnValue(Buffer.from('a'.repeat(64)));
      (argon2.hash as any).mockResolvedValue('refreshHash');
      (authData.addRefreshToken as any).mockResolvedValue(undefined);

      const result = await authService.loginUser('password', {
        email: 'a@b.com',
      } as any);
      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: expect.any(String),
        userId: 1,
      });
    });

    it('throws if password incorrect', async () => {
      (userData.getUser as any).mockResolvedValue({
        userId: 1,
        username: 'alice',
        passwordHash: 'hash',
      });
      (argon2.verify as any).mockResolvedValue(false);

      await expect(
        authService.loginUser('password', { email: 'a@b.com' } as any),
      ).rejects.toBe(ErrorVariants.IncorrectPassword);
    });
  });

  describe('refreshUserToken', () => {
    it('returns new access token if refresh token valid', async () => {
      (jwt.sign as any).mockReturnValue('newAccessToken');
      (argon2.verify as any).mockReturnValue(true);
      (userData.getUser as any).mockResolvedValue({
        userId: 1,
        username: 'alice',
      });
      (authData.getRefreshTokens as any).mockResolvedValue([
        {
          tokenId: 1,
          userId: 2,
          tokenHash: '2',
          expiresAt: new Date(),
          revokedAt: new Date(),
          createdAt: new Date(),
        },
      ]);

      const token = await authService.refreshUserToken(1, 'refreshToken');
      expect(token).toBe('newAccessToken');
    });
  });

  describe('logoutUser', () => {
    it('calls revokeRefreshToken with userId and connection', async () => {
      (authData.revokeRefreshToken as any).mockResolvedValue(undefined);
      await authService.logoutUser(1);
      expect(authData.revokeRefreshToken).toHaveBeenCalledWith(
        1,
        mockConnection,
      );
    });
  });

  describe('verifyCaptchaToken', () => {
    it('Doesnt throw if captcha verify success is true', async () => {
      (getCaptchaSecret as any).mockResolvedValue('secret');
      (hcaptcha.verify as any).mockResolvedValue({ success: true });
      await expect(authService.verifyCaptchaToken).not.toThrow();
    });

    it('throws if captcha verify doesnt return anything', async () => {
      (getCaptchaSecret as any).mockResolvedValue('secret');
      (hcaptcha.verify as any).mockResolvedValue();
      expect(authService.verifyCaptchaToken).rejects.toThrow(
        'Captcha check failed.',
      );
    });

    it('throws if captcha verify success is false', async () => {
      (getCaptchaSecret as any).mockResolvedValue('secret');
      (hcaptcha.verify as any).mockResolvedValue({ success: false });
      expect(authService.verifyCaptchaToken).rejects.toThrow(
        'Captcha check failed.',
      );
    });
  });
});
