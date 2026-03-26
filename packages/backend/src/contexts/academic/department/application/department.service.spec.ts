import { DepartmentService } from './department.service';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let repository: any;

  beforeEach(() => {
    // Definimos las funciones exactas que el service espera
    repository = {
      save: jest.fn(),
      findAll: jest.fn(), // <-- Antes decía 'find', por eso fallaba
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new DepartmentService(repository);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería llamar al repositorio al buscar todos', async () => {
    await service.findAll();
    expect(repository.findAll).toHaveBeenCalled();
  });
});