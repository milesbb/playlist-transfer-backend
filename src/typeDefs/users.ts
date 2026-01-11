export type User = UserDataWithPassword & {
  userId: number;
};

interface CaptchaToken {
  captchaToken: string;
}

export type UserDataWithPassword = UserIdentificationData & {
  passwordHash: string;
};

export type CreateUserData = UserDataWithPassword & CaptchaToken;

export type UserIdentificationDataWithOptionalId = UserIdentificationData & {
  userId?: number;
};

export type LoginData = UserIdentificationData &
  CaptchaToken & {
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
