import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ScheduleService } from '../../../contexts/academic/schedule/application/schedule.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async findAll() {
    return this.scheduleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const schedule = await this.scheduleService.findById(id);
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  @Post()
  async create(@Body() body: { courseId: string; slot: string }) {
    return this.scheduleService.create(body);
  }
}
