import { describe, it, expect } from 'vitest';
import * as parseModule from '@controllers/parsing/users';
import { ErrorVariants } from '@utils/errorTypes';

describe('parseUserCreateRequest', () => {
  it('should parse and hash the password correctly', async () => {
    const body = {
      username: 'alice',
      email: 'alice@example.com',
      password: '  myPassword  ',
      captchaToken: 'testToken',
    };

    const result = await parseModule.parseUserCreateRequest(body);

    expect(result.username).toBe('alice');
    expect(result.email).toBe('alice@example.com');
    expect(result.passwordHash).not.toBe('myPassword');
    expect(typeof result.passwordHash).toBe('string');
    expect(result.passwordHash.length).toBeGreaterThan(0);
    expect(result.captchaToken).toBe('testToken');
  });

  it('should throw if password is missing', async () => {
    const body = {
      username: 'alice',
      email: 'alice@example.com',
      // passwordHash missing
      captchaToken: 'testToken',
    };

    await expect(parseModule.parseUserCreateRequest(body)).rejects.toThrow(
      "Something went wrong when parsing: String field 'password' is undefined.",
    );
  });

  it('should throw if username is empty', async () => {
    const body = {
      username: '   ',
      email: 'alice@example.com',
      password: 'myPassword',
      captchaToken: 'testToken',
    };

    await expect(parseModule.parseUserCreateRequest(body)).rejects.toThrow(
      "Something went wrong when parsing: Got empty string for field 'username'",
    );
  });

  it('should throw if captchaToken is empty', async () => {
    const body = {
      username: 'alice',
      email: 'alice@example.com',
      password: 'myPassword',
    };

    await expect(parseModule.parseUserCreateRequest(body)).rejects.toThrow(
      "Something went wrong when parsing: String field 'captchaToken' is undefined.",
    );
  });
});

describe('parseLoginRequest (integration)', () => {
  it('parses a valid login request body', () => {
    const body = {
      username: 'john',
      email: 'john@example.com',
      password: 'secret',
      captchaToken: 'testToken',
    };

    const result = parseModule.parseLoginRequest(body);

    expect(result).toEqual({
      username: 'john',
      email: 'john@example.com',
      password: 'secret',
      captchaToken: 'testToken',
    });
  });

  it('returns undefined for optional fields if missing', () => {
    const body = { password: 'secret', captchaToken: 'testToken' };

    const result = parseModule.parseLoginRequest(body);

    expect(result).toEqual({
      username: undefined,
      email: undefined,
      password: 'secret',
      captchaToken: 'testToken',
    });
  });

  it('throws if password is missing', () => {
    const body = {
      username: 'john',
      email: 'john@example.com',
      captchaToken: 'testToken',
    };

    expect(() => parseModule.parseLoginRequest(body)).toThrowError(
      ErrorVariants.ParsingError("String field 'password' is undefined.")
        .message,
    );
  });

  it('throws if username is wrong type', () => {
    const body = {
      username: 123,
      email: 'a@b.com',
      password: 'pw',
      captchaToken: 'testToken',
    };

    expect(() => parseModule.parseLoginRequest(body)).toThrowError(
      "Expected string for field 'username' and got number",
    );
  });

  it('throws if captchaToken is missing', () => {
    const body = {
      username: 'john',
      email: 'john@example.com',
      password: 'pw',
    };

    expect(() => parseModule.parseLoginRequest(body)).toThrowError(
      ErrorVariants.ParsingError("String field 'captchaToken' is undefined.")
        .message,
    );
  });
});

describe('parseRefreshTokenRequest (integration)', () => {
  it('parses a valid refresh token request body', () => {
    const body = {
      userId: 123,
      refreshToken: 'abc123',
    };

    const result = parseModule.parseRefreshTokenRequest(body);

    expect(result).toEqual({
      userId: 123,
      refreshToken: 'abc123',
    });
  });

  it('throws if userId is not a number', () => {
    const body = { userId: 'oops', refreshToken: 'token' };

    expect(() => parseModule.parseRefreshTokenRequest(body)).toThrowError(
      "Expected number for field 'userId' and got string",
    );
  });

  it('throws if refreshToken is missing', () => {
    const body = { userId: 123 };

    expect(() => parseModule.parseRefreshTokenRequest(body)).toThrowError(
      "String field 'refreshToken' is undefined.",
    );
  });

  it('throws if refreshToken is wrong type', () => {
    const body = { userId: 123, refreshToken: 999 };

    expect(() => parseModule.parseRefreshTokenRequest(body)).toThrowError(
      "Expected string for field 'refreshToken' and got number",
    );
  });
});
