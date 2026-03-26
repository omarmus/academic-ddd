import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentService } from './application/department.service';
import { DEPARTMENT_REPOSITORY } from './domain/department.repository';
import { DepartmentTypeOrmEntity } from './infrastructure/department-typeorm.entity';
import { DepartmentTypeOrmRepository } from './infrastructure/department-typeorm.repository';
import { DepartmentsController } from '../../../apps/api/academic/departments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentTypeOrmEntity])],
  controllers: [DepartmentsController],
  providers: [
    DepartmentService,
    { provide: DEPARTMENT_REPOSITORY, useClass: DepartmentTypeOrmRepository },
  ],
  exports: [DepartmentService],
})
export class DepartmentModule {}