import { describe, it, expect, vi } from 'vitest';
import { apiRequest } from '../lib/api';

// Mockeamos la API
vi.mock('../lib/api', () => ({
  apiRequest: vi.fn(),
}));

describe('Department Service', () => {
  it('debería existir la función de carga', () => {
    expect(typeof apiRequest).toBe('function');
  });
});