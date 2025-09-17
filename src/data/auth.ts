import { RefreshToken } from '@typeDefs/auth';
import { query } from '@utils/connections';
import { PoolClient } from 'pg';
import { parseColumnValue } from './utils';

export const addRefreshToken = async (
  tokenHash: string,
  userId: number,
  expiresAt: Date,
  connection: PoolClient,
) => {
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
    connection,
  );
};

const parseRowToRefreshToken = (row: any): RefreshToken => {
  return {
    tokenId: parseColumnValue(row, 'id'),
    userId: parseColumnValue(row, 'user_id'),
    tokenHash: parseColumnValue(row, 'token_hash'),
    expiresAt: parseColumnValue(row, 'expires_at'),
    revokedAt: parseColumnValue(row, 'revoked_at'),
    createdAt: parseColumnValue(row, 'created_at'),
  };
};

export const getRefreshTokens = async (
  userId: number,
  connection: PoolClient,
): Promise<RefreshToken[]> => {
  const results = await query(
    `SELECT * FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > now()`,
    [userId],
    connection,
  );

  return results.map((row: any) => parseRowToRefreshToken(row));
};

export const revokeRefreshToken = async (
  userId: number,
  connection: PoolClient,
) => {
  await query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1`,
    [userId],
    connection,
  );
};
