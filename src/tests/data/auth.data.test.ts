import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PoolClient } from 'pg';
import {
  getRefreshTokens,
  revokeRefreshToken,
  addRefreshToken,
} from '@data/auth';
import { query } from '@utils/connections';

vi.mock('@utils/connections', () => ({
  query: vi.fn(),
}));

vi.mock('../src/data/utils', () => ({
  parseColumnValue: vi.fn((row, col) => row[col]),
}));

describe('Auth Data Layer', () => {
  let mockConnection: PoolClient;

  beforeEach(() => {
    mockConnection = {} as PoolClient;
    vi.clearAllMocks();
  });

  const testTokenHash = 'test';
  const testUserId = 2;
  const testExpiresAt = new Date();

  describe('addRefreshToken', () => {
    it('should call query with passed parameters', async () => {
      await addRefreshToken(
        testTokenHash,
        testUserId,
        testExpiresAt,
        mockConnection,
      );

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        [testUserId, testTokenHash, testExpiresAt],
        mockConnection,
      );
    });
  });

  describe('getRefreshTokens', () => {
    it('should call query with passed parameters', async () => {
      (query as any).mockResolvedValue([
        {
          id: 'test',
          user_id: testUserId,
          token_hash: 'test',
          expires_at: testExpiresAt,
          revoked_at: 'test',
          created_at: testExpiresAt,
        },
      ]);
      const result = await getRefreshTokens(testUserId, mockConnection);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [testUserId],
        mockConnection,
      );
      expect(result[0]?.userId).toBe(testUserId);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should call query with passed parameters', async () => {
      (query as any).mockResolvedValue();
      await revokeRefreshToken(testUserId, mockConnection);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        [testUserId],
        mockConnection,
      );
    });
  });
});
