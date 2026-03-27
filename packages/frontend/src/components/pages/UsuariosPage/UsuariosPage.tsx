import { useEffect, useState, FormEvent, useCallback } from 'react';
import { MainLayout } from '../../templates/MainLayout';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { DataTable, type DataTableColumn } from '../../organisms/DataTable';
import { apiRequest } from '../../../lib/api';
import type { User } from '../../../entities/user';
import { IconUsers, IconClose } from '../../../assets/icons'; // Reusing existing icons!

type Role = { id: string; name: string };

// Tipos para nuestro sistema de Toasts nativo
type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; message: string; type: ToastType };

export function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  // States para formularios y modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', username: '', email: '', roleId: '', password: '' });
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  // State para Toasts integrados
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Función auxiliar para agregar Toasts
  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000); // Se oculta tras 4 segundos
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [u, r] = await Promise.all([
        apiRequest<User[]>('/users'),
        apiRequest<Role[]>('/roles'),
      ]);
      setUsers(u);
      setRoles(r);
    } catch (err) {
      console.error(err);
      addToast('Error al cargar la lista de usuarios. Verifica el servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: '', username: '', email: '', roleId: roles[0]?.id || '', password: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setIsEditing(true);
    setFormData({ id: user.id, username: user.username, email: user.email, roleId: user.role.id, password: '' });
    setIsModalOpen(true);
  };

  const handleRequestDelete = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setSaving(true);
      await apiRequest(`/users/${userToDelete.id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      addToast(`Usuario ${userToDelete.username} eliminado con éxito`, 'success');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error(err);
      addToast('No se pudo eliminar el usuario', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: any = {
        username: formData.username,
        email: formData.email,
        roleId: formData.roleId,
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      if (isEditing) {
        const updated = await apiRequest<User>(`/users/${formData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        addToast('Usuario actualizado exitosamente', 'success');
      } else {
        if (!payload.password) {
          addToast('La contraseña es obligatoria al crear un usuario', 'error');
          setSaving(false);
          return;
        }
        const created = await apiRequest<User>('/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setUsers((prev) => [...prev, created]);
        addToast('Usuario registrado exitosamente', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast(err instanceof Error ? err.message : 'Error al guardar el usuario', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (user: User) => {
    // Add logic to view details (just setting a selected user and opening a details modal)
    setSelectedUserForDetails(user);
    setIsDetailsModalOpen(true);
  };

  const columns: DataTableColumn<User>[] = [
    { id: 'id', label: 'ID', value: (u) => u.id.split('-')[0] + '...', sortable: true },
    {
      id: 'username',
      label: 'Usuario',
      value: (u) => u.username,
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold uppercase shrink-0 ring-1 ring-indigo-200 dark:ring-indigo-800">
            {u.username.charAt(0)}
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{u.username}</span>
        </div>
      )
    },
    { id: 'email', label: 'Email', value: (u) => u.email, sortable: true },
    {
      id: 'rol',
      label: 'Rol',
      value: (u) => u.role?.name || (u as any).roleId || 'Desconocido', // Fallback mapping in case backend hasn't been rebuilt
      sortable: true,
      render: (u) => {
        const rawRole = u.role?.name || (u as any).roleId || 'Desconocido';
        const roleName = rawRole === 'ADMINISTRATOR' ? 'Administrador' : rawRole === 'STUDENT' ? 'Estudiante' : rawRole === 'TEACHER' ? 'Profesor' : rawRole;
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-sm">
            {roleName}
          </span>
        );
      }
    },
  ];

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);

  return (
    <MainLayout>
      <div className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md ring-1 ring-slate-200/50 dark:border-slate-600 dark:bg-slate-800/95 dark:ring-slate-600/50 sm:p-10 transition-all">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl shadow-inner">
              <IconUsers className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Gestión de Usuarios
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Añade, edita y visualiza los accesos de la plataforma.
              </p>
            </div>
          </div>
          <Button onClick={handleOpenAdd} className="shadow-lg hover:-translate-y-0.5 transform transition px-5 py-2.5 font-semibold">
            + Nuevo Usuario
          </Button>
        </div>

        {/* TABLA O ESTADO DE CARGA */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex h-[300px] w-full flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin dark:border-indigo-800 dark:border-t-indigo-400 shadow-sm"></div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cargando datos de usuarios...</p>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <DataTable
                columns={columns}
                data={users}
                keyExtractor={(u) => u.id}
                emptyMessage="No hay usuarios registrados."
                renderActions={(u) => (
                  <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handleViewDetails(u)}
                      className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                      title="Ver detalles"
                      aria-label="Ver detalles"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                      title="Editar usuario"
                      aria-label="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.148l-2.73.91.91-2.73a4.5 4.5 0 011.148-1.891l12.592-12.591z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.875 4.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRequestDelete(u)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-800"
                      title="Eliminar usuario"
                      aria-label="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODAL VER DETALLES */}
      {isDetailsModalOpen && selectedUserForDetails && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="animate-in fade-in zoom-in-95 duration-200 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                Detalles del Usuario
              </h3>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Cerrar modal"
              >
                <IconClose className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 flex items-center justify-center text-3xl font-bold mb-3 shadow-inner ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                  {selectedUserForDetails.username.charAt(0).toUpperCase()}
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUserForDetails.username}</h4>
                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                  {selectedUserForDetails.role?.name || (selectedUserForDetails as any).roleId || 'Desconocido'}
                </span>
              </div>
              
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50">
                <div className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-800/50">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">ID Interno</span>
                  <span className="text-sm font-mono text-slate-800 dark:text-slate-200 select-all">{selectedUserForDetails.id}</span>
                </div>
                <div className="flex flex-col p-4 bg-white dark:bg-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedUserForDetails.email}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <Button onClick={() => setIsDetailsModalOpen(false)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="animate-in fade-in zoom-in-95 duration-200 w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                {isEditing ? 'Editar Perfil de Usuario' : 'Registrar Nuevo Usuario'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Cerrar modal"
              >
                <IconClose className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 flex flex-col">
              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Nombre de Usuario
                    <Input
                      required
                      placeholder="ej. jperez"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Correo Electrónico
                    <Input
                      required
                      type="email"
                      placeholder="correo@institucion.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </label>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Rol en el Sistema
                    <div className="relative">
                      <select
                        required
                        value={formData.roleId}
                        onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                        className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white shadow-sm transition-all"
                      >
                        <option value="" disabled>Seleccione...</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña Inicial'}
                    <Input
                      type="password"
                      required={!isEditing}
                      placeholder={isEditing ? 'Déjalo vacío para no cambiar' : 'Mínimo 8 caracteres'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="!bg-white !text-slate-700 !border-slate-300 border hover:!bg-slate-50 hover:!text-slate-900 dark:!bg-slate-800 dark:!text-slate-200 dark:!border-slate-600 dark:hover:!bg-slate-700 shadow-sm transition-colors"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Guardando...
                    </span>
                  ) : (
                    'Guardar Usuario'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ELIMINACIÓN */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="animate-in fade-in zoom-in-95 duration-200 w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-5 shadow-inner">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">¿Eliminar usuario?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Esta acción es irreversible y <strong>{userToDelete?.username}</strong> perderá su acceso permanentemente.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row-reverse gap-3 border-t border-slate-100 dark:border-slate-700/50">
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-200 ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOASTS NATIVOS INLINE */}
      <div className="fixed bottom-4 right-4 z-[120] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-in slide-in-from-right fade-in duration-300 max-w-sm rounded-lg shadow-xl border-l-4 p-4 text-sm font-medium pointer-events-auto flex gap-3 items-center ${
              t.type === 'success' 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-400 dark:text-emerald-100' 
                : t.type === 'error'
                  ? 'bg-red-50 border-red-500 text-red-800 dark:bg-red-950/90 dark:border-red-400 dark:text-red-100'
                  : 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-950/90 dark:border-blue-400 dark:text-blue-100'
            }`}
          >
            {t.type === 'success' && (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {t.type === 'error' && (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {t.type === 'info' && (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            )}
            <p className="flex-1">{t.message}</p>
            <button onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>

    </MainLayout>
  );
}
