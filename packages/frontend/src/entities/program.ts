export type Program = {
  id: string;
  code: string;
  name: string;
  credits_required: number;
  department_id: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProgramDto = {
  code: string;
  name: string;
  credits_required: number;
  department_id: string;
};

export type UpdateProgramDto = {
  code?: string;
  name?: string;
  credits_required?: number;
  department_id?: string;
};
