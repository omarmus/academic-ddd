import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Patch,
  Delete,
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

  @Patch(':id')
  async update(@Param('id') id: string,
    @Body()
    body: {
      slot?: string;
      courseId?: string;
    }){
      const schedule = await this.scheduleService.update(id, body);
      if (!schedule) throw new NotFoundException('Schedule not found');
      console.log(body.courseId);
      console.log(body.slot);
      return schedule;
    }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.scheduleService.delete(id);
    if (!deleted) throw new NotFoundException('Schedule not found');
  }
}
