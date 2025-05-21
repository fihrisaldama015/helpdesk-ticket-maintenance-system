import { TicketController } from '@/controllers/ticket.controller';
import { CriticalValue, Ticket, TicketCategory, TicketPriority, TicketStatus, UserRole } from '@/models';
import { TicketService } from '@/services/ticket.service';
import * as httpMocks from 'node-mocks-http';

// Helper function to handle date fields in the response
const normalizeDates = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;

  const result: any = {};
  for (const key in obj) {
    if (key === 'createdAt' || key === 'updatedAt' || key === 'performedAt') {
      // Convert string dates to Date objects for comparison
      result[key] = obj[key] ? new Date(obj[key]) : obj[key];
    } else if (Array.isArray(obj[key])) {
      result[key] = obj[key].map((item: any) => normalizeDates(item));
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = normalizeDates(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
};

jest.mock('@/services/ticket.service');

describe('TicketController', () => {
  let ticketController: TicketController;
  let ticketService: jest.Mocked<TicketService>;

  beforeEach(() => {
    jest.clearAllMocks();

    ticketService = new (TicketService as jest.Mock<TicketService>)() as jest.Mocked<TicketService>;
    ticketController = new TicketController(ticketService);
  });

  describe('createTicket', () => {
    it('should create a new ticket successfully (L1_AGENT)', async () => {
      const ticketData = {
        title: 'Test Ticket',
        description: 'This is a test ticket',
        category: TicketCategory.SOFTWARE,
        priority: TicketPriority.MEDIUM,
        expectedCompletionDate: new Date('2025-06-01T12:00:00Z')
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/tickets',
        body: ticketData,
        user: {
          id: 'user123',
          email: 'l1@example.com',
          role: UserRole.L1_AGENT
        }
      });

      const res = httpMocks.createResponse();

      const createdTicket = {
        id: 'ticket123',
        ...ticketData,
        status: TicketStatus.NEW,
        criticalValue: CriticalValue.NONE,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'user123',
        assignedToId: 'user123',
        createdBy: {
          id: 'user123',
          email: 'l1@example.com',
          firstName: 'L1',
          lastName: 'Agent',
          role: UserRole.L1_AGENT,
        },
        assignedTo: {
          id: 'user123',
          email: 'l1@example.com',
          firstName: 'L1',
          lastName: 'Agent',
          role: UserRole.L1_AGENT,
        },
      };
      ticketService.createTicket.mockResolvedValueOnce(createdTicket);
      await ticketController.createTicket(req, res);
      expect(ticketService.createTicket).toHaveBeenCalledWith(
        ticketData,
        'user123'
      );

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        id: 'ticket123',
        title: ticketData.title,
        status: TicketStatus.NEW
      }));
    });

    it('should handle errors during ticket creation', async () => {
      const ticketData = {
        title: 'Test Ticket',
        description: 'This is a test ticket',
        category: TicketCategory.SOFTWARE,
        priority: TicketPriority.MEDIUM,
        expectedCompletionDate: new Date('2025-06-01T12:00:00Z').toISOString()
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/tickets',
        body: ticketData,
        user: {
          id: 'user123',
          role: UserRole.L1_AGENT
        }
      });

      const res = httpMocks.createResponse();

      const error = new Error('Internal server error');
      ticketService.createTicket.mockRejectedValueOnce(error);

      await ticketController.createTicket(req, res);

      expect(ticketService.createTicket).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        message: 'Internal server error'
      }));
    });
  });

  describe('updateTicketStatus', () => {
    it('should update ticket status successfully (L1_AGENT)', async () => {
      const updateData = {
        status: TicketStatus.ATTENDING
      };
      const req = httpMocks.createRequest({
        method: 'PATCH',
        url: '/api/tickets/ticket123/status',
        params: { id: 'ticket123' },
        body: updateData,
        user: {
          id: 'user123',
          role: UserRole.L1_AGENT
        }
      });

      const res = httpMocks.createResponse();

      const updatedTicket = {
        id: 'ticket123',
        title: 'Test Ticket',
        description: 'Description',
        category: TicketCategory.SOFTWARE,
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.ATTENDING,
        criticalValue: CriticalValue.NONE,
        expectedCompletionDate: new Date('2025-06-01'),
        createdById: 'user123',
        assignedToId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          id: 'user123',
          email: 'creator@example.com',
          firstName: 'Creator',
          lastName: 'User',
          role: UserRole.L1_AGENT
        },
        assignedTo: {
          id: 'user123',
          email: 'creator@example.com',
          firstName: 'Creator',
          lastName: 'User',
          role: UserRole.L1_AGENT
        },
        actions: []
      };

      ticketService.updateTicket.mockResolvedValueOnce(updatedTicket);

      await ticketController.updateTicketStatus(req, res);

      expect(ticketService.updateTicket).toHaveBeenCalledWith(
        'ticket123',
        { status: TicketStatus.ATTENDING },
        'user123'
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        id: 'ticket123',
        status: TicketStatus.ATTENDING
      }));
    });
  });

  describe('escalateToL2', () => {
    it('should escalate ticket to L2 successfully (L1_AGENT)', async () => {
      const updateData = {
        notes: 'Cannot resolve at L1, escalating to L2'
      };

      const req = httpMocks.createRequest({
        method: 'PATCH',
        url: '/api/tickets/ticket123/escalate-l2',
        params: { id: 'ticket123' },
        body: updateData,
        user: {
          id: 'user123',
          role: UserRole.L1_AGENT
        }
      });
      const res = httpMocks.createResponse();
      const updatedTicket = {
        id: 'ticket123',
        title: 'Test Ticket',
        description: 'Description',
        category: TicketCategory.SOFTWARE,
        priority: TicketPriority.HIGH,
        status: TicketStatus.ESCALATED_L2,
        criticalValue: CriticalValue.NONE,
        expectedCompletionDate: new Date('2025-06-01'),
        createdById: 'user123',
        assignedToId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          id: 'user123',
          email: 'creator@example.com',
          firstName: 'Creator',
          lastName: 'User',
          role: UserRole.L1_AGENT
        },
        assignedTo: null,
        actions: [
          {
            id: 'action1',
            createdAt: new Date(),
            ticketId: 'ticket123',
            userId: 'user123',
            action: 'Escalated to L2',
            notes: updateData.notes,
            newStatus: TicketStatus.ESCALATED_L2,
            user: {
              id: 'user123',
              email: 'creator@example.com',
              firstName: 'Creator',
              lastName: 'User',
              role: UserRole.L1_AGENT
            }
          }
        ]
      };
      ticketService.escalateTicket.mockResolvedValueOnce(updatedTicket);
      await ticketController.escalateToL2(req, res);
      expect(ticketService.escalateTicket).toHaveBeenCalledWith(
        'ticket123',
        'user123',
        updateData.notes,
        'L2',
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        id: 'ticket123',
        status: TicketStatus.ESCALATED_L2
      }));
    });
  })

  describe('updateCriticalValue', () => {
    it('should update critical value successfully (L2_SUPPORT)', async () => {
      const updateData = {
        criticalValue: 'C2'
      };

      const req = httpMocks.createRequest({
        method: 'PATCH',
        url: '/api/tickets/ticket123/critical',
        params: { id: 'ticket123' },
        body: updateData,
        user: {
          id: 'user456',
          role: UserRole.L2_SUPPORT
        }
      });

      const res = httpMocks.createResponse();

      const updatedTicket = {
        id: 'ticket123',
        title: 'Test Ticket',
        description: 'Description',
        category: TicketCategory.NETWORK,
        priority: TicketPriority.HIGH,
        status: TicketStatus.ESCALATED_L2,
        criticalValue: CriticalValue.C2,
        expectedCompletionDate: new Date('2025-06-01'),
        createdById: 'user123',
        assignedToId: 'user456',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          id: 'user123',
          email: 'l1@example.com',
          firstName: 'L1',
          lastName: 'Agent',
          role: UserRole.L1_AGENT,
        },
        assignedTo: {
          id: 'user456',
          email: 'l2@example.com',
          firstName: 'L2',
          lastName: 'Support',
          role: UserRole.L2_SUPPORT,
        },
        actions: []
      };

      ticketService.updateTicket.mockResolvedValueOnce(updatedTicket);

      await ticketController.setCriticalValue(req, res);

      expect(ticketService.updateTicket).toHaveBeenCalledWith(
        'ticket123',
        updateData,
        req.user?.id,
        req.user?.role
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        id: 'ticket123',
        criticalValue: 'C2',
        status: TicketStatus.ESCALATED_L2,
        assignedToId: req.user?.id,
      }));
    });

    it('should reject critical value update from L1_AGENT', async () => {
      const updateData = {
        criticalValue: 'C1'
      };
      const req = httpMocks.createRequest({
        method: 'PATCH',
        url: '/api/tickets/ticket123/critical',
        params: { id: 'ticket123' },
        body: updateData,
        user: {
          id: 'user123',
          role: UserRole.L1_AGENT
        }
      });

      const res = httpMocks.createResponse();

      await ticketController.setCriticalValue(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        message: expect.stringContaining('not authorized')
      }));

      expect(ticketService.updateTicket).not.toHaveBeenCalled();
    });
  });

  describe('getTickets', () => {
    it('should get tickets with filters', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets?status=ESCALATED_L2&priority=HIGH',
        query: {
          status: 'ESCALATED_L2',
          priority: 'HIGH'
        },
        user: {
          id: 'user456',
          role: UserRole.L2_SUPPORT
        }
      });

      const res = httpMocks.createResponse();

      const tickets = [
        {
          id: 'ticket123',
          title: 'Test Ticket 1',
          description: 'Description',
          category: TicketCategory.NETWORK,
          priority: TicketPriority.HIGH,
          status: TicketStatus.ESCALATED_L2,
          criticalValue: CriticalValue.NONE,
          expectedCompletionDate: new Date('2025-06-01'),
          createdById: 'user123',
          assignedToId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: {
            id: 'user123',
            email: 'l2@example.com',
            firstName: 'L2',
            lastName: 'Support',
            role: UserRole.L2_SUPPORT,
          },
          assignedTo: null,
        },
        {
          id: 'ticket456',
          title: 'Test Ticket 2',
          description: 'Description',
          category: TicketCategory.HARDWARE,
          priority: TicketPriority.HIGH,
          status: TicketStatus.ESCALATED_L2,
          criticalValue: CriticalValue.NONE,
          expectedCompletionDate: new Date('2025-06-02'),
          createdById: 'user123',
          assignedToId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: {
            id: 'user123',
            email: 'l2@example.com',
            firstName: 'L2',
            lastName: 'Support',
            role: UserRole.L2_SUPPORT,
          },
          assignedTo: null,
        }
      ];

      ticketService.getTickets.mockResolvedValueOnce(tickets);

      await ticketController.getTickets(req, res);

      expect(ticketService.getTickets).toHaveBeenCalledWith({
        status: TicketStatus.ESCALATED_L2,
        priority: TicketPriority.HIGH
      });

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toHaveLength(2);
      expect(responseData[0]).toEqual(expect.objectContaining({
        id: 'ticket123',
        status: TicketStatus.ESCALATED_L2,
        priority: TicketPriority.HIGH
      }));
    });

    it('should handle empty results', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets?category=ACCESS',
        query: {
          category: 'ACCESS'
        },
        user: {
          id: 'user456',
          role: UserRole.L2_SUPPORT
        }
      });
      const res = httpMocks.createResponse();
      ticketService.getTickets.mockResolvedValueOnce([]);
      await ticketController.getTickets(req, res);
      expect(ticketService.getTickets).toHaveBeenCalledWith({
        escalation: undefined,
        priority: undefined,
        status: undefined
      });
      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual([]);
    });
  });

  describe('getTicketById', () => {
    it('should get a ticket by ID', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/detail/ticket123',
        params: { id: 'ticket123' },
        user: {
          id: 'user456',
          role: UserRole.L2_SUPPORT
        }
      });

      const res = httpMocks.createResponse();

      const ticket = {
        id: 'ticket123',
        title: 'Test Ticket',
        description: 'Description',
        category: TicketCategory.NETWORK,
        priority: TicketPriority.HIGH,
        status: TicketStatus.ESCALATED_L2,
        criticalValue: CriticalValue.C2,
        expectedCompletionDate: new Date('2025-06-01'),
        createdById: 'user123',
        createdBy: {
          id: 'user123',
          email: 'creator@example.com',
          firstName: 'Creator',
          lastName: 'User',
          role: UserRole.L1_AGENT
        },
        assignedToId: 'user456',
        assignedTo: {
          id: 'user456',
          email: 'assignee@example.com',
          firstName: 'Assignee',
          lastName: 'User',
          role: UserRole.L2_SUPPORT
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        actions: [
          {
            id: 'action1',
            ticketId: 'ticket123',
            userId: 'user123',
            user: {
              id: 'user123',
              email: 'creator@example.com',
              firstName: 'Creator',
              lastName: 'User',
              role: UserRole.L1_AGENT
            },
            action: 'Created ticket',
            notes: null,
            newStatus: TicketStatus.NEW,
            createdAt: new Date()
          },
          {
            id: 'action2',
            ticketId: 'ticket123',
            userId: 'user123',
            user: {
              id: 'user123',
              email: 'creator@example.com',
              firstName: 'Creator',
              lastName: 'User',
              role: UserRole.L1_AGENT
            },
            action: 'Updated status',
            notes: 'Cannot resolve at L1',
            newStatus: TicketStatus.ESCALATED_L2,
            createdAt: new Date()
          }
        ]
      };

      ticketService.getTicketById.mockResolvedValueOnce(ticket);

      await ticketController.getTicketById(req, res);

      expect(ticketService.getTicketById).toHaveBeenCalledWith('ticket123');

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(expect.objectContaining({
        id: 'ticket123',
        title: 'Test Ticket',
        actions: expect.arrayContaining([
          expect.objectContaining({
            action: 'Created ticket'
          }),
          expect.objectContaining({
            action: 'Updated status'
          })
        ])
      }));
    });

    it('should handle non-existent ticket ID', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/detail/nonexistent',
        params: { id: 'nonexistent' },
        user: {
          id: 'user456',
          role: UserRole.L2_SUPPORT
        }
      });

      const res = httpMocks.createResponse();

      const error = new Error('Ticket not found');
      ticketService.getTicketById.mockRejectedValueOnce(error);

      await ticketController.getTicketById(req, res);

      expect(ticketService.getTicketById).toHaveBeenCalledWith('nonexistent');

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        message: 'Ticket not found'
      }));
    });
  });

  describe('resolveTicket', () => {
    it('should resolve a ticket successfully (L3_SUPPORT)', async () => {
      const resolveData = {
        resolutionNotes: 'Issue fixed in database configuration'
      };
      const req = httpMocks.createRequest({
        method: 'PATCH',
        url: '/api/tickets/ticket123/resolve',
        params: { id: 'ticket123' },
        body: resolveData,
        user: {
          id: 'user789',
          role: UserRole.L3_SUPPORT
        }
      });

      const res = httpMocks.createResponse();

      const resolvedTicket = {
        id: 'ticket123',
        title: 'Test Ticket',
        description: 'Description',
        category: TicketCategory.SOFTWARE,
        priority: TicketPriority.HIGH,
        status: TicketStatus.RESOLVED,
        criticalValue: CriticalValue.C1,
        expectedCompletionDate: new Date('2025-06-01'),
        createdById: 'user123',
        assignedToId: 'user789',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          id: 'user123',
          email: 'creator@example.com',
          firstName: 'Creator',
          lastName: 'User',
          role: UserRole.L1_AGENT
        },
        assignedTo: {
          id: 'user789',
          email: 'assignee@example.com',
          firstName: 'Assignee',
          lastName: 'User',
          role: UserRole.L3_SUPPORT
        },
        actions: [
          {
            id: 'action1',
            ticketId: 'ticket123',
            userId: 'user789',
            action: 'Resolved ticket',
            notes: resolveData.resolutionNotes,
            newStatus: TicketStatus.RESOLVED,
            createdAt: new Date(),
            user: {
              id: 'user789',
              email: 'assignee@example.com',
              firstName: 'Assignee',
              lastName: 'User',
              role: UserRole.L3_SUPPORT
            }
          }
        ]
      };

      ticketService.resolveTicket.mockResolvedValueOnce(resolvedTicket);

      await ticketController.resolveTicket(req, res);

      expect(ticketService.resolveTicket).toHaveBeenCalledWith(
        'ticket123',
        'user789',
        resolveData.resolutionNotes
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        id: 'ticket123',
        status: TicketStatus.RESOLVED
      }));
    });

    it('should reject resolve request from unauthorized user (L1_AGENT)', async () => {
      const resolveData = {
        notes: 'Resolved'
      };

      const req = httpMocks.createRequest({
        method: 'PATCH',
        url: '/api/tickets/ticket123/resolve',
        params: { id: 'ticket123' },
        body: resolveData,
        user: {
          id: 'user123',
          role: UserRole.L1_AGENT
        }
      });

      const res = httpMocks.createResponse();

      await ticketController.resolveTicket(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        message: expect.stringContaining('not authorized')
      }));

      expect(ticketService.resolveTicket).not.toHaveBeenCalled();
    });
  });

  describe('getMyTickets', () => {
    it('should handle database errors', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/me',
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: UserRole.L1_AGENT
        },
        query: {}
      });

      const res = httpMocks.createResponse();
      // Create a custom error with Prisma error properties
      const dbError = new Error('Database error') as Error & {
        code: string;
        meta?: { target: string[] };
      };
      dbError.code = 'P2002'; // Example Prisma error code
      dbError.meta = { target: ['email'] };

      ticketService.getMyTickets.mockRejectedValueOnce(dbError);

      await ticketController.getMyTickets(req, res);

      expect(res._getStatusCode()).toBe(500);
      const response = JSON.parse(res._getData());
      expect(response).toHaveProperty('code', 'P2002');
      expect(response).toHaveProperty('meta');
    });

    it('should handle array query parameters', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/me?status=NEW&status=ATTENDING&priority=HIGH&category=SOFTWARE&search=test',
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: UserRole.L1_AGENT
        },
        query: {
          status: ['NEW', 'ATTENDING'],
          priority: 'HIGH',
          category: 'SOFTWARE',
          search: 'test',
          page: '1',
          limit: '10'
        }
      });

      const res = httpMocks.createResponse();
      const mockTickets: Ticket[] = [];
      const mockResult = {
        tickets: mockTickets,
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      ticketService.getMyTickets.mockResolvedValue(mockResult);

      await ticketController.getMyTickets(req, res);

      expect(ticketService.getMyTickets).toHaveBeenCalledWith('user123', {
        status: ['NEW', 'ATTENDING'],
        priority: ['HIGH'],
        category: ['SOFTWARE'],
        search: 'test',
        page: 1,
        limit: 10
      });
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockResult);
    });

    it('should handle invalid page and limit parameters', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/me?page=invalid&limit=invalid',
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: UserRole.L1_AGENT
        },
        query: {
          page: 'invalid',
          limit: 'invalid'
        }
      });

      const res = httpMocks.createResponse();
      const mockTickets: Ticket[] = [];
      const mockResult = {
        tickets: mockTickets,
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      ticketService.getMyTickets.mockResolvedValue(mockResult);

      await ticketController.getMyTickets(req, res);

      expect(ticketService.getMyTickets).toHaveBeenCalledWith('user123', {
        status: [],
        priority: [],
        category: [],
        search: '',
        page: 1,
        limit: 10
      });
      expect(res._getStatusCode()).toBe(200);
    });
    it('should get tickets assigned to the current user with filters', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.L1_AGENT
      };

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/me?status=ATTENDING&priority=HIGH&category=SOFTWARE&search=test',
        user: mockUser,
        query: {
          status: 'ATTENDING',
          priority: 'HIGH',
          category: 'SOFTWARE',
          search: 'test',
          page: '1',
          limit: '10'
        }
      });

      const res = httpMocks.createResponse();

      const mockTicket = {
        id: 'ticket1',
        title: 'Test Ticket 1',
        description: 'This is a test ticket',
        status: TicketStatus.ATTENDING,
        priority: TicketPriority.HIGH,
        category: TicketCategory.SOFTWARE,
        criticalValue: CriticalValue.NONE,
        createdById: 'user123',
        assignedToId: 'user123',
        expectedCompletionDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUser,
        assignedTo: mockUser,
        actions: []
      };

      const mockResult = {
        tickets: [mockTicket],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      ticketService.getMyTickets.mockResolvedValue(mockResult);

      await ticketController.getMyTickets(req, res);

      expect(ticketService.getMyTickets).toHaveBeenCalledWith('user123', {
        status: ['ATTENDING'],
        priority: ['HIGH'],
        category: ['SOFTWARE'],
        search: 'test',
        page: 1,
        limit: 10
      });
      expect(res._getStatusCode()).toBe(200);

      // Parse the response and handle date fields
      const responseData = JSON.parse(res._getData());

      // Normalize dates in the response and expected data
      const normalizedResponse = normalizeDates(responseData);
      const normalizedExpected = normalizeDates(mockResult);

      expect(normalizedResponse).toEqual(normalizedExpected);
    });

    it('should handle errors when getting my tickets', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/me',
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: UserRole.L1_AGENT
        },
        query: {}
      });

      const res = httpMocks.createResponse();
      const error = new Error('Database error');
      ticketService.getMyTickets.mockRejectedValue(error);

      await ticketController.getMyTickets(req, res);

      expect(ticketService.getMyTickets).toHaveBeenCalledWith('user123', {
        status: [],
        priority: [],
        category: [],
        search: '',
        page: 1,
        limit: 10
      });
      expect(res._getStatusCode()).toBe(500);
    });
  });

  describe('addTicketAction', () => {
    it('should add an action to a ticket', async () => {
      const actionData = {
        action: 'Updated ticket status',
        notes: 'Changed status to ATTENDING',
        newStatus: TicketStatus.ATTENDING
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.L1_AGENT
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/tickets/ticket123/actions',
        params: { id: 'ticket123' },
        body: actionData,
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: UserRole.L1_AGENT
        }
      });

      const res = httpMocks.createResponse();

      const mockAction = {
        id: 'action1',
        action: actionData.action,
        notes: actionData.notes,
        newStatus: actionData.newStatus,
        ticketId: 'ticket123',
        userId: 'user123',
        createdAt: new Date(),
        user: mockUser,
        ticket: {
          id: 'ticket123',
          title: 'Test Ticket',
          description: 'Test description',
          status: TicketStatus.ATTENDING,
          priority: TicketPriority.MEDIUM,
          category: TicketCategory.SOFTWARE,
          criticalValue: CriticalValue.NONE,
          createdById: 'user123',
          assignedToId: 'user123',
          expectedCompletionDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: mockUser,
          assignedTo: mockUser,
          actions: []
        }
      };

      const updatedTicket = {
        id: 'ticket123',
        title: 'Test Ticket',
        description: 'Test description',
        status: TicketStatus.ATTENDING,
        priority: TicketPriority.MEDIUM,
        category: TicketCategory.SOFTWARE,
        criticalValue: CriticalValue.NONE,
        createdById: 'user123',
        assignedToId: 'user123',
        expectedCompletionDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUser,
        assignedTo: mockUser,
        actions: [{
          id: 'action1',
          action: actionData.action,
          notes: actionData.notes,
          newStatus: actionData.newStatus,
          ticketId: 'ticket123',
          userId: 'user123',
          createdAt: new Date(),
          user: mockUser
        }]
      };

      ticketService.addTicketAction.mockResolvedValueOnce(mockAction);
      ticketService.updateTicket.mockResolvedValueOnce(updatedTicket);

      await ticketController.addTicketAction(req, res);

      expect(ticketService.addTicketAction).toHaveBeenCalledWith(
        {
          ticketId: 'ticket123',
          action: actionData.action,
          notes: actionData.notes,
          newStatus: actionData.newStatus
        },
        'user123'
      );
      expect(ticketService.updateTicket).toHaveBeenCalledWith(
        'ticket123',
        { assignedToId: 'user123' },
        'user123'
      );
      expect(res._getStatusCode()).toBe(201);

      // Parse the response and handle date fields
      const responseData = JSON.parse(res._getData());

      // Normalize dates in the response and expected data
      const normalizedResponse = normalizeDates(responseData);
      const normalizedExpected = normalizeDates(updatedTicket);

      expect(normalizedResponse).toEqual(normalizedExpected);
    });

    it('should return 400 if action is missing', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/tickets/ticket123/actions',
        params: { id: 'ticket123' },
        body: { notes: 'Some notes' },
        user: {
          id: 'user123',
          role: UserRole.L1_AGENT
        }
      });

      const res = httpMocks.createResponse();

      await ticketController.addTicketAction(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Action description is required'
      });
    });
  });

  describe('getEscalatedTickets', () => {
    it('should return 403 for unauthorized roles', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/escalated',
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: UserRole.L1_AGENT
        },
        query: {}
      });

      const res = httpMocks.createResponse();

      await ticketController.getEscalatedTickets(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Access denied' });
    });

    it('should handle L2 support role', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/escalated?criticalValue=C1&category=SOFTWARE&search=test',
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: UserRole.L2_SUPPORT
        },
        query: {
          criticalValue: 'C1',
          category: 'SOFTWARE',
          search: 'test',
          page: '1',
          limit: '10'
        }
      });

      const res = httpMocks.createResponse();
      const mockResult = {
        tickets: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      ticketService.getEscalatedTickets.mockResolvedValue(mockResult);

      await ticketController.getEscalatedTickets(req, res);

      expect(ticketService.getEscalatedTickets).toHaveBeenCalledWith('L2', {
        criticalValue: ['C1'],
        category: ['SOFTWARE'],
        search: 'test',
        page: 1,
        limit: 10
      });
      expect(res._getStatusCode()).toBe(200);
    });

    it('should handle array query parameters', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/escalated?criticalValue=C1&criticalValue=C2&category=SOFTWARE&category=HARDWARE',
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: UserRole.L3_SUPPORT
        },
        query: {
          criticalValue: ['C1', 'C2'],
          category: ['SOFTWARE', 'HARDWARE']
        }
      });

      const res = httpMocks.createResponse();
      const mockResult = {
        tickets: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      ticketService.getEscalatedTickets.mockResolvedValue(mockResult);

      await ticketController.getEscalatedTickets(req, res);

      expect(ticketService.getEscalatedTickets).toHaveBeenCalledWith('L3', {
        criticalValue: ['C1', 'C2'],
        category: ['SOFTWARE', 'HARDWARE'],
        search: '',
        page: 1,
        limit: 10
      });
      expect(res._getStatusCode()).toBe(200);
    });

    it('should handle database errors', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/escalated',
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: UserRole.L2_SUPPORT
        },
        query: {}
      });

      const res = httpMocks.createResponse();
      // Create a custom error with Prisma error properties
      const dbError = new Error('Database error') as Error & {
        code: string;
        meta?: { target: string[] };
      };
      dbError.code = 'P2002';
      dbError.meta = { target: ['email'] };

      ticketService.getEscalatedTickets.mockRejectedValueOnce(dbError);

      await ticketController.getEscalatedTickets(req, res);

      expect(res._getStatusCode()).toBe(500);
      const response = JSON.parse(res._getData());
      expect(response).toHaveProperty('code', 'P2002');
      expect(response).toHaveProperty('meta');
    });
    it('should get L2 escalated tickets with filters', async () => {
      const mockTickets = [
        {
          id: 'ticket1',
          title: 'L2 Escalated Ticket',
          description: 'Test description',
          status: TicketStatus.ESCALATED_L2,
          criticalValue: CriticalValue.C1,
          category: TicketCategory.SOFTWARE,
          priority: TicketPriority.HIGH,
          expectedCompletionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          createdById: 'user123',
          assignedToId: 'user123',
          createdBy: {
            id: 'user123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: UserRole.L2_SUPPORT
          },
          assignedTo: {
            id: 'user123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: UserRole.L2_SUPPORT
          },
          ticketActions: []
        }
      ];

      ticketService.getEscalatedTickets.mockResolvedValue({
        tickets: mockTickets,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/escalated-tickets?level=L2&criticalValue=C1&category=SOFTWARE&search=escalated&page=1&limit=10',
        query: {
          level: 'L2',
          criticalValue: 'C1',
          category: 'SOFTWARE',
          search: 'escalated',
          page: '1',
          limit: '10'
        },
        user: {
          id: 'user123',
          role: UserRole.L2_SUPPORT
        }
      });

      const res = httpMocks.createResponse();

      await ticketController.getEscalatedTickets(req, res);

      expect(res.statusCode).toBe(200);
      expect(ticketService.getEscalatedTickets).toHaveBeenCalledWith('L2', {
        criticalValue: ['C1'],
        category: ['SOFTWARE'],
        search: 'escalated',
        page: 1,
        limit: 10
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error') as Error & { code: string };
      error.code = 'P2002';
      ticketService.getEscalatedTickets.mockRejectedValue(error);

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/tickets/escalated-tickets?level=L2',
        query: {
          level: 'L2'
        },
        user: {
          id: 'user123',
          role: UserRole.L2_SUPPORT
        }
      });

      const res = httpMocks.createResponse();

      await ticketController.getEscalatedTickets(req, res);

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Database error',
        code: 'P2002',
        meta: undefined
      });
    });
  });
});