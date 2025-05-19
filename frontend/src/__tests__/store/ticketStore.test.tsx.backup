import { act, renderHook } from '@testing-library/react';
import useTicketStore from '../../store/ticketStore';
import ticketRepository from '../../api/ticketRepository';

// Mock the ticketRepository
jest.mock('../../api/ticketRepository', () => ({
  getTickets: jest.fn(),
  getMyTickets: jest.fn(),
  getEscalatedTickets: jest.fn(),
  getTicketById: jest.fn(),
  createTicket: jest.fn(),
  updateTicketStatus: jest.fn(),
  escalateToL2: jest.fn(),
  setCriticalValue: jest.fn(),
  escalateToL3: jest.fn(),
  addTicketAction: jest.fn(),
  resolveTicket: jest.fn(),
}));

describe('ticketStore', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset the store state
    const store = useTicketStore.getState();
    store.tickets = [];
    store.currentTicket = null;
    store.error = null;
    store.filters = {};
  });

  describe('getTickets', () => {
    it('successfully fetches tickets', async () => {
      const mockTickets = [
        {
          id: '1',
          title: 'Test Ticket',
          status: 'NEW',
          priority: 'HIGH',
          category: 'SOFTWARE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expectedCompletionDate: new Date().toISOString(),
          description: 'Test description',
          createdBy: '1',
          createdByName: 'Test User',
          actions: [],
        },
      ];

      const mockResponse = {
        success: true,
        data: {
          tickets: mockTickets,
          total: 1,
          page: 1,
          limit: 10,
        },
      };

      (ticketRepository.getTickets as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        await result.current.getTickets();
      });

      expect(result.current.tickets).toEqual(mockTickets);
      expect(result.current.error).toBeNull();
    });

    it('handles error when fetching tickets fails', async () => {
      const mockError = 'Failed to fetch tickets';
      const mockResponse = {
        success: false,
        error: mockError,
      };

      (ticketRepository.getTickets as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        await result.current.getTickets();
      });

      expect(result.current.tickets).toEqual([]);
      expect(result.current.error).toBe(mockError);
    });
  });

  describe('getTicketById', () => {
    it('successfully fetches a ticket by id', async () => {
      const mockTicket = {
        id: '1',
        title: 'Test Ticket',
        status: 'NEW',
        priority: 'HIGH',
        category: 'SOFTWARE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expectedCompletionDate: new Date().toISOString(),
        description: 'Test description',
        createdBy: '1',
        createdByName: 'Test User',
        actions: [],
      };

      const mockResponse = {
        success: true,
        data: mockTicket,
      };

      (ticketRepository.getTicketById as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        await result.current.getTicketById('1');
      });

      expect(result.current.currentTicket).toEqual(mockTicket);
      expect(result.current.error).toBeNull();
    });
  });

  describe('createTicket', () => {
    it('successfully creates a new ticket', async () => {
      const mockTicket = {
        id: '1',
        title: 'New Ticket',
        description: 'Test description',
        category: 'SOFTWARE',
        priority: 'HIGH',
        status: 'NEW',
        expectedCompletionDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: '1',
        createdByName: 'Test User',
        actions: [],
      };

      const mockResponse = {
        success: true,
        data: mockTicket,
      };

      (ticketRepository.createTicket as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.createTicket(
          'New Ticket',
          'Test description',
          'SOFTWARE',
          'HIGH',
          new Date().toISOString()
        );
        expect(success).toBe(true);
      });

      expect(result.current.currentTicket).toEqual(mockTicket);
      expect(result.current.error).toBeNull();
    });
  });

  describe('updateTicketStatus', () => {
    it('successfully updates ticket status', async () => {
      const mockTicket = {
        id: '1',
        title: 'Test Ticket',
        status: 'ATTENDING',
        priority: 'HIGH',
        category: 'SOFTWARE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expectedCompletionDate: new Date().toISOString(),
        description: 'Test description',
        createdBy: '1',
        createdByName: 'Test User',
        actions: [],
      };

      const mockResponse = {
        success: true,
        data: mockTicket,
      };

      (ticketRepository.updateTicketStatus as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.updateTicketStatus('1', 'ATTENDING');
        expect(success).toBe(true);
      });

      expect(result.current.currentTicket).toEqual(mockTicket);
      expect(result.current.error).toBeNull();
    });
  });

  describe('escalateToL2', () => {
    it('successfully escalates ticket to L2', async () => {
      const mockTicket = {
        id: '1',
        title: 'Test Ticket',
        status: 'ESCALATED_L2',
        priority: 'HIGH',
        category: 'SOFTWARE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expectedCompletionDate: new Date().toISOString(),
        description: 'Test description',
        createdBy: '1',
        createdByName: 'Test User',
        actions: [],
      };

      const mockResponse = {
        success: true,
        data: mockTicket,
      };

      (ticketRepository.escalateToL2 as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.escalateToL2('1', 'Escalation notes');
        expect(success).toBe(true);
      });

      expect(result.current.currentTicket).toEqual(mockTicket);
      expect(result.current.error).toBeNull();
    });
  });

  describe('setCriticalValue', () => {
    it('successfully sets critical value', async () => {
      const mockTicket = {
        id: '1',
        title: 'Test Ticket',
        status: 'ESCALATED_L2',
        priority: 'HIGH',
        category: 'SOFTWARE',
        criticalValue: 'C1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expectedCompletionDate: new Date().toISOString(),
        description: 'Test description',
        createdBy: '1',
        createdByName: 'Test User',
        actions: [],
      };

      const mockResponse = {
        success: true,
        data: mockTicket,
      };

      (ticketRepository.setCriticalValue as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.setCriticalValue('1', 'C1');
        expect(success).toBe(true);
      });

      expect(result.current.currentTicket).toEqual(mockTicket);
      expect(result.current.error).toBeNull();
    });
  });

  describe('filters', () => {
    it('updates filters correctly', () => {
      const { result } = renderHook(() => useTicketStore());
      
      const newFilters = {
        status: ['NEW', 'ATTENDING'] as const,
        priority: ['HIGH'] as const,
        search: 'test',
      };

      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(result.current.filters).toEqual(newFilters);
    });

    it('clears filters when reset', () => {
      const { result } = renderHook(() => useTicketStore());
      
      act(() => {
        result.current.setFilters({});
      });

      expect(result.current.filters).toEqual({});
    });
  });
});