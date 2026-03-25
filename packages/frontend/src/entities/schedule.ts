export type Schedule = {
  id: string;
  courseId: string;
  slot: string;
  classroomId: string | null;
};

export type CreateScheduleDto = {
  courseId: string;
  slot: string;
  classroomId: string;
};

export type UpdateScheduleDto = Partial<CreateScheduleDto>;
    id: string,
    courseId: string,
    courseName?: string,
    slot: string, 
}
