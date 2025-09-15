export const parseColumnValue = (row: any, colName: string) => {
  const value = row[colName];
  if (value == undefined) {
    throw new Error(
      `column ${colName} not found in row: ${Object.keys(row).join(', ')}`,
    );
  }
  return value;
};
