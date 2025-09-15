import { describe, it, expect } from 'vitest';
import { parseString } from '@controllers/parsing/utils';

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
