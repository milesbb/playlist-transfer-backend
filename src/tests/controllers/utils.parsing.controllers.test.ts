import { describe, it, expect } from 'vitest';
import { parseNumber, parseString } from '@controllers/parsing/utils';

describe('parseString', () => {
  it('should return trimmed string when value is valid', () => {
    const result = parseString('  hello world  ', 'testField', false);
    expect(result).toBe('hello world');
  });

  it('should throw error when value is undefined and not optional', () => {
    expect(() => parseString(undefined, 'testField', false)).toThrowError(
      "String field 'testField' is undefined.",
    );
  });

  it('should return undefined when value is undefined and optional', () => {
    const result = parseString(undefined, 'testField', true);
    expect(result).toBeUndefined();
  });

  it('should throw error when value is not a string', () => {
    expect(() => parseString(123 as any, 'testField', false)).toThrowError(
      "Expected string for field 'testField' and got number",
    );
  });

  it('should throw error when string is empty and not optional', () => {
    expect(() => parseString('   ', 'testField', false)).toThrowError(
      "Got empty string for field 'testField'",
    );
  });

  it('should allow empty string if optional', () => {
    const result = parseString('   ', 'testField', true);
    expect(result).toBe('');
  });
});

describe('parseNumber', () => {
  it('returns the number if value is a number', () => {
    expect(parseNumber(42, 'age', false)).toBe(42);
    expect(parseNumber(0, 'count', false)).toBe(0);
    expect(parseNumber(-123, 'balance', false)).toBe(-123);
  });

  it('throws if value is undefined and optional is false', () => {
    expect(() => parseNumber(undefined, 'age', false)).toThrowError(
      "Number field 'age' is undefined.",
    );
  });

  it('returns undefined if value is undefined and optional is true', () => {
    expect(parseNumber(undefined, 'age', true)).toBeUndefined();
  });

  it('throws if value is not a number', () => {
    expect(() => parseNumber('123', 'age', false)).toThrowError(
      "Expected number for field 'age' and got string",
    );
    expect(() => parseNumber(null, 'age', false)).toThrowError(
      "Expected number for field 'age' and got object",
    );
    expect(() => parseNumber({}, 'age', false)).toThrowError(
      "Expected number for field 'age' and got object",
    );
    expect(() => parseNumber([], 'age', false)).toThrowError(
      "Expected number for field 'age' and got object",
    );
    expect(() => parseNumber(true, 'age', false)).toThrowError(
      "Expected number for field 'age' and got boolean",
    );
  });

  it('works with optional true when value is a number', () => {
    expect(parseNumber(100, 'score', true)).toBe(100);
  });
});
