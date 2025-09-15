export const parseString = <T extends boolean = false>(
  value: unknown,
  name: string,
  optional: T,
): T extends true ? string | undefined : string => {
  if (value === undefined) {
    if (optional) {
      return undefined as any;
    }
    throw new Error(`String field '${name}' is undefined.`);
  }

  if (typeof value !== 'string') {
    throw new Error(
      `Expected string for field '${name}' and got ${typeof value}`,
    );
  }

  const trimmed = value.trim();

  if (!trimmed && !optional) {
    throw new Error(`Got empty string for field '${name}'`);
  }

  return trimmed as any;
};
