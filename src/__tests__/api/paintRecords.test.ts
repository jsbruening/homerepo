import { describe, it, expect, beforeEach } from '@jest/globals';
import { rest } from 'msw';
import { server } from '../../setupTests';
import { getPaintRecords, createPaintRecord, updatePaintRecord, deletePaintRecord } from '../../lib/api';
import { buildUrl, mockErrorResponse, mockSuccessResponse } from '../utils/testUtils';
import { mocks } from '../mocks/supabase';
import type { PaintRecord, PaintManufacturer, Location } from '../../types';

const mockManufacturer: PaintManufacturer = {
  id: 'm1',
  name: 'Test Manufacturer',
  description: null,
  createdAt: '2024-03-01T00:00:00.000Z',
  updatedAt: '2024-03-01T00:00:00.000Z'
};

const mockLocation: Location = {
  id: 'l1',
  name: 'Living Room',
  description: 'Main living area',
  houseId: 'h1',
  createdAt: '2024-03-01T00:00:00.000Z',
  updatedAt: '2024-03-01T00:00:00.000Z'
};

const mockPaintRecord = {
  id: '1',
  manufacturerId: 'm1',
  manufacturer: {
    id: 'm1',
    name: 'Test Manufacturer',
    description: null,
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z'
  },
  locationId: 'l1',
  location: {
    id: 'l1',
    name: 'Living Room',
    description: 'Main living area',
    houseId: 'h1',
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z'
  },
  color: 'Ocean Blue',
  paintType: 'Matte',
  finishType: 'Flat',
  date: '2024-03-01',
  notes: 'Test notes',
  houseId: 'h1',
  createdAt: '2024-03-01T00:00:00.000Z',
  updatedAt: '2024-03-01T00:00:00.000Z'
};

describe('Paint Records API', () => {
  beforeEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
    // Suppress console logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getPaintRecords', () => {
    it('should fetch paint records for a house', async () => {
      mocks.from.mockImplementation(() => ({
        select: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            order: jest.fn().mockImplementation(() => ({
              data: [{
                id: '1',
                manufacturer_id: 'm1',
                manufacturer: {
                  id: 'm1',
                  name: 'Test Manufacturer',
                  description: null,
                  created_at: '2024-03-01T00:00:00.000Z',
                  updated_at: '2024-03-01T00:00:00.000Z'
                },
                location_id: 'l1',
                location: {
                  id: 'l1',
                  name: 'Living Room',
                  description: 'Main living area',
                  house_id: 'h1',
                  created_at: '2024-03-01T00:00:00.000Z',
                  updated_at: '2024-03-01T00:00:00.000Z'
                },
                color_name: 'Ocean Blue',
                paint_type: 'Matte',
                finish_type: 'Flat',
                painted_at: '2024-03-01',
                notes: 'Test notes',
                house_id: 'h1',
                created_at: '2024-03-01T00:00:00.000Z',
                updated_at: '2024-03-01T00:00:00.000Z'
              }],
              error: null
            }))
          }))
        }))
      }));

      const records = await getPaintRecords('h1');

      expect(records).toHaveLength(1);
      expect(records[0]).toEqual(mockPaintRecord);
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

      await expect(getPaintRecords('h1')).rejects.toThrow('Database error');
    });
  });

  describe('createPaintRecord', () => {
    const newRecord: Omit<PaintRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      manufacturerId: 'm1',
      manufacturer: mockManufacturer,
      locationId: 'l1',
      location: mockLocation,
      color: 'Ocean Blue',
      paintType: 'Matte',
      finishType: 'Flat',
      date: '2024-03-01',
      notes: 'Test notes',
      houseId: 'h1'
    };

    it('should create a new paint record', async () => {
      // Mock location check
      mocks.from.mockImplementationOnce(() => ({
        select: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            single: jest.fn().mockImplementation(() => ({
              data: {
                ...mockLocation,
                created_at: mockLocation.createdAt,
                updated_at: mockLocation.updatedAt,
                house_id: mockLocation.houseId
              },
              error: null
            }))
          }))
        }))
      }));

      // Mock paint record creation
      mocks.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockImplementation(() => ({
          select: jest.fn().mockImplementation(() => ({
            single: jest.fn().mockImplementation(() => ({
              data: {
                id: '1',
                manufacturer_id: 'm1',
                manufacturer: {
                  ...mockManufacturer,
                  created_at: mockManufacturer.createdAt,
                  updated_at: mockManufacturer.updatedAt
                },
                location_id: 'l1',
                location: {
                  ...mockLocation,
                  created_at: mockLocation.createdAt,
                  updated_at: mockLocation.updatedAt,
                  house_id: mockLocation.houseId
                },
                color_name: 'Ocean Blue',
                paint_type: 'Matte',
                finish_type: 'Flat',
                painted_at: '2024-03-01',
                notes: 'Test notes',
                house_id: 'h1',
                created_at: '2024-03-01T00:00:00.000Z',
                updated_at: '2024-03-01T00:00:00.000Z'
              },
              error: null
            }))
          }))
        }))
      }));

      const result = await createPaintRecord(newRecord);

      expect(result).toEqual(mockPaintRecord);
    });

    it('should handle creation errors', async () => {
      // Mock location check failure
      mocks.from.mockImplementationOnce(() => ({
        select: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            single: jest.fn().mockImplementation(() => ({
              data: null,
              error: new Error('Invalid location selected')
            }))
          }))
        }))
      }));

      await expect(createPaintRecord(newRecord)).rejects.toThrow('Invalid location selected');
    });
  });

  describe('updatePaintRecord', () => {
    const updatedRecord: PaintRecord = {
      ...mockPaintRecord,
      color: 'Updated Blue',
      paintType: 'Satin',
      finishType: 'Eggshell',
      date: '2024-03-02',
      notes: 'Updated notes'
    };

    it('should update an existing paint record', async () => {
      mocks.from.mockImplementation(() => ({
        update: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            select: jest.fn().mockImplementation(() => ({
              single: jest.fn().mockImplementation(() => ({
                data: {
                  id: '1',
                  manufacturer_id: 'm1',
                  manufacturer: {
                    ...mockManufacturer,
                    created_at: mockManufacturer.createdAt,
                    updated_at: mockManufacturer.updatedAt
                  },
                  location_id: 'l1',
                  location: {
                    ...mockLocation,
                    created_at: mockLocation.createdAt,
                    updated_at: mockLocation.updatedAt,
                    house_id: mockLocation.houseId
                  },
                  color_name: 'Updated Blue',
                  paint_type: 'Satin',
                  finish_type: 'Eggshell',
                  painted_at: '2024-03-02',
                  notes: 'Updated notes',
                  house_id: 'h1',
                  created_at: '2024-03-01T00:00:00.000Z',
                  updated_at: '2024-03-02T00:00:00.000Z'
                },
                error: null
              }))
            }))
          }))
        }))
      }));

      const result = await updatePaintRecord(updatedRecord);

      expect(result).toEqual({
        ...mockPaintRecord,
        color: 'Updated Blue',
        paintType: 'Satin',
        finishType: 'Eggshell',
        date: '2024-03-02',
        notes: 'Updated notes',
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
                error: new Error('Record not found')
              }))
            }))
          }))
        }))
      }));

      await expect(updatePaintRecord(updatedRecord)).rejects.toThrow('Record not found');
    });
  });

  describe('deletePaintRecord', () => {
    it('should delete a paint record', async () => {
      mocks.from.mockImplementation(() => ({
        delete: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            data: {},
            error: null
          }))
        }))
      }));

      await expect(deletePaintRecord('1')).resolves.not.toThrow();
    });

    it('should handle deletion errors', async () => {
      mocks.from.mockImplementation(() => ({
        delete: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            data: null,
            error: new Error('Record not found')
          }))
        }))
      }));

      await expect(deletePaintRecord('999')).rejects.toThrow('Record not found');
    });
  });
}); 