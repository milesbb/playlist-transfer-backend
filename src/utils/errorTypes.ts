export const ErrorVariants = {
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
};
