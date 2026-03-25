import { Module } from '@nestjs/common';
import { StudentModule } from './student/student.module';
import { ScheduleModule } from './schedule/schedule.module';
import { CourseModule } from './course/course.module';
import { ClassroomModule } from './classroom/classroom.module';

@Module({
  imports: [StudentModule, ScheduleModule, CourseModule, ClassroomModule],
  exports: [StudentModule, ScheduleModule, CourseModule, ClassroomModule],
})
export class AcademicModule {}
