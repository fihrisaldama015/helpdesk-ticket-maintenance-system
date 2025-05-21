import apiClient from '../../api/axiosConfig';
import ticketRepository from '../../api/ticketRepository';
import type { CriticalValue, Ticket, TicketCategory, TicketPriority, TicketStatus } from '../../types';

// Mock the API client
jest.mock('../../api/axiosConfig', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

describe('Ticket Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTickets', () => {
    test('should fetch tickets without filters', async () => {
      // Mock response data
      const mockTickets: Ticket[] = [
        {
          id: '1',
          title: 'Test Ticket',
          description: 'Test Description',
          category: 'HARDWARE',
          priority: 'MEDIUM',
          status: 'NEW',
          criticalValue: 'NONE',
          expectedCompletionDate: '2025-05-25',
          createdById: 'user1',
          assignedToId: 'user2',
          createdAt: '2025-05-20',
          updatedAt: '2025-05-20',
        },
      ];

      const mockResponse = {
        data: mockTickets,
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await ticketRepository.getTickets();

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/tickets', { params: expect.any(URLSearchParams) });
      expect(result.tickets).toEqual(mockTickets);
      expect(result.total).toBe(1);
    });

    test('should fetch tickets with filters', async () => {
      // Mock response data
      const mockTickets: Ticket[] = [
        {
          id: '1',
          title: 'Test Ticket',
          description: 'Test Description',
          category: 'HARDWARE',
          priority: 'MEDIUM',
          status: 'NEW',
          criticalValue: 'NONE',
          expectedCompletionDate: '2025-05-25',
          createdById: 'user1',
          assignedToId: 'user2',
          createdAt: '2025-05-20',
          updatedAt: '2025-05-20',
        },
      ];

      const mockResponse = {
        data: mockTickets,
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function with filters
      const filters = {
        status: ['NEW', 'ATTENDING'] as TicketStatus[],
        priority: ['HIGH'] as TicketPriority[],
        category: ['HARDWARE'] as TicketCategory[],
        criticalValue: ['C1'] as CriticalValue[],
        search: 'test',
        page: 1,
        limit: 10,
      };
      const result = await ticketRepository.getTickets(filters);

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/tickets', { params: expect.any(URLSearchParams) });
      
      // Get the params that were passed to the API call
      const params = (apiClient.get as jest.Mock).mock.calls[0][1].params;
      
      // Verify that all filters were applied
      expect(params.getAll('status')).toEqual(['NEW', 'ATTENDING']);
      expect(params.getAll('priority')).toEqual(['HIGH']);
      expect(params.getAll('category')).toEqual(['HARDWARE']);
      expect(params.getAll('criticalValue')).toEqual(['C1']);
      expect(params.get('search')).toBe('test');
      expect(params.get('page')).toBe('1');
      expect(params.get('limit')).toBe('10');
      
      expect(result.tickets).toEqual(mockTickets);
    });

    test('should handle errors when fetching tickets', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Failed to fetch tickets',
          },
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Call and expect error
      await expect(ticketRepository.getTickets())
        .rejects
        .toEqual({ message: 'Failed to fetch tickets' });
    });
  });

  describe('getMyTickets', () => {
    test('should fetch assigned tickets without filters', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          tickets: [
            {
              id: '1',
              title: 'My Ticket',
              description: 'Assigned to me',
              category: 'SOFTWARE',
              priority: 'HIGH',
              status: 'ATTENDING',
              criticalValue: 'NONE',
              expectedCompletionDate: '2025-05-25',
              createdById: 'user1',
              assignedToId: 'currentUser',
              createdAt: '2025-05-20',
              updatedAt: '2025-05-20',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await ticketRepository.getMyTickets();

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/tickets/my-tickets', { params: expect.any(URLSearchParams) });
      expect(result).toEqual(mockResponse.data);
    });

    test('should fetch assigned tickets with status filters', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          tickets: [
            {
              id: '1',
              title: 'My Ticket',
              description: 'Assigned to me',
              category: 'SOFTWARE',
              priority: 'HIGH',
              status: 'ATTENDING',
              criticalValue: 'NONE',
              expectedCompletionDate: '2025-05-25',
              createdById: 'user1',
              assignedToId: 'currentUser',
              createdAt: '2025-05-20',
              updatedAt: '2025-05-20',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function with status filters
      const filters = {
        status: ['ATTENDING', 'NEW'] as TicketStatus[],
      };
      const result = await ticketRepository.getMyTickets(filters);

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/tickets/my-tickets', { params: expect.any(URLSearchParams) });
      
      // Get the params that were passed to the API call
      const params = (apiClient.get as jest.Mock).mock.calls[0][1].params;
      
      // Verify that status filters were applied
      expect(params.getAll('status')).toEqual(['ATTENDING', 'NEW']);
      expect(result).toEqual(mockResponse.data);
    });

    test('should fetch assigned tickets with priority filters', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          tickets: [
            {
              id: '1',
              title: 'My Ticket',
              description: 'Assigned to me',
              category: 'SOFTWARE',
              priority: 'HIGH',
              status: 'ATTENDING',
              criticalValue: 'NONE',
              expectedCompletionDate: '2025-05-25',
              createdById: 'user1',
              assignedToId: 'currentUser',
              createdAt: '2025-05-20',
              updatedAt: '2025-05-20',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function with priority filters
      const filters = {
        priority: ['HIGH', 'MEDIUM'] as TicketPriority[],
      };
      const result = await ticketRepository.getMyTickets(filters);

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/tickets/my-tickets', { params: expect.any(URLSearchParams) });
      
      // Get the params that were passed to the API call
      const params = (apiClient.get as jest.Mock).mock.calls[0][1].params;
      
      // Verify that priority filters were applied
      expect(params.getAll('priority')).toEqual(['HIGH', 'MEDIUM']);
      expect(result).toEqual(mockResponse.data);
    });

    test('should fetch assigned tickets with category filters', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          tickets: [
            {
              id: '1',
              title: 'My Ticket',
              description: 'Assigned to me',
              category: 'SOFTWARE',
              priority: 'HIGH',
              status: 'ATTENDING',
              criticalValue: 'NONE',
              expectedCompletionDate: '2025-05-25',
              createdById: 'user1',
              assignedToId: 'currentUser',
              createdAt: '2025-05-20',
              updatedAt: '2025-05-20',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function with category filters
      const filters = {
        category: ['SOFTWARE', 'HARDWARE'] as TicketCategory[],
      };
      const result = await ticketRepository.getMyTickets(filters);

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/tickets/my-tickets', { params: expect.any(URLSearchParams) });
      
      // Get the params that were passed to the API call
      const params = (apiClient.get as jest.Mock).mock.calls[0][1].params;
      
      // Verify that category filters were applied
      expect(params.getAll('category')).toEqual(['SOFTWARE', 'HARDWARE']);
      expect(result).toEqual(mockResponse.data);
    });

    test('should fetch assigned tickets with search, page, and limit filters', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          tickets: [
            {
              id: '1',
              title: 'My Ticket',
              description: 'Assigned to me',
              category: 'SOFTWARE',
              priority: 'HIGH',
              status: 'ATTENDING',
              criticalValue: 'NONE',
              expectedCompletionDate: '2025-05-25',
              createdById: 'user1',
              assignedToId: 'currentUser',
              createdAt: '2025-05-20',
              updatedAt: '2025-05-20',
            },
          ],
          total: 1,
          page: 2,
          limit: 5,
          totalPages: 3,
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function with search, page, and limit filters
      const filters = {
        search: 'test query',
        page: 2,
        limit: 5,
      };
      const result = await ticketRepository.getMyTickets(filters);

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/tickets/my-tickets', { params: expect.any(URLSearchParams) });
      
      // Get the params that were passed to the API call
      const params = (apiClient.get as jest.Mock).mock.calls[0][1].params;
      
      // Verify that search, page, and limit filters were applied
      expect(params.get('search')).toBe('test query');
      expect(params.get('page')).toBe('2');
      expect(params.get('limit')).toBe('5');
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle errors when fetching my tickets', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Failed to fetch your tickets',
          },
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Call and expect error
      await expect(ticketRepository.getMyTickets())
        .rejects
        .toEqual({ message: 'Failed to fetch your tickets' });
    });
  });

  describe('getEscalatedTickets', () => {
    test('should fetch escalated tickets without filters', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          tickets: [
            {
              id: '1',
              title: 'Escalated Ticket',
              description: 'Needs L2 attention',
              category: 'NETWORK',
              priority: 'HIGH',
              status: 'ESCALATED_L2',
              criticalValue: 'C2',
              expectedCompletionDate: '2025-05-25',
              createdById: 'user1',
              assignedToId: 'l2agent',
              createdAt: '2025-05-20',
              updatedAt: '2025-05-20',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await ticketRepository.getEscalatedTickets();

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/tickets/escalated-tickets', { params: expect.any(URLSearchParams) });
      expect(result).toEqual(mockResponse.data);
    });

    test('should fetch escalated tickets with criticalValue filters', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          tickets: [
            {
              id: '1',
              title: 'Escalated Ticket',
              description: 'Needs L2 attention',
              category: 'NETWORK',
              priority: 'HIGH',
              status: 'ESCALATED_L2',
              criticalValue: 'C2',
              expectedCompletionDate: '2025-05-25',
              createdById: 'user1',
              assignedToId: 'l2agent',
              createdAt: '2025-05-20',
              updatedAt: '2025-05-20',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function with criticalValue filters
      const filters = {
        criticalValue: ['C2', 'C3'] as CriticalValue[],
      };
      const result = await ticketRepository.getEscalatedTickets(filters);

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/tickets/escalated-tickets', { params: expect.any(URLSearchParams) });
      
      // Get the params that were passed to the API call
      const params = (apiClient.get as jest.Mock).mock.calls[0][1].params;
      
      // Verify that criticalValue filters were applied
      expect(params.getAll('criticalValue')).toEqual(['C2', 'C3']);
      expect(result).toEqual(mockResponse.data);
    });

    test('should fetch escalated tickets with category filters', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          tickets: [
            {
              id: '1',
              title: 'Escalated Ticket',
              description: 'Needs L2 attention',
              category: 'NETWORK',
              priority: 'HIGH',
              status: 'ESCALATED_L2',
              criticalValue: 'C2',
              expectedCompletionDate: '2025-05-25',
              createdById: 'user1',
              assignedToId: 'l2agent',
              createdAt: '2025-05-20',
              updatedAt: '2025-05-20',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function with category filters
      const filters = {
        category: ['NETWORK', 'HARDWARE'] as TicketCategory[],
      };
      const result = await ticketRepository.getEscalatedTickets(filters);

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/tickets/escalated-tickets', { params: expect.any(URLSearchParams) });
      
      // Get the params that were passed to the API call
      const params = (apiClient.get as jest.Mock).mock.calls[0][1].params;
      
      // Verify that category filters were applied
      expect(params.getAll('category')).toEqual(['NETWORK', 'HARDWARE']);
      expect(result).toEqual(mockResponse.data);
    });

    test('should fetch escalated tickets with search, page, and limit filters', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          tickets: [
            {
              id: '1',
              title: 'Escalated Ticket',
              description: 'Needs L2 attention',
              category: 'NETWORK',
              priority: 'HIGH',
              status: 'ESCALATED_L2',
              criticalValue: 'C2',
              expectedCompletionDate: '2025-05-25',
              createdById: 'user1',
              assignedToId: 'l2agent',
              createdAt: '2025-05-20',
              updatedAt: '2025-05-20',
            },
          ],
          total: 1,
          page: 2,
          limit: 5,
          totalPages: 3,
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function with search, page, and limit filters
      const filters = {
        search: 'escalated issue',
        page: 2,
        limit: 5,
      };
      const result = await ticketRepository.getEscalatedTickets(filters);

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/tickets/escalated-tickets', { params: expect.any(URLSearchParams) });
      
      // Get the params that were passed to the API call
      const params = (apiClient.get as jest.Mock).mock.calls[0][1].params;
      
      // Verify that search, page, and limit filters were applied
      expect(params.get('search')).toBe('escalated issue');
      expect(params.get('page')).toBe('2');
      expect(params.get('limit')).toBe('5');
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle errors when fetching escalated tickets', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Failed to fetch escalated tickets',
          },
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Call and expect error
      await expect(ticketRepository.getEscalatedTickets())
        .rejects
        .toEqual({ message: 'Failed to fetch escalated tickets' });
    });
  });

  describe('getTicketById', () => {
    test('should fetch ticket details by ID', async () => {
      // Mock response data
      const mockTicket: Ticket = {
        id: '1',
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'HARDWARE',
        priority: 'MEDIUM',
        status: 'NEW',
        criticalValue: 'NONE',
        expectedCompletionDate: '2025-05-25',
        createdById: 'user1',
        assignedToId: 'user2',
        createdAt: '2025-05-20',
        updatedAt: '2025-05-20',
        actions: [
          {
            id: 'action1',
            ticketId: '1',
            userId: 'user1',
            action: 'Created ticket',
            notes: 'Initial creation',
            createdAt: '2025-05-20',
          },
        ],
      };

      const mockResponse = {
        data: mockTicket,
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await ticketRepository.getTicketById('1');

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/tickets/detail/1');
      expect(result).toEqual(mockTicket);
    });

    test('should handle errors when fetching ticket details', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Ticket not found',
          },
        },
      };

      // Setup mock
      (apiClient.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Call and expect error
      await expect(ticketRepository.getTicketById('999'))
        .rejects
        .toEqual({ message: 'Ticket not found' });
    });
  });

  describe('createTicket', () => {
    test('should create a new ticket', async () => {
      // Mock response data
      const mockTicket: Ticket = {
        id: '1',
        title: 'New Ticket',
        description: 'New Description',
        category: 'SOFTWARE',
        priority: 'HIGH',
        status: 'NEW',
        criticalValue: 'NONE',
        expectedCompletionDate: '2025-05-30',
        createdById: 'user1',
        assignedToId: 'user2',
        createdAt: '2025-05-20',
        updatedAt: '2025-05-20',
      };

      const mockResponse = {
        data: mockTicket,
      };

      // Setup mock
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await ticketRepository.createTicket(
        'New Ticket',
        'New Description',
        'SOFTWARE',
        'HIGH',
        '2025-05-30'
      );

      // Assertions
      expect(apiClient.post).toHaveBeenCalledWith('/tickets/create', {
        title: 'New Ticket',
        description: 'New Description',
        category: 'SOFTWARE',
        priority: 'HIGH',
        expectedCompletionDate: '2025-05-30',
      });
      expect(result).toEqual(mockTicket);
    });

    test('should handle errors when creating a ticket', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Invalid ticket data',
          },
        },
      };

      // Setup mock
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      // Call and expect error
      await expect(
        ticketRepository.createTicket(
          'New Ticket',
          'New Description',
          'INVALID_CATEGORY',
          'HIGH',
          '2025-05-30'
        )
      ).rejects.toEqual({ message: 'Invalid ticket data' });
    });
  });

  describe('updateTicketStatus', () => {
    test('should update ticket status', async () => {
      // Mock response data
      const mockTicket: Ticket = {
        id: '1',
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'HARDWARE',
        priority: 'MEDIUM',
        status: 'ATTENDING',
        criticalValue: 'NONE',
        expectedCompletionDate: '2025-05-25',
        createdById: 'user1',
        assignedToId: 'user2',
        createdAt: '2025-05-20',
        updatedAt: '2025-05-21',
      };

      const mockResponse = {
        data: mockTicket,
      };

      // Setup mock
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await ticketRepository.updateTicketStatus('1', 'ATTENDING');

      // Assertions
      expect(apiClient.put).toHaveBeenCalledWith('/tickets/1/update-status', {
        status: 'ATTENDING',
      });
      expect(result).toEqual(mockTicket);
    });

    test('should handle errors when updating ticket status', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Cannot update status',
          },
        },
      };

      // Setup mock
      (apiClient.put as jest.Mock).mockRejectedValueOnce(mockError);

      // Call and expect error
      await expect(ticketRepository.updateTicketStatus('1', 'COMPLETED'))
        .rejects
        .toEqual({ message: 'Cannot update status' });
    });
  });

  describe('escalateToL2', () => {
    test('should escalate ticket to L2', async () => {
      // Mock response data
      const mockTicket: Ticket = {
        id: '1',
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'HARDWARE',
        priority: 'MEDIUM',
        status: 'ESCALATED_L2',
        criticalValue: 'NONE',
        expectedCompletionDate: '2025-05-25',
        createdById: 'user1',
        assignedToId: 'l2agent',
        createdAt: '2025-05-20',
        updatedAt: '2025-05-21',
      };

      const mockResponse = {
        data: mockTicket,
      };

      // Setup mock
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await ticketRepository.escalateToL2('1', 'Needs L2 expertise');

      // Assertions
      expect(apiClient.put).toHaveBeenCalledWith('/tickets/1/escalate-l2', {
        notes: 'Needs L2 expertise',
      });
      expect(result).toEqual(mockTicket);
    });

    test('should handle errors when escalating to L2', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Cannot escalate ticket',
          },
        },
      };

      // Setup mock
      (apiClient.put as jest.Mock).mockRejectedValueOnce(mockError);

      // Call and expect error
      await expect(ticketRepository.escalateToL2('1', 'Needs L2 expertise'))
        .rejects
        .toEqual({ message: 'Cannot escalate ticket' });
    });
  });

  describe('setCriticalValue', () => {
    test('should set critical value for a ticket', async () => {
      // Mock response data
      const mockTicket: Ticket = {
        id: '1',
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'HARDWARE',
        priority: 'MEDIUM',
        status: 'ESCALATED_L2',
        criticalValue: 'C2',
        expectedCompletionDate: '2025-05-25',
        createdById: 'user1',
        assignedToId: 'l2agent',
        createdAt: '2025-05-20',
        updatedAt: '2025-05-21',
      };

      const mockResponse = {
        data: mockTicket,
      };

      // Setup mock
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await ticketRepository.setCriticalValue('1', 'C2');

      // Assertions
      expect(apiClient.put).toHaveBeenCalledWith('/tickets/1/set-critical-value', {
        criticalValue: 'C2',
      });
      expect(result).toEqual(mockTicket);
    });

    test('should handle errors when setting critical value', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Cannot set critical value',
          },
        },
      };

      // Setup mock
      (apiClient.put as jest.Mock).mockRejectedValueOnce(mockError);

      // Call and expect error
      await expect(ticketRepository.setCriticalValue('1', 'C3'))
        .rejects
        .toEqual({ message: 'Cannot set critical value' });
    });
  });

  describe('escalateToL3', () => {
    test('should escalate ticket to L3', async () => {
      // Mock response data
      const mockTicket: Ticket = {
        id: '1',
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'HARDWARE',
        priority: 'MEDIUM',
        status: 'ESCALATED_L3',
        criticalValue: 'C3',
        expectedCompletionDate: '2025-05-25',
        createdById: 'user1',
        assignedToId: 'l3agent',
        createdAt: '2025-05-20',
        updatedAt: '2025-05-21',
      };

      const mockResponse = {
        data: mockTicket,
      };

      // Setup mock
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await ticketRepository.escalateToL3('1', 'Needs L3 expertise', 'C3');

      // Assertions
      expect(apiClient.put).toHaveBeenCalledWith('/tickets/1/escalate-l3', {
        notes: 'Needs L3 expertise',
        criticalValue: 'C3',
      });
      expect(result).toEqual(mockTicket);
    });

    test('should handle errors when escalating to L3', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Cannot escalate to L3',
          },
        },
      };

      // Setup mock
      (apiClient.put as jest.Mock).mockRejectedValueOnce(mockError);

      // Call and expect error
      await expect(ticketRepository.escalateToL3('1', 'Needs L3 expertise', 'C3'))
        .rejects
        .toEqual({ message: 'Cannot escalate to L3' });
    });
  });

  describe('addTicketAction', () => {
    test('should add action to ticket', async () => {
      // Mock response data
      const mockTicket: Ticket = {
        id: '1',
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'HARDWARE',
        priority: 'MEDIUM',
        status: 'ATTENDING',
        criticalValue: 'C2',
        expectedCompletionDate: '2025-05-25',
        createdById: 'user1',
        assignedToId: 'l2agent',
        createdAt: '2025-05-20',
        updatedAt: '2025-05-21',
        actions: [
          {
            id: 'action1',
            ticketId: '1',
            userId: 'l2agent',
            action: 'Investigation',
            notes: 'Investigating the issue',
            createdAt: '2025-05-21',
          },
        ],
      };

      const mockResponse = {
        data: mockTicket,
      };

      // Setup mock
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await ticketRepository.addTicketAction('1', 'Investigation', 'Investigating the issue', 'ATTENDING');

      // Assertions
      expect(apiClient.post).toHaveBeenCalledWith('/tickets/add-ticket-action/1', {
        action: 'Investigation',
        notes: 'Investigating the issue',
        newStatus: 'ATTENDING',
      });
      expect(result).toEqual(mockTicket);
    });

    test('should handle errors when adding ticket action', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Cannot add action',
          },
        },
      };

      // Setup mock
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      // Call and expect error
      await expect(ticketRepository.addTicketAction('1', 'Investigation', 'Investigating the issue'))
        .rejects
        .toEqual({ message: 'Cannot add action' });
    });
  });

  describe('resolveTicket', () => {
    test('should resolve a ticket', async () => {
      // Mock response data
      const mockTicket: Ticket = {
        id: '1',
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'HARDWARE',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        criticalValue: 'C2',
        expectedCompletionDate: '2025-05-25',
        createdById: 'user1',
        assignedToId: 'l3agent',
        createdAt: '2025-05-20',
        updatedAt: '2025-05-22',
      };

      const mockResponse = {
        data: mockTicket,
      };

      // Setup mock
      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the function
      const result = await ticketRepository.resolveTicket('1', 'Issue has been resolved');

      // Assertions
      expect(apiClient.put).toHaveBeenCalledWith('/tickets/1/resolve', {
        resolutionNotes: 'Issue has been resolved',
      });
      expect(result).toEqual(mockTicket);
    });

    test('should handle errors when resolving a ticket', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Cannot resolve ticket',
          },
        },
      };

      // Setup mock
      (apiClient.put as jest.Mock).mockRejectedValueOnce(mockError);

      // Call and expect error
      await expect(ticketRepository.resolveTicket('1', 'Issue has been resolved'))
        .rejects
        .toEqual({ message: 'Cannot resolve ticket' });
    });
  });
});
