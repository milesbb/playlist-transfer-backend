import { describe, it, expect } from 'vitest';
import * as parseModule from '@controllers/parsing/users';

describe('parseUserCreateRequest', () => {
  it('should parse and hash the password correctly', async () => {
    const body = {
      username: 'alice',
      email: 'alice@example.com',
      password: '  myPassword  ',
    };

    const result = await parseModule.parseUserCreateRequest(body);

    expect(result.username).toBe('alice');
    expect(result.email).toBe('alice@example.com');
    expect(result.passwordHash).not.toBe('myPassword');
    expect(typeof result.passwordHash).toBe('string');
    expect(result.passwordHash.length).toBeGreaterThan(0);
  });

  it('should throw if password is missing', async () => {
    const body = {
      username: 'alice',
      email: 'alice@example.com',
      // passwordHash missing
    };

    await expect(parseModule.parseUserCreateRequest(body)).rejects.toThrow(
      "Something went wrong when parsing: String field 'password' is undefined.",
    );
  });

  it('should throw if username is empty', async () => {
    const body = {
      username: '   ',
      email: 'alice@example.com',
      passwordHash: 'myPassword',
    };

    await expect(parseModule.parseUserCreateRequest(body)).rejects.toThrow(
      "Something went wrong when parsing: String field 'password' is undefined.",
    );
  });
});

describe('parseGetUserRequest', () => {
  it('should parse optional username and email correctly', () => {
    const body = { username: 'bob', email: 'bob@example.com' };

    const result = parseModule.parseGetUserRequest(body);

    expect(result.username).toBe('bob');
    expect(result.email).toBe('bob@example.com');
  });

  it('should handle missing optional fields', () => {
    const body = {};

    const result = parseModule.parseGetUserRequest(body);

    expect(result.username).toBeUndefined();
    expect(result.email).toBeUndefined();
  });

  it('should throw if a non-string value is provided', () => {
    const body = { username: 123, email: {} };

    expect(() => parseModule.parseGetUserRequest(body)).toThrow(
      "Expected string for field 'username' and got number",
    );
  });
});
