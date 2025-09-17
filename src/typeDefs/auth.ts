export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshToken {
  tokenId: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}
