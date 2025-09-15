export type User = CreateUserData & {
  userId: string;
};

export type CreateUserData = UserIdentificationData & {
  passwordHash: string;
};

export interface UserIdentificationData {
  email: string | undefined;
  username: string | undefined;
}

export interface RefreshTokenData {
  token: string;
  userId: string;
}

export interface UniquenessResults {
  usernameTaken: boolean;
  emailTaken: boolean;
}
