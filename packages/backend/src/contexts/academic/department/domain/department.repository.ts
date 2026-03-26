import { Department } from './department.entity';

export const DEPARTMENT_REPOSITORY = Symbol('DEPARTMENT_REPOSITORY');

export interface IDepartmentRepository {
  findAll(): Promise<Department[]>;
  findById(id: string): Promise<Department | null>;
  save(department: Department): Promise<Department>;
  update(id: string, data: Partial<Department>): Promise<Department | null>;
  delete(id: string): Promise<boolean>;
}