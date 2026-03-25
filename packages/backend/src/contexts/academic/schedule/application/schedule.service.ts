import { Injectable, Inject } from '@nestjs/common';
import { Schedule } from '../domain/schedule.entity';
import { IScheduleRepository, SCHEDULE_REPOSITORY } from '../domain/schedule.repository';

@Injectable()
export class ScheduleService {
  constructor(
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: IScheduleRepository,
  ) {}

  async findAll(): Promise<Schedule[]> {
    return this.scheduleRepository.findAll();
  }

  async findById(id: string): Promise<Schedule | null> {
    return this.scheduleRepository.findById(id);
  }

  async create(data: { courseId: string; slot: string }): Promise<Schedule> {
    const id = crypto.randomUUID();
    const schedule = new Schedule(id, data.courseId, data.slot);
    return this.scheduleRepository.save(schedule);
  }
}
