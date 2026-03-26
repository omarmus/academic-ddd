import { apiRequest } from '../lib';

export type Department = { id: string; name: string; code: string; parentId?: string | null; };

export async function getDepartments(): Promise<Department[]> {
  return apiRequest<Department[]>('/departments', { defaultErrorMessage: 'Error al cargar' });
}

export async function createDepartment(data: { name: string; code: string; parentId?: string }): Promise<Department> {
  return apiRequest<Department>('/departments', {
    method: 'POST',
    body: JSON.stringify(data),
    defaultErrorMessage: 'Error al crear',
  });
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiRequest<void>(`/departments/${id}`, { 
    method: 'DELETE', 
    defaultErrorMessage: 'Error al eliminar' 
  });
}