import { getSecureParameter } from './parameters';

export const getJWTSecret = async (): Promise<string> => {
  const JWTSSMPath = process.env.JWT_SECRET!;

  const JWTSecret = await getSecureParameter(JWTSSMPath);

  return JWTSecret;
};
