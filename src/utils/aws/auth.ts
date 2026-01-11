import { getSecureParameter } from './parameters';

export const getJWTSecret = async (): Promise<string> => {
  const JWTSSMPath = process.env.JWT_SECRET!;

  const JWTSecret = await getSecureParameter(JWTSSMPath);

  return JWTSecret;
};

export const getCaptchaSecret = async (): Promise<string> => {
  const CaptchaSecretSSMPath = process.env.CAPTCHA_SECRET_KEY!;

  const CaptchaSecret = await getSecureParameter(CaptchaSecretSSMPath);

  return CaptchaSecret;
};
