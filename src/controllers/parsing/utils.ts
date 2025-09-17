import { ErrorVariants } from '@utils/errorTypes';

export const parseString = <T extends boolean = false>(
  value: unknown,
  name: string,
  optional: T,
): T extends true ? string | undefined : string => {
  if (value === undefined) {
    if (optional) {
      return undefined as any;
    }
    throw ErrorVariants.ParsingError(`String field '${name}' is undefined.`);
  }

  if (typeof value !== 'string') {
    throw ErrorVariants.ParsingError(
      `Expected string for field '${name}' and got ${typeof value}`,
    );
  }

  const trimmed = value.trim();

  if (!trimmed && !optional) {
    throw ErrorVariants.ParsingError(`Got empty string for field '${name}'`);
  }

  return trimmed as any;
};

export const parseNumber = <T extends boolean = false>(
  value: unknown,
  name: string,
  optional: T,
): T extends true ? number | undefined : number => {
  if (value === undefined) {
    if (optional) {
      return undefined as any;
    }
    throw ErrorVariants.ParsingError(`Number field '${name}' is undefined.`);
  }

  if (typeof value !== 'number') {
    throw ErrorVariants.ParsingError(
      `Expected number for field '${name}' and got ${typeof value}`,
    );
  }

  return value as any;
};
