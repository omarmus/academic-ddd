import { DepartmentsController } from './departments.controller';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let service: any;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
    };
    controller = new DepartmentsController(service);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});