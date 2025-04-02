import { jest } from '@jest/globals';

const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();
const mockFrom = jest.fn();

export const supabase = {
  from: mockFrom.mockImplementation(() => ({
    select: mockSelect.mockImplementation(() => ({
      eq: mockEq.mockImplementation(() => ({
        order: mockOrder.mockImplementation(() => ({
          data: [],
          error: null
        })),
        single: mockSingle.mockImplementation(() => ({
          data: null,
          error: null
        })),
        data: [],
        error: null
      })),
      order: mockOrder.mockImplementation(() => ({
        data: [],
        error: null
      })),
      single: mockSingle.mockImplementation(() => ({
        data: null,
        error: null
      })),
      data: [],
      error: null
    })),
    insert: mockInsert.mockImplementation(() => ({
      select: mockSelect.mockImplementation(() => ({
        single: mockSingle.mockImplementation(() => ({
          data: null,
          error: null
        }))
      }))
    })),
    update: mockUpdate.mockImplementation(() => ({
      eq: mockEq.mockImplementation(() => ({
        select: mockSelect.mockImplementation(() => ({
          single: mockSingle.mockImplementation(() => ({
            data: null,
            error: null
          }))
        }))
      }))
    })),
    delete: mockDelete.mockImplementation(() => ({
      eq: mockEq.mockImplementation(() => ({
        data: null,
        error: null
      }))
    }))
  }))
};

// Export the mock functions for test manipulation
export const mocks = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  order: mockOrder,
  single: mockSingle,
  from: mockFrom
};

jest.mock('../../lib/supabase', () => ({
  supabase
})); 