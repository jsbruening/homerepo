import { describe, it, expect, beforeEach } from '@jest/globals';
import { rest } from 'msw';
import { server } from '../../setupTests';
import { getHouses, createHouse, updateHouse, deleteHouse } from '../../lib/api';
import { buildUrl, mockErrorResponse, mockSuccessResponse } from '../utils/testUtils';
import { mocks } from '../mocks/supabase';
import type { House } from '../../types';

const mockHouse = {
  id: '1',
  name: 'Test House',
  owners: ['John Doe'],
  address: {
    street: '123 Main St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345'
  },
  created_at: '2024-03-01T00:00:00.000Z',
  updated_at: '2024-03-01T00:00:00.000Z'
};

describe('House API', () => {
  beforeEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  describe('getHouses', () => {
    it('should fetch all houses', async () => {
      mocks.from.mockImplementation(() => ({
        select: jest.fn().mockImplementation(() => ({
          data: [mockHouse],
          error: null
        }))
      }));

      const houses = await getHouses();

      expect(houses).toHaveLength(1);
      expect(houses[0]).toEqual({
        id: '1',
        name: 'Test House',
        owners: ['John Doe'],
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        },
        createdAt: '2024-03-01T00:00:00.000Z',
        updatedAt: '2024-03-01T00:00:00.000Z'
      });
    });

    it('should handle fetch errors', async () => {
      mocks.from.mockImplementation(() => ({
        select: jest.fn().mockImplementation(() => ({
          data: null,
          error: new Error('Database error')
        }))
      }));

      await expect(getHouses()).rejects.toThrow('Database error');
    });
  });

  describe('createHouse', () => {
    const newHouse: Omit<House, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'New House',
      owners: ['Jane Doe'],
      address: {
        street: '456 Oak St',
        city: 'New City',
        state: 'NS',
        zipCode: '67890'
      }
    };

    it('should create a new house', async () => {
      mocks.from.mockImplementation(() => ({
        insert: jest.fn().mockImplementation(() => ({
          select: jest.fn().mockImplementation(() => ({
            single: jest.fn().mockImplementation(() => ({
              data: mockHouse,
              error: null
            }))
          }))
        }))
      }));

      const result = await createHouse(newHouse);

      expect(result).toMatchObject({
        id: '1',
        name: 'Test House',
        owners: ['John Doe'],
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        },
        createdAt: '2024-03-01T00:00:00.000Z',
        updatedAt: '2024-03-01T00:00:00.000Z'
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

      await expect(createHouse(newHouse)).rejects.toThrow('Invalid input');
    });
  });

  describe('updateHouse', () => {
    const updatedHouse: Partial<House> = {
      name: 'Updated House',
      owners: ['John Doe', 'Jane Doe'],
      address: {
        street: '789 Pine St',
        city: 'Update City',
        state: 'US',
        zipCode: '13579'
      }
    };

    it('should update an existing house', async () => {
      const updatedMockHouse = {
        ...mockHouse,
        name: 'Updated House',
        owners: ['John Doe', 'Jane Doe'],
        address: {
          street: '789 Pine St',
          city: 'Update City',
          state: 'US',
          zipCode: '13579'
        },
        updated_at: '2024-03-02T00:00:00.000Z'
      };

      mocks.from.mockImplementation(() => ({
        update: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            select: jest.fn().mockImplementation(() => ({
              single: jest.fn().mockImplementation(() => ({
                data: updatedMockHouse,
                error: null
              }))
            }))
          }))
        }))
      }));

      const result = await updateHouse('1', updatedHouse);

      expect(result).toMatchObject({
        id: '1',
        name: 'Updated House',
        owners: ['John Doe', 'Jane Doe'],
        address: {
          street: '789 Pine St',
          city: 'Update City',
          state: 'US',
          zipCode: '13579'
        },
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
                error: new Error('House not found')
              }))
            }))
          }))
        }))
      }));

      await expect(updateHouse('1', updatedHouse)).rejects.toThrow('House not found');
    });
  });

  describe('deleteHouse', () => {
    it('should delete a house', async () => {
      mocks.from.mockImplementation(() => ({
        delete: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            data: {},
            error: null
          }))
        }))
      }));

      await expect(deleteHouse('1')).resolves.not.toThrow();
    });

    it('should handle deletion errors', async () => {
      mocks.from.mockImplementation(() => ({
        delete: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            data: null,
            error: new Error('House not found')
          }))
        }))
      }));

      await expect(deleteHouse('999')).rejects.toThrow('House not found');
    });
  });
}); 