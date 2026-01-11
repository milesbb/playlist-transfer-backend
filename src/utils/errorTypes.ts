export const ErrorVariants = {
  Unauthorized: {
    errorCode: 1000,
    errorKey: 'Unauthorized',
    message: 'User unauthorized for action.',
    httpStatus: 401,
  },
  MissingAuthHeader: {
    errorCode: 1001,
    errorKey: 'MissingAuthHeader',
    message: 'Authorization header is missing.',
    httpStatus: 401,
  },
  InvalidAuthHeader: {
    errorCode: 1002,
    errorKey: 'InvalidAuthHeader',
    message: 'Authorization header is missing. (Should be "Bearer <token>")',
    httpStatus: 401,
  },
  UsersError: (error: string) => ({
    errorCode: 2000,
    errorKey: 'UsersError',
    message: `Something went wrong with users: ${error}`,
    httpStatus: 400,
  }),
  ParsingError: (error: string) => ({
    errorCode: 2001,
    errorKey: 'ParseError',
    message: `Something went wrong when parsing: ${error}`,
    httpStatus: 400,
  }),
  NoRowsFoundError: {
    errorCode: 2002,
    errorKey: 'NoRowsFoundError',
    message: 'No rows returned by db from preceeding query.',
    httpStatus: 500,
  },
  IncorrectPassword: {
    errorCode: 2003,
    errorKey: 'IncorrectPassword',
    message: 'Incorrect password for account.',
    httpStatus: 401,
  },
  InvalidRefreshToken: {
    errorCode: 2004,
    errorKey: 'InvalidRefreshToken',
    message: 'Invalid refresh token.',
    httpStatus: 401,
  },
  NoUserFound: {
    errorCode: 2005,
    errorKey: 'NoUserFound',
    message: 'No user found with specified details',
    httpStatus: 400,
  },
  MissingCookies: (cookies: string[]) => ({
    errorCode: 2006,
    errorKey: 'MissingCookies',
    message: `Missing cookies from refresh request: ${cookies.join(', ')}`,
    httpStatus: 401,
  }),
  CaptchaFailed: {
    errorCode: 2007,
    errorKey: 'CaptchaFailed',
    message: 'Captcha check failed.',
    httpStatus: 401,
  },
};
