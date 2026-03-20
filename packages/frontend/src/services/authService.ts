import { apiRequest } from '../lib';
import type {
  ChangePasswordDto,
  ChangePasswordResponse,
  LoginResponse,
} from '../entities';

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  try {
    return await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: username.trim(), password }),
      defaultErrorMessage: 'Error al iniciar sesión',
    });
  } catch (err) {
    const message =
      err instanceof Error && err.message === 'Credenciales inválidas'
        ? 'Usuario o contraseña incorrectos'
        : err instanceof Error
          ? err.message
          : 'Error al iniciar sesión';
    throw new Error(message);
  }
}

export async function changePassword(
  payload: ChangePasswordDto,
): Promise<ChangePasswordResponse> {
  try {
    return await apiRequest<ChangePasswordResponse>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
      defaultErrorMessage: 'No se pudo cambiar la contraseña',
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo cambiar la contraseña';
    throw new Error(message);
  }
}
