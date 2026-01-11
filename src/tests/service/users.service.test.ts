import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as usersService from '@service/users';
import * as usersDataLayer from '@data/users';
import * as connections from '@utils/connections';

vi.mock('@data/users', () => ({
  areUsernameAndEmailUnique: vi.fn(),
  createUser: vi.fn(),
  getUser: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock('@utils/connections', () => ({
  getConnection: vi.fn(),
  release: vi.fn(),
}));

vi.mock('@utils/logging', () => ({
  default: { info: vi.fn() },
}));

describe('User Service Layer', () => {
  const mockConnection = {} as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (connections.getConnection as any).mockResolvedValue(mockConnection);
  });

  describe('createUser', () => {
    it('should call data layer functions correctly when user is unique', async () => {
      const userData = {
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: 'pw',
        captchaToken: 'test',
      };

      (usersDataLayer.areUsernameAndEmailUnique as any).mockResolvedValueOnce({
        usernameTaken: false,
        emailTaken: false,
      });

      await usersService.createUser(userData);

      expect(connections.getConnection).toHaveBeenCalled();
      expect(usersDataLayer.areUsernameAndEmailUnique).toHaveBeenCalledWith(
        userData,
        mockConnection,
      );
      expect(usersDataLayer.createUser).toHaveBeenCalledWith(
        userData,
        mockConnection,
      );
      expect(connections.release).toHaveBeenCalledWith(mockConnection);
    });

    it('should throw an error if username or email is taken', async () => {
      const userData = {
        username: 'bob',
        email: 'bob@example.com',
        passwordHash: 'pw',
        captchaToken: 'test',
      };

      (usersDataLayer.areUsernameAndEmailUnique as any).mockResolvedValueOnce({
        usernameTaken: true,
        emailTaken: false,
      });

      await expect(usersService.createUser(userData)).rejects.toThrow(
        'Username or email already taken!',
      );

      expect(usersDataLayer.createUser).not.toHaveBeenCalled();
      expect(connections.release).toHaveBeenCalledWith(mockConnection);
    });
  });

  describe('getUser', () => {
    it('should return the user from data layer', async () => {
      const userIdentificationData = { username: 'alice', email: undefined };
      const mockUser = {
        userId: 1,
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: 'pw',
      };

      (usersDataLayer.getUser as any).mockResolvedValue(mockUser);

      const result = await usersService.getUser(userIdentificationData);

      expect(connections.getConnection).toHaveBeenCalled();
      expect(usersDataLayer.getUser).toHaveBeenCalledWith(
        userIdentificationData,
        mockConnection,
      );
      expect(result).toEqual(mockUser);
      expect(connections.release).toHaveBeenCalledWith(mockConnection);
    });
  });

  describe('deleteUser', () => {
    it('should call deleteUser with userId', async () => {
      const testUserId = 2;

      (usersDataLayer.deleteUser as any).mockResolvedValue();

      await usersService.deleteUser(testUserId);

      expect(connections.getConnection).toHaveBeenCalled();
      expect(usersDataLayer.deleteUser).toHaveBeenCalledWith(
        testUserId,
        mockConnection,
      );
      expect(connections.release).toHaveBeenCalledWith(mockConnection);
    });
  });
});
