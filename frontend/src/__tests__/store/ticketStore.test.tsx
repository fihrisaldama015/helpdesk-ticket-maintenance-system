import { act, renderHook } from '@testing-library/react';
import ticketRepository from '../../api/ticketRepository';
import useTicketStore from '../../store/ticketStore';
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  User
} from '../../types';

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

// Mock user data
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'L1_AGENT'
};

// Mock ticket data
export const mockTicket: Ticket = {
  id: '1',
  title: 'Test Ticket',
  status: 'NEW',
  priority: 'HIGH',
  category: 'SOFTWARE',
  criticalValue: 'NONE',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  expectedCompletionDate: new Date().toISOString(),
  description: 'Test description',
  createdById: '1',
  createdBy: mockUser,
  assignedToId: '1',
  assignedTo: mockUser,
  actions: [],
};

describe('ticketStore', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getTickets', () => {
    it('successfully fetches tickets', async () => {
      const mockTickets = [mockTicket];
      (ticketRepository.getTickets as jest.Mock).mockResolvedValue({
        tickets: mockTickets,
        total: 1,
        page: 1,
        limit: 10
      });

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        await result.current.getTickets();
      });

      expect(ticketRepository.getTickets).toHaveBeenCalled();
      expect(result.current.tickets).toEqual(mockTickets);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles error when fetching tickets fails', async () => {
      const error = new Error('Failed to fetch tickets');
      (ticketRepository.getTickets as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        await result.current.getTickets();
      });

      expect(result.current.error).toBe('Failed to fetch tickets');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('getMyTickets', () => {
    it('successfully fetches user tickets', async () => {
      const mockTickets = [mockTicket];
      (ticketRepository.getMyTickets as jest.Mock).mockResolvedValue({
        tickets: mockTickets,
        total: 1,
        page: 1,
        limit: 10
      });

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        await result.current.getMyTickets();
      });

      expect(ticketRepository.getMyTickets).toHaveBeenCalled();
      expect(result.current.tickets).toEqual(mockTickets);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles error when fetching user tickets fails', async () => {
      const error = new Error('Failed to fetch your tickets');
      (ticketRepository.getMyTickets as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        await result.current.getMyTickets();
      });

      expect(result.current.error).toBe('Failed to fetch your tickets');
      expect(result.current.isLoading).toBe(false);
    });

    it('applies filters when provided', async () => {
      const mockTickets = [mockTicket];
      (ticketRepository.getMyTickets as jest.Mock).mockResolvedValue({
        tickets: mockTickets,
        total: 1,
        page: 1,
        limit: 10
      });

      const { result } = renderHook(() => useTicketStore());
      const filters = { status: ['NEW'] as TicketStatus[] };

      await act(async () => {
        await result.current.getMyTickets(filters);
      });

      expect(ticketRepository.getMyTickets).toHaveBeenCalledWith(filters);
      expect(result.current.filters).toEqual(filters);
    });
  });

  describe('getEscalatedTickets', () => {
    it('successfully fetches escalated tickets', async () => {
      const mockTickets = [{ ...mockTicket, status: 'ESCALATED' }];
      (ticketRepository.getEscalatedTickets as jest.Mock).mockResolvedValue({
        tickets: mockTickets,
        total: 1,
        page: 1,
        limit: 10
      });

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        await result.current.getEscalatedTickets();
      });

      expect(ticketRepository.getEscalatedTickets).toHaveBeenCalled();
      expect(result.current.tickets).toEqual(mockTickets);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles error when fetching escalated tickets fails', async () => {
      const error = new Error('Failed to fetch escalated tickets');
      (ticketRepository.getEscalatedTickets as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        await result.current.getEscalatedTickets();
      });

      expect(result.current.error).toBe('Failed to fetch escalated tickets');
      expect(result.current.isLoading).toBe(false);
    });

    it('applies filters when provided', async () => {
      const mockTickets = [{ ...mockTicket, status: 'ESCALATED' }];
      (ticketRepository.getEscalatedTickets as jest.Mock).mockResolvedValue({
        tickets: mockTickets,
        total: 1,
        page: 1,
        limit: 10
      });

      const { result } = renderHook(() => useTicketStore());
      const filters = { priority: ['HIGH'] as TicketPriority[] };

      await act(async () => {
        await result.current.getEscalatedTickets(filters);
      });

      expect(ticketRepository.getEscalatedTickets).toHaveBeenCalledWith(filters);
      expect(result.current.filters).toEqual(filters);
    });
  });

  describe('getTicketById', () => {
    it('successfully fetches a ticket by id', async () => {
      (ticketRepository.getTicketById as jest.Mock).mockResolvedValue(mockTicket);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        await result.current.getTicketById('1');
      });

      expect(ticketRepository.getTicketById).toHaveBeenCalledWith('1');
      expect(result.current.currentTicket).toEqual(mockTicket);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles error when fetching ticket by id fails', async () => {
      const error = new Error('Ticket not found');
      (ticketRepository.getTicketById as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        await result.current.getTicketById('999');
      });

      expect(result.current.error).toBe('Ticket not found');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('createTicket', () => {
    it('successfully creates a new ticket', async () => {
      (ticketRepository.createTicket as jest.Mock).mockResolvedValue(mockTicket);

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

      expect(ticketRepository.createTicket).toHaveBeenCalledWith(
        'New Ticket',
        'Test description',
        'SOFTWARE',
        'HIGH',
        expect.any(String)
      );
      expect(result.current.currentTicket).toEqual(mockTicket);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles error when creating ticket fails', async () => {
      const error = new Error('Failed to create ticket');
      (ticketRepository.createTicket as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.createTicket(
          'New Ticket',
          'Test description',
          'SOFTWARE',
          'HIGH',
          new Date().toISOString()
        );
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Failed to create ticket');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('updateTicketStatus', () => {
    it('successfully updates ticket status', async () => {
      const updatedTicket = { ...mockTicket, status: 'ATTENDING' as const };
      (ticketRepository.updateTicketStatus as jest.Mock).mockResolvedValue(updatedTicket);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.updateTicketStatus('1', 'ATTENDING');
        expect(success).toBe(true);
      });

      expect(ticketRepository.updateTicketStatus).toHaveBeenCalledWith('1', 'ATTENDING');
      expect(result.current.currentTicket).toEqual(updatedTicket);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles error when updating ticket status fails', async () => {
      const error = new Error('Failed to update status');
      (ticketRepository.updateTicketStatus as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.updateTicketStatus('1', 'ATTENDING');
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Failed to update status');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('escalateToL2', () => {
    it('successfully escalates ticket to L2', async () => {
      const escalatedTicket = { ...mockTicket, status: 'ESCALATED' };
      (ticketRepository.escalateToL2 as jest.Mock).mockResolvedValue(escalatedTicket);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.escalateToL2('1', 'Need L2 support');
        expect(success).toBe(true);
      });

      expect(ticketRepository.escalateToL2).toHaveBeenCalledWith('1', 'Need L2 support');
      expect(result.current.currentTicket).toEqual(escalatedTicket);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles error when escalating to L2 fails', async () => {
      const error = new Error('Failed to escalate ticket');
      (ticketRepository.escalateToL2 as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.escalateToL2('1', 'Need L2 support');
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Failed to escalate ticket');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setCriticalValue', () => {
    it('successfully sets critical value', async () => {
      const updatedTicket = { ...mockTicket, criticalValue: 'C1' };
      (ticketRepository.setCriticalValue as jest.Mock).mockResolvedValue(updatedTicket);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.setCriticalValue('1', 'C1');
        expect(success).toBe(true);
      });

      expect(ticketRepository.setCriticalValue).toHaveBeenCalledWith('1', 'C1');
      expect(result.current.currentTicket).toEqual(updatedTicket);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles error when setting critical value fails', async () => {
      const error = new Error('Failed to set critical value');
      (ticketRepository.setCriticalValue as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.setCriticalValue('1', 'C1');
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Failed to set critical value');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('escalateToL3', () => {
    it('successfully escalates ticket to L3', async () => {
      const escalatedTicket = { ...mockTicket, status: 'ESCALATED', criticalValue: 'C1' };
      (ticketRepository.escalateToL3 as jest.Mock).mockResolvedValue(escalatedTicket);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.escalateToL3('1', 'Need L3 support', 'C1');
        expect(success).toBe(true);
      });

      expect(ticketRepository.escalateToL3).toHaveBeenCalledWith('1', 'Need L3 support', 'C1');
      expect(result.current.currentTicket).toEqual(escalatedTicket);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles error when escalating to L3 fails', async () => {
      const error = new Error('Failed to escalate ticket to L3');
      (ticketRepository.escalateToL3 as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.escalateToL3('1', 'Need L3 support', 'C1');
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Failed to escalate ticket to L3');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('addTicketAction', () => {
    it('successfully adds a ticket action', async () => {
      const updatedTicket = { ...mockTicket, actions: [{ id: '1', notes: 'Test action' }] };
      (ticketRepository.addTicketAction as jest.Mock).mockResolvedValue(updatedTicket);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.addTicketAction('1', 'COMMENT', 'Test action');
        expect(success).toBe(true);
      });

      expect(ticketRepository.addTicketAction).toHaveBeenCalledWith('1', 'COMMENT', 'Test action', undefined);
      expect(result.current.currentTicket).toEqual(updatedTicket);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('successfully adds a ticket action with status change', async () => {
      const updatedTicket = { 
        ...mockTicket, 
        status: 'ATTENDING',
        actions: [{ id: '1', notes: 'Test action', newStatus: 'ATTENDING' }] 
      };
      (ticketRepository.addTicketAction as jest.Mock).mockResolvedValue(updatedTicket);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.addTicketAction('1', 'COMMENT', 'Test action', 'ATTENDING');
        expect(success).toBe(true);
      });

      expect(ticketRepository.addTicketAction).toHaveBeenCalledWith('1', 'COMMENT', 'Test action', 'ATTENDING');
      expect(result.current.currentTicket).toEqual(updatedTicket);
    });

    it('handles error when adding ticket action fails', async () => {
      const error = new Error('Failed to add action');
      (ticketRepository.addTicketAction as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.addTicketAction('1', 'COMMENT', 'Test action');
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Failed to add action');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('resolveTicket', () => {
    it('successfully resolves a ticket', async () => {
      const resolvedTicket = { ...mockTicket, status: 'RESOLVED' };
      (ticketRepository.resolveTicket as jest.Mock).mockResolvedValue(resolvedTicket);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.resolveTicket('1', 'Issue resolved');
        expect(success).toBe(true);
      });

      expect(ticketRepository.resolveTicket).toHaveBeenCalledWith('1', 'Issue resolved');
      expect(result.current.currentTicket).toEqual(resolvedTicket);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles error when resolving ticket fails', async () => {
      const error = new Error('Failed to resolve ticket');
      (ticketRepository.resolveTicket as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useTicketStore());

      await act(async () => {
        const success = await result.current.resolveTicket('1', 'Issue resolved');
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Failed to resolve ticket');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setFilters', () => {
    it('updates filters correctly', () => {
      const { result } = renderHook(() => useTicketStore());
      
      const newFilters = {
        status: ['NEW', 'ATTENDING'] as TicketStatus[],
        priority: ['HIGH'] as TicketPriority[],
        search: 'test',
      };

      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(result.current.filters).toEqual(newFilters);
    });
  });

  describe('clearCurrentTicket', () => {
    it('clears the current ticket', () => {
      const { result } = renderHook(() => useTicketStore());
      
      // First set a current ticket
      act(() => {
        result.current.currentTicket = mockTicket;
      });

      // Then clear it
      act(() => {
        result.current.clearCurrentTicket();
      });

      expect(result.current.currentTicket).toBeNull();
    });
  });

  describe('clearError', () => {
    it('clears the error', () => {
      const { result } = renderHook(() => useTicketStore());
      
      // First set an error
      act(() => {
        result.current.error = 'Test error';
      });

      // Then clear it
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
