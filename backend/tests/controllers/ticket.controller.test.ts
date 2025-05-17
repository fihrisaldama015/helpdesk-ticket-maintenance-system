import { TicketController } from '@/controllers/ticket.controller';
import { CriticalValue, TicketCategory, TicketPriority, TicketStatus, UserRole } from '@/models';
import { TicketService } from '@/services/ticket.service';
import * as httpMocks from 'node-mocks-http';

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
        updatedAt: new Date()
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
        updatedAt: new Date()
      };
      ticketService.escalateTicket.mockResolvedValueOnce(updatedTicket);
      await ticketController.escalateToL2(req, res);
      expect(ticketService.escalateTicket).toHaveBeenCalledWith(
        'ticket123',
        'user123',
        'Cannot resolve at L1, escalating to L2',
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
        updatedAt: new Date()
      };

      ticketService.updateTicket.mockResolvedValueOnce(updatedTicket);

      await ticketController.setCriticalValue(req, res);

      expect(ticketService.updateTicket).toHaveBeenCalledWith(
        'ticket123',
        { criticalValue: 'C2' },
        'user456'
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        id: 'ticket123',
        criticalValue: 'C2',
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
        updatedAt: new Date()
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
});