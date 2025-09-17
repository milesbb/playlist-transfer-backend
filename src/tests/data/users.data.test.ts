import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PoolClient } from 'pg';
import { createUser, areUsernameAndEmailUnique, getUser } from '@data/users';
import { query } from '@utils/connections';

vi.mock('@utils/connections', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

vi.mock('../src/data/utils', () => ({
  parseColumnValue: vi.fn((row, col) => row[col]),
}));

describe('User Data Layer', () => {
  let mockConnection: PoolClient;

  beforeEach(() => {
    mockConnection = {} as PoolClient;
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should call queryOne with correct SQL and parameters', async () => {
      const userData = {
        email: 'alice@example.com',
        username: 'alice',
        passwordHash: 'hashedpw',
      };
      await createUser(userData, mockConnection);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [userData.email, userData.username, userData.passwordHash],
        mockConnection,
      );
    });
  });

  describe('areUsernameAndEmailUnique', () => {
    it('should return uniqueness results correctly', async () => {
      const userData = {
        email: 'bob@example.com',
        username: 'bob',
        passwordHash: 'pw',
      };

      (query as any).mockResolvedValueOnce([
        { usernameTaken: true, emailTaken: false },
      ]);

      const result = await areUsernameAndEmailUnique(userData, mockConnection);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('EXISTS'),
        [userData.username, userData.email],
        mockConnection,
      );
      expect(result).toEqual({ usernameTaken: true, emailTaken: false });
    });
  });

  describe('getUser', () => {
    it('should return a user by email', async () => {
      const userData = { email: 'alice@example.com', username: undefined };
      (query as any).mockResolvedValueOnce({
        id: 1,
        username: 'alice',
        email: 'alice@example.com',
        password_hash: 'hashedpw',
      });

      const result = await getUser(userData, mockConnection);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [userData.email],
        mockConnection,
      );
      expect(result).toEqual({
        userId: 1,
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: 'hashedpw',
      });
    });

    it('should return a user by username', async () => {
      const userData = { username: 'bob', email: undefined };
      (query as any).mockResolvedValueOnce({
        id: 2,
        username: 'bob',
        email: 'bob@example.com',
        password_hash: 'pw123',
      });

      const result = await getUser(userData, mockConnection);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [userData.username],
        mockConnection,
      );
      expect(result).toEqual({
        userId: 2,
        username: 'bob',
        email: 'bob@example.com',
        passwordHash: 'pw123',
      });
    });

    it('should throw an error if no email or username provided', async () => {
      await expect(
        getUser(
          { email: undefined, username: undefined },
          mockConnection as any,
        ),
      ).rejects.toThrow();
    });
  });
});
