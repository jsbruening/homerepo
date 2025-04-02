import { describe, it, expect, beforeEach } from '@jest/globals';
import { rest } from 'msw';
import { server } from '../../setupTests';
import { getHomeServices, createHomeService, updateHomeService, deleteHomeService } from '../../lib/api';
import { buildUrl, mockErrorResponse, mockSuccessResponse } from '../utils/testUtils';
import { mocks } from '../mocks/supabase';
import type { HomeService, ServiceType, Recurrence } from '../../types';

const mockServiceType: ServiceType = {
  id: 'st1',
  name: 'HVAC Maintenance',
  description: null,
  category: 'Maintenance',
  createdAt: '2024-03-01T00:00:00.000Z',
  updatedAt: '2024-03-01T00:00:00.000Z'
};

const mockRecurrence: Recurrence = {
  id: 'r1',
  name: 'Annual',
  value: 'annual',
  description: null,
  createdAt: '2024-03-01T00:00:00.000Z',
  updatedAt: '2024-03-01T00:00:00.000Z'
};

const mockHomeService = {
  id: '1',
  service_type: {
    ...mockServiceType,
    created_at: mockServiceType.createdAt,
    updated_at: mockServiceType.updatedAt
  },
  provider: 'HVAC Pro',
  date: '2024-03-01',
  status: 'scheduled',
  recurrence: {
    ...mockRecurrence,
    created_at: mockRecurrence.createdAt,
    updated_at: mockRecurrence.updatedAt
  },
  notes: 'Regular maintenance check',
  house_id: 'h1',
  created_at: '2024-03-01T00:00:00.000Z',
  updated_at: '2024-03-01T00:00:00.000Z'
};

describe('Home Services API', () => {
  beforeEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  describe('getHomeServices', () => {
    it('should fetch home services for a house', async () => {
      mocks.from.mockImplementation(() => ({
        select: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            order: jest.fn().mockImplementation(() => ({
              data: [mockHomeService],
              error: null
            }))
          }))
        }))
      }));

      const services = await getHomeServices('h1');

      expect(services).toHaveLength(1);
      expect(services[0]).toEqual({
        id: '1',
        serviceType: mockServiceType,
        provider: 'HVAC Pro',
        date: '2024-03-01',
        status: 'scheduled',
        recurrence: mockRecurrence,
        notes: 'Regular maintenance check',
        houseId: 'h1',
        createdAt: '2024-03-01T00:00:00.000Z',
        updatedAt: '2024-03-01T00:00:00.000Z'
      });
    });

    it('should handle fetch errors', async () => {
      mocks.from.mockImplementation(() => ({
        select: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            order: jest.fn().mockImplementation(() => ({
              data: null,
              error: new Error('Database error')
            }))
          }))
        }))
      }));

      await expect(getHomeServices('h1')).rejects.toThrow('Database error');
    });
  });

  describe('createHomeService', () => {
    const newService: Omit<HomeService, 'id' | 'createdAt' | 'updatedAt'> = {
      serviceType: mockServiceType,
      provider: 'HVAC Pro',
      date: '2024-03-01',
      status: 'scheduled',
      recurrence: mockRecurrence,
      notes: 'Regular maintenance check',
      houseId: 'h1'
    };

    it('should create a new home service', async () => {
      mocks.from.mockImplementation(() => ({
        insert: jest.fn().mockImplementation(() => ({
          select: jest.fn().mockImplementation(() => ({
            single: jest.fn().mockImplementation(() => ({
              data: mockHomeService,
              error: null
            }))
          }))
        }))
      }));

      const result = await createHomeService(newService, 'h1');

      expect(result).toMatchObject({
        id: '1',
        provider: 'HVAC Pro',
        date: '2024-03-01',
        status: 'scheduled',
        notes: 'Regular maintenance check',
        houseId: 'h1'
      });
    });

    it('should handle creation errors', async () => {
      mocks.from.mockImplementation(() => ({
        insert: jest.fn().mockImplementation(() => ({
          select: jest.fn().mockImplementation(() => ({
            single: jest.fn().mockImplementation(() => ({
              data: null,
              error: new Error('Invalid input')
            }))
          }))
        }))
      }));

      await expect(createHomeService(newService, 'h1')).rejects.toThrow('Invalid input');
    });
  });

  describe('updateHomeService', () => {
    const updatedService: Partial<HomeService> = {
      serviceType: mockServiceType,
      provider: 'Updated HVAC Pro',
      date: '2024-03-02',
      status: 'completed',
      recurrence: mockRecurrence,
      notes: 'Updated maintenance notes',
      houseId: 'h1'
    };

    it('should update an existing home service', async () => {
      const updatedMockService = {
        ...mockHomeService,
        provider: 'Updated HVAC Pro',
        date: '2024-03-02',
        status: 'completed',
        notes: 'Updated maintenance notes',
        updated_at: '2024-03-02T00:00:00.000Z'
      };

      mocks.from.mockImplementation(() => ({
        update: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            select: jest.fn().mockImplementation(() => ({
              single: jest.fn().mockImplementation(() => ({
                data: updatedMockService,
                error: null
              }))
            }))
          }))
        }))
      }));

      const result = await updateHomeService('1', updatedService);

      expect(result).toMatchObject({
        id: '1',
        provider: 'Updated HVAC Pro',
        date: '2024-03-02',
        status: 'completed',
        notes: 'Updated maintenance notes',
        updatedAt: '2024-03-02T00:00:00.000Z'
      });
    });

    it('should handle update errors', async () => {
      mocks.from.mockImplementation(() => ({
        update: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            select: jest.fn().mockImplementation(() => ({
              single: jest.fn().mockImplementation(() => ({
                data: null,
                error: new Error('Service not found')
              }))
            }))
          }))
        }))
      }));

      await expect(updateHomeService('1', updatedService)).rejects.toThrow('Service not found');
    });
  });

  describe('deleteHomeService', () => {
    it('should delete a home service', async () => {
      mocks.from.mockImplementation(() => ({
        delete: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            data: {},
            error: null
          }))
        }))
      }));

      await expect(deleteHomeService('1')).resolves.not.toThrow();
    });

    it('should handle deletion errors', async () => {
      mocks.from.mockImplementation(() => ({
        delete: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            data: null,
            error: new Error('Service not found')
          }))
        }))
      }));

      await expect(deleteHomeService('999')).rejects.toThrow('Service not found');
    });
  });
}); 