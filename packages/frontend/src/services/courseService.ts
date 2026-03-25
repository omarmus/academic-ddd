import { apiRequest } from '../lib';
import { Course } from '../entities';
import { apiRequest } from '../lib';

export type Course = {
  id: string;
  name: string;
  code: string;
  credits: number;
};

export type { Course } from '../entities';

export async function getCourses(): Promise<Course[]> {
  return apiRequest<Course[]>('/courses', {
    defaultErrorMessage: 'Error al cargar los cursos',
  });
}

export async function getCourse(id: string): Promise<Course> {
  return apiRequest<Course>(`/courses/${id}`, {
    defaultErrorMessage: 'Curso no encontrado',
  });
}
