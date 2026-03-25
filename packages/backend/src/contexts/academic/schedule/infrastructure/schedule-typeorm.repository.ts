import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../domain/schedule.entity';
import { IScheduleRepository } from '../domain/schedule.repository';
import { ScheduleTypeOrmEntity } from './schedule-typeorm.entity';

@Injectable()
export class ScheduleTypeOrmRepository implements IScheduleRepository {
  constructor(
    @InjectRepository(ScheduleTypeOrmEntity)
    private readonly repo: Repository<ScheduleTypeOrmEntity>,
  ) {}

  async findAll(): Promise<Schedule[]> {
    const rows = await this.repo.find({ order: { createdAt: 'ASC' } });
    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Schedule | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async save(schedule: Schedule): Promise<Schedule> {
    const row = this.repo.create({
      id: schedule.id,
      courseId: schedule.courseId,
      slot: schedule.slot,
    });
    await this.repo.save(row);
    return schedule;
  }

  private toDomain(row: ScheduleTypeOrmEntity): Schedule {
    return new Schedule(row.id, row.courseId, row.slot);
  }
}
