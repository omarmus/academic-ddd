import { beforeEach, describe, expect, it, vi } from 'vitest';
import { changePassword, login } from './authService';

function mockRes(overrides: {
  ok?: boolean;
  body?: unknown;
  status?: number;
} = {}) {
  const ok = overrides.ok ?? true;
  const body = overrides.body !== undefined ? JSON.stringify(overrides.body) : '';
  return {
    ok,
    status: overrides.status,
    json: () => Promise.resolve(overrides.body),
    text: () => Promise.resolve(body),
  };
}

vi.mock('../stores', () => ({
  useAuthStore: {
    getState: () => ({
      clearAuth: vi.fn(),
    }),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('debería iniciar sesión', async () => {
    const response = {
      access_token: 'token',
      user: {
        id: 'user-1',
        username: 'admin',
        email: 'admin@academic.local',
        role: 'ADMINISTRATOR',
      },
    };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockRes({ body: response }),
    );

    const result = await login('admin', 'Admin123!');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toEqual(response);
  });

  it('debería cambiar la contraseña', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockRes({ body: { message: 'Password updated successfully' } }),
    );

    const result = await changePassword({
      currentPassword: 'Actual123!',
      newPassword: 'Nueva123!',
      confirmPassword: 'Nueva123!',
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/me'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: 'Actual123!',
          newPassword: 'Nueva123!',
          confirmPassword: 'Nueva123!',
        }),
      }),
    );
    expect(result).toEqual({ message: 'Password updated successfully' });
  });

  it('debería propagar el mensaje del backend al fallar cambio de contraseña', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockRes({
        ok: false,
        status: 400,
        body: { message: 'Password confirmation does not match' },
      }),
    );

    await expect(
      changePassword({
        currentPassword: 'Actual123!',
        newPassword: 'Nueva123!',
        confirmPassword: 'Otra123!',
      }),
    ).rejects.toThrow('Password confirmation does not match');
  });
});
