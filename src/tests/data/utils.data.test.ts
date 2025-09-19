import { describe, it, expect } from 'vitest';
import { parseColumnValue, parseOptionalColumnValue } from '@data/utils';

describe('parseColumnValue', () => {
  it('should return the value for an existing column', () => {
    const row = {
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
    };

    expect(parseColumnValue(row, 'id')).toBe(1);
    expect(parseColumnValue(row, 'username')).toBe('alice');
    expect(parseColumnValue(row, 'email')).toBe('alice@example.com');
  });

  it('should throw an error if the column is missing', () => {
    const row = {
      id: 1,
      username: 'alice',
    };

    expect(() => parseColumnValue(row, 'email')).toThrowError(
      'column email not found in row: id, username',
    );
  });

  it('should throw an error if the column exists but value is undefined', () => {
    const row = {
      id: undefined,
      username: 'bob',
    };

    expect(() => parseColumnValue(row, 'id')).toThrowError(
      'column id not found in row: id, username',
    );
  });

  it('should work for falsy but defined values', () => {
    const row = {
      count: 0,
      active: false,
      name: '',
    };

    expect(parseColumnValue(row, 'count')).toBe(0);
    expect(parseColumnValue(row, 'active')).toBe(false);
    expect(parseColumnValue(row, 'name')).toBe('');
  });
});

describe('parseOptionalColumnValue', () => {
  it('should return the value for an existing column', () => {
    const row = {
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
    };

    expect(parseOptionalColumnValue(row, 'id')).toBe(1);
    expect(parseOptionalColumnValue(row, 'username')).toBe('alice');
    expect(parseOptionalColumnValue(row, 'email')).toBe('alice@example.com');
  });

  it('should return null if the column is missing', () => {
    const row = {
      id: 1,
      username: 'alice',
    };

    expect(parseOptionalColumnValue(row, 'email')).toBeNull();
  });

  it('should return null if the column exists but value is undefined', () => {
    const row = {
      id: undefined,
      username: 'bob',
    };

    expect(parseOptionalColumnValue(row, 'id')).toBeNull();
  });

  it('should work for falsy but defined values', () => {
    const row = {
      count: 0,
      active: false,
      name: '',
    };

    expect(parseOptionalColumnValue(row, 'count')).toBe(0);
    expect(parseOptionalColumnValue(row, 'active')).toBe(false);
    expect(parseOptionalColumnValue(row, 'name')).toBe('');
  });
});
