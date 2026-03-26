export class Department {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public parentId?: string | null,
  ) {}
}