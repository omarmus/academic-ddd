import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../domain/department.entity';
import { IDepartmentRepository } from '../domain/department.repository';
import { DepartmentTypeOrmEntity } from './department-typeorm.entity';

@Injectable()
export class DepartmentTypeOrmRepository implements IDepartmentRepository {
  constructor(
    @InjectRepository(DepartmentTypeOrmEntity)
    private readonly repo: Repository<DepartmentTypeOrmEntity>,
  ) {}

  async findAll(): Promise<Department[]> {
    const rows = await this.repo.find({ order: { createdAt: 'ASC' } });
    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Department | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async save(department: Department): Promise<Department> {
    const data: any = { // <-- Asegúrate de que diga 'any' aquí
      id: department.id,
      name: department.name,
      code: department.code,
      parentId: department.parentId || null,
    };
    const row = this.repo.create(data);
    await this.repo.save(row);
    return department;
  }

  async update(id: string, data: Partial<Department>): Promise<Department | null> {
    const updateData: any = {
      name: data.name,
      code: data.code,
      parentId: data.parentId || null,
    };
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private toDomain(row: DepartmentTypeOrmEntity): Department {
    return new Department(row.id, row.name, row.code, row.parentId);
  }
}