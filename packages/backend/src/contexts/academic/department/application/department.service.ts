import { Injectable, Inject } from '@nestjs/common';
import { Department } from '../domain/department.entity';
import { IDepartmentRepository, DEPARTMENT_REPOSITORY } from '../domain/department.repository';

@Injectable()
export class DepartmentService {
  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.findAll();
  }

  async findById(id: string): Promise<Department | null> {
    return this.departmentRepository.findById(id);
  }

  async create(data: { name: string; code: string; parentId?: string }): Promise<Department> {
    const id = crypto.randomUUID();
    const department = new Department(id, data.name, data.code, data.parentId);
    return this.departmentRepository.save(department);
  }

  async update(id: string, data: Partial<{ name: string; code: string; parentId: string }>): Promise<Department | null> {
    return this.departmentRepository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.departmentRepository.delete(id);
  }
}