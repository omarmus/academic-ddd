import { useState } from 'react';
import { MainLayout } from '../../templates/MainLayout';
import { useAuthStore } from '../../../stores';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import { changePassword } from '../../../services/authService';
import { IconEye, IconEyeOff } from '../../../assets/icons';

export function MiPerfilPage() {
  const user = useAuthStore((s) => s.user);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('La confirmación de la contraseña no coincide');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(
        result.message === 'Password updated successfully'
          ? 'Contraseña actualizada correctamente'
          : result.message,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo cambiar la contraseña';
      setError(
        message === 'Current password is invalid'
          ? 'La contraseña actual no es correcta'
          : message === 'Password confirmation does not match'
            ? 'La confirmación de la contraseña no coincide'
            : message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 dark:border-slate-600 dark:bg-slate-800/95 dark:ring-slate-600/50 sm:p-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Mi perfil
        </h2>
        {user && (
          <div className="mt-4 space-y-2 text-slate-600 dark:text-slate-300">
            <p><span className="font-medium text-slate-700 dark:text-slate-200">Nombre:</span> {user.name}</p>
            <p><span className="font-medium text-slate-700 dark:text-slate-200">Email:</span> {user.email}</p>
          </div>
        )}
        <div className="mt-8 border-t border-slate-200/80 pt-8 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Cambiar contraseña
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Ingresa tu contraseña actual y define una nueva contraseña segura.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 max-w-xl">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Contraseña actual
              </label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Nueva contraseña
              </label>
              <div className="flex gap-2">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50"
                  aria-label={
                    showNewPassword
                      ? 'Ocultar nueva contraseña'
                      : 'Ver nueva contraseña'
                  }
                >
                  {showNewPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Repetir contraseña
              </label>
              <div className="flex gap-2">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50"
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar repetición de contraseña'
                      : 'Ver repetición de contraseña'
                  }
                >
                  {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {success}
              </p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
