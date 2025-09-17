export type User = CreateUserData & {
  userId: number;
};

export type CreateUserData = UserIdentificationData & {
  passwordHash: string;
};

export type UserIdentificationDataWithOptionalId = UserIdentificationData & {
  userId?: number;
};

export type LoginData = UserIdentificationData & {
  password: string;
};

export interface UserIdentificationData {
  email: string | undefined;
  username: string | undefined;
}

export interface RefreshTokenData {
  token: string;
  userId: number;
}

export interface UniquenessResults {
  usernameTaken: boolean;
  emailTaken: boolean;
}
