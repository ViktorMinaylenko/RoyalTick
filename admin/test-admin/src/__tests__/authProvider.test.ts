import { authProvider } from '../authProvider';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../users.json', () => ({
  default: {
    users: [{ username: 'admin', password: 'password', id: 1 }]
  }
}));

describe('authProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should login with correct credentials', async () => {
    await expect(authProvider.login({ username: 'admin', password: 'password' }))
      .resolves.toBeUndefined();
  });

  it('should fail login with incorrect credentials', async () => {
    await expect(authProvider.login({ username: 'bad', password: 'bad' }))
      .rejects.toBeDefined();
  });

  it('should remove user from localStorage on logout', async () => {
    localStorage.setItem('user', '{"id": 1}');
    await authProvider.logout();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('checkAuth should resolve when user is present', async () => {
    localStorage.setItem('user', '{"id": 1}');
    await expect(authProvider.checkAuth()).resolves.toBeUndefined();
  });

  it('checkAuth should reject when user is missing', async () => {
    await expect(authProvider.checkAuth()).rejects.toBeUndefined();
  });

  it('getIdentity should return null when user is not logged in', async () => {
    const user = await authProvider.getIdentity?.();
    expect(user).toBeNull();
  });
});