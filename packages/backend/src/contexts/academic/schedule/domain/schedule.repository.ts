import { Schedule } from './schedule.entity';

export const SCHEDULE_REPOSITORY = Symbol('SCHEDULE_REPOSITORY');

export interface IScheduleRepository {
  findAll(): Promise<Schedule[]>;
  findById(id: string): Promise<Schedule | null>;
  save(schedule: Schedule): Promise<Schedule>;
}
