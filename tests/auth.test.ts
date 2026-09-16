import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, signToken, verifyToken } from '../src/lib/auth';

describe('Auth Utilities Test Suite', () => {
  it('should correctly hash and compare passwords', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    const isValid = await comparePassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await comparePassword('WrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('should generate and verify JWT tokens', () => {
    const payload = {
      userId: 'user-uuid-123',
      email: 'admin@taskflow.ai',
      name: 'Susan Vance',
      role: 'ADMIN',
    };

    const token = signToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
  });

  it('should return null for invalid tokens', () => {
    const decoded = verifyToken('invalid.jwt.token');
    expect(decoded).toBeNull();
  });
});
