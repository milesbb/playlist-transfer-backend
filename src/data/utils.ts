import { ErrorVariants } from '@utils/errorTypes';

export const parseColumnValue = (row: any, colName: string): any => {
  const value = row[colName];
  if (value == undefined) {
    throw ErrorVariants.ParsingError(
      `column ${colName} not found in row: ${Object.keys(row).join(', ')}`,
    );
  }
  return value;
};

export const parseOptionalColumnValue = (row: any, colName: string): any => {
  if (row[colName] == undefined) {
    return null;
  } else {
    return parseColumnValue(row, colName);
  }
};
