import {
  CreateTicketDto,
  CriticalValue,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  UpdateTicketDto,
  UserRole,
} from "@/models";
import { TicketService } from "@/services/ticket.service";

jest.mock("@/config/prisma", () => {
  return {
    __esModule: true,
    default: {
      ticket: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      ticketAction: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    },
  };
});

import prisma from "@/config/prisma";

const includeTicketActionObject = {
  actions: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  },
};

const updateTicketIncludeObject = {
  createdBy: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
  assignedTo: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
};

const updateTicketIncludeWithActionObject = {
  ...updateTicketIncludeObject,
  ...includeTicketActionObject,
};

describe("TicketService", () => {
  let ticketService: TicketService;

  beforeEach(() => {
    jest.clearAllMocks();
    ticketService = new TicketService();
  });

  describe("createTicket", () => {
    it("should create a new ticket and assign it to the creator", async () => {
      const ticketData: CreateTicketDto = {
        title: "Test Ticket",
        description: "This is a test ticket",
        category: TicketCategory.SOFTWARE,
        priority: TicketPriority.MEDIUM,
        expectedCompletionDate: new Date("2025-06-01T12:00:00Z"),
      };

      const userId = "user123";

      const expectedResult = {
        id: "ticket123",
        ...ticketData,
        status: TicketStatus.NEW,
        criticalValue: "NONE",
        createdById: userId,
        assignedToId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          id: userId,
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          role: UserRole.L1_AGENT,
        },
        assignedTo: {
          id: userId,
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          role: UserRole.L1_AGENT,
        },
      };

      (prisma.ticket.create as jest.Mock).mockResolvedValueOnce(expectedResult);

      const result = await ticketService.createTicket(ticketData, userId);

      expect(prisma.ticket.create).toHaveBeenCalledWith({
        data: {
          title: ticketData.title,
          description: ticketData.description,
          category: ticketData.category,
          priority: ticketData.priority,
          expectedCompletionDate: ticketData.expectedCompletionDate,
          createdById: userId,
          assignedToId: userId,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe("getTickets", () => {
    it("should get tickets with L3 escalation filter", async () => {
      const tickets = [
        {
          id: "ticket456",
          title: "L3 Escalated Ticket",
          description: "Critical issue requiring L3 support",
          status: TicketStatus.ESCALATED_L3,
          priority: TicketPriority.HIGH,
          category: TicketCategory.SOFTWARE,
          criticalValue: CriticalValue.C1,
          expectedCompletionDate: new Date("2025-06-01"),
          createdById: "user123",
          assignedToId: "user789",
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: {
            id: "user123",
            email: "l1@example.com",
            firstName: "L1",
            lastName: "Agent",
            role: UserRole.L1_AGENT,
          },
          assignedTo: {
            id: "user789",
            email: "l3@example.com",
            firstName: "L3",
            lastName: "Support",
            role: UserRole.L3_SUPPORT,
          },
        },
      ];

      (prisma.ticket.findMany as jest.Mock).mockResolvedValue(tickets);

      const result = await ticketService.getTickets({ escalation: "L3" });

      expect(prisma.ticket.findMany).toHaveBeenCalledWith({
        where: {
          status: TicketStatus.ESCALATED_L3,
        },
        include: updateTicketIncludeObject,
        orderBy: {
          updatedAt: "desc",
        },
      });

      expect(result).toEqual(tickets);
    });
    it("should get tickets with no filters", async () => {
      const tickets = [
        {
          id: "ticket123",
          title: "Test Ticket 1",
          description: "Description 1",
          category: TicketCategory.SOFTWARE,
          priority: TicketPriority.MEDIUM,
          status: TicketStatus.NEW,
          criticalValue: "NONE",
          expectedCompletionDate: new Date("2025-06-01"),
          createdById: "user123",
          assignedToId: "user123",
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: {
            id: "user123",
            email: "user1@example.com",
            firstName: "User",
            lastName: "One",
            role: UserRole.L1_AGENT,
          },
          assignedTo: {
            id: "user123",
            email: "user1@example.com",
            firstName: "User",
            lastName: "One",
            role: UserRole.L1_AGENT,
          },
        },
        {
          id: "ticket456",
          title: "Test Ticket 2",
          description: "Description 2",
          category: TicketCategory.HARDWARE,
          priority: TicketPriority.HIGH,
          status: TicketStatus.ATTENDING,
          criticalValue: "NONE",
          expectedCompletionDate: new Date("2025-06-02"),
          createdById: "user456",
          assignedToId: "user456",
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: {
            id: "user456",
            email: "user2@example.com",
            firstName: "User",
            lastName: "Two",
            role: UserRole.L2_SUPPORT,
          },
          assignedTo: {
            id: "user456",
            email: "user2@example.com",
            firstName: "User",
            lastName: "Two",
            role: UserRole.L2_SUPPORT,
          },
        },
      ];

      (prisma.ticket.findMany as jest.Mock).mockResolvedValueOnce(tickets);

      const result = await ticketService.getTickets();

      expect(prisma.ticket.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      expect(result).toEqual(tickets);
    });

    it("should get tickets with status filter", async () => {
      const tickets = [
        {
          id: "ticket123",
          title: "Test Ticket 1",
          description: "Description 1",
          category: TicketCategory.SOFTWARE,
          priority: TicketPriority.MEDIUM,
          status: TicketStatus.ESCALATED_L2,
          criticalValue: "NONE",
          expectedCompletionDate: new Date("2025-06-01"),
          createdById: "user123",
          assignedToId: "user123",
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: {
            id: "user123",
            email: "user1@example.com",
            firstName: "User",
            lastName: "One",
            role: UserRole.L1_AGENT,
          },
          assignedTo: {
            id: "user123",
            email: "user1@example.com",
            firstName: "User",
            lastName: "One",
            role: UserRole.L1_AGENT,
          },
        },
      ];

      (prisma.ticket.findMany as jest.Mock).mockResolvedValueOnce(tickets);

      const result = await ticketService.getTickets({
        status: TicketStatus.ESCALATED_L2,
      });

      expect(prisma.ticket.findMany).toHaveBeenCalledWith({
        where: { status: TicketStatus.ESCALATED_L2 },
        include: updateTicketIncludeObject,
        orderBy: {
          updatedAt: "desc",
        },
      });

      expect(result).toEqual(tickets);
    });

    it("should get tickets with L2 escalation filter", async () => {
      const tickets = [
        {
          id: "ticket123",
          title: "Escalated Ticket",
          description: "This needs L2 support",
          category: TicketCategory.NETWORK,
          priority: TicketPriority.HIGH,
          status: TicketStatus.ESCALATED_L2,
          criticalValue: "NONE",
          expectedCompletionDate: new Date("2025-06-01"),
          createdById: "user123",
          assignedToId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: {
            id: "user123",
            email: "user1@example.com",
            firstName: "User",
            lastName: "One",
            role: UserRole.L1_AGENT,
          },
          assignedTo: null,
        },
      ];

      (prisma.ticket.findMany as jest.Mock).mockResolvedValueOnce(tickets);

      const result = await ticketService.getTickets({ escalation: "L2" });

      expect(prisma.ticket.findMany).toHaveBeenCalledWith({
        where: { status: TicketStatus.ESCALATED_L2 },
        include: updateTicketIncludeObject,
        orderBy: {
          updatedAt: "desc",
        },
      });

      expect(result).toEqual(tickets);
    });
  });

  describe("getTicketById", () => {
    it("should get a ticket by ID with all relationships", async () => {
      const ticketId = "ticket123";
      const ticket = {
        id: ticketId,
        title: "Test Ticket",
        description: "Description",
        category: TicketCategory.SOFTWARE,
        priority: TicketPriority.HIGH,
        status: TicketStatus.ESCALATED_L2,
        criticalValue: "C2",
        expectedCompletionDate: new Date("2025-06-01"),
        createdById: "user123",
        assignedToId: "user456",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          id: "user123",
          email: "user1@example.com",
          firstName: "User",
          lastName: "One",
          role: UserRole.L1_AGENT,
        },
        assignedTo: {
          id: "user456",
          email: "user2@example.com",
          firstName: "User",
          lastName: "Two",
          role: UserRole.L2_SUPPORT,
        },
        actions: [
          {
            id: "action1",
            ticketId,
            userId: "user123",
            action: "Created ticket",
            notes: null,
            newStatus: TicketStatus.NEW,
            createdAt: new Date(),
            user: {
              id: "user123",
              email: "user1@example.com",
              firstName: "User",
              lastName: "One",
              role: UserRole.L1_AGENT,
            },
          },
          {
            id: "action2",
            ticketId,
            userId: "user123",
            action: "Escalated to L2",
            notes: "Cannot resolve at L1",
            newStatus: TicketStatus.ESCALATED_L2,
            createdAt: new Date(),
            user: {
              id: "user123",
              email: "user1@example.com",
              firstName: "User",
              lastName: "One",
              role: UserRole.L1_AGENT,
            },
          },
        ],
      };

      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(ticket);

      const result = await ticketService.getTicketById(ticketId);

      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: ticketId },
        include: updateTicketIncludeWithActionObject,
      });

      expect(result).toEqual(ticket);
    });

    it("should throw an error if ticket is not found", async () => {
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(ticketService.getTicketById("nonexistent")).rejects.toThrow(
        "Ticket not found"
      );

      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: "nonexistent" },
        include: expect.any(Object),
      });
    });
  });

  describe("updateTicket", () => {
    it("should update ticket without creating action for L1 agent", async () => {
      const ticketId = "ticket123";
      const userId = "user123";
      const userRole = UserRole.L1_AGENT; // L1 agent role
      const updateData: UpdateTicketDto = {
        status: TicketStatus.ATTENDING,
      };

      const existingTicket = {
        id: ticketId,
        status: TicketStatus.NEW,
        assignedToId: null,
      };

      const updatedTicket = {
        id: ticketId,
        status: TicketStatus.ATTENDING,
        assignedToId: userId,
        // Other ticket fields
      };

      (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(existingTicket);
      (prisma.ticket.update as jest.Mock).mockResolvedValue(updatedTicket);

      const result = await ticketService.updateTicket(
        ticketId,
        updateData,
        userId,
        userRole
      );

      // Verify that ticketAction.create was not called for L1 agent
      expect(prisma.ticketAction.create).not.toHaveBeenCalled();

      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: ticketId },
        data: { ...updateData, assignedToId: userId },
        include: expect.any(Object),
      });

      expect(result).toEqual(updatedTicket);
    });
    it("should update ticket and create an action with status change description", async () => {
      const ticketId = "ticket123";
      const userId = "user456";
      const userRole = UserRole.L2_SUPPORT;

      const updateData: UpdateTicketDto = {
        criticalValue: CriticalValue.C2,
      };

      const existingTicket = {
        id: ticketId,
        title: "Test Ticket",
        description: "Description",
        category: TicketCategory.SOFTWARE,
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.ESCALATED_L2,
        criticalValue: CriticalValue.NONE,
      };

      const updatedTicket = {
        ...existingTicket,
        criticalValue: CriticalValue.C2,
        updatedAt: new Date(),
        createdBy: {
          id: "user123",
          email: "user1@example.com",
          firstName: "User",
          lastName: "One",
          role: UserRole.L1_AGENT,
        },
        assignedTo: {
          id: "user456",
          email: "user2@example.com",
          firstName: "User",
          lastName: "Two",
          role: UserRole.L2_SUPPORT,
        },
      };

      const newAction = {
        id: "action3",
        ticketId,
        userId,
        action: `Changed critical value from ${CriticalValue.NONE} to ${CriticalValue.C2}`,
        newStatus: TicketStatus.ESCALATED_L2,
        createdAt: new Date(),
      };

      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(
        existingTicket
      );
      (prisma.ticket.update as jest.Mock).mockResolvedValueOnce(updatedTicket);
      (prisma.ticketAction.create as jest.Mock).mockResolvedValueOnce(
        newAction
      );

      const result = await ticketService.updateTicket(
        ticketId,
        updateData,
        userId,
        userRole
      );

      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: ticketId },
      });

      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: ticketId },
        data: { ...updateData, assignedToId: "user456" },
        include: updateTicketIncludeWithActionObject,
      });

      expect(prisma.ticketAction.create).toHaveBeenCalledWith({
        data: {
          ticketId,
          userId,
          action: newAction.action,
          newStatus: updateData.status,
        },
      });

      expect(result).toEqual(updatedTicket);
    });

    it("should throw an error if ticket is not found", async () => {
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        ticketService.updateTicket(
          "nonexistent",
          { title: "New Title" },
          "user123"
        )
      ).rejects.toThrow("Ticket not found");

      expect(prisma.ticket.update).not.toHaveBeenCalled();
      expect(prisma.ticketAction.create).not.toHaveBeenCalled();
    });
  });

  describe("escalateTicket", () => {
    it("should escalate a ticket to L2 and create an action record", async () => {
      const ticketId = "ticket123";
      const userId = "user123";
      const notes = "Cannot resolve at L1, needs L2 support";

      const existingTicket = {
        id: ticketId,
        title: "Test Ticket",
        description: "Description",
        category: TicketCategory.SOFTWARE,
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.NEW,
        criticalValue: "NONE",
      };

      const updatedTicket = {
        ...existingTicket,
        status: TicketStatus.ESCALATED_L2,
        updatedAt: new Date(),
        createdBy: {
          id: "user123",
          email: "user1@example.com",
          firstName: "User",
          lastName: "One",
          role: UserRole.L1_AGENT,
        },
        assignedTo: null,
      };

      const newAction = {
        id: "action3",
        ticketId,
        userId,
        action: "Escalated to L2",
        notes,
        newStatus: TicketStatus.ESCALATED_L2,
        createdAt: new Date(),
      };

      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(
        existingTicket
      );
      (prisma.ticket.update as jest.Mock).mockResolvedValueOnce(updatedTicket);
      (prisma.ticketAction.create as jest.Mock).mockResolvedValueOnce(
        newAction
      );

      const result = await ticketService.escalateTicket(
        ticketId,
        userId,
        notes,
        "L2"
      );

      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: ticketId },
      });

      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: ticketId },
        data: {
          status: TicketStatus.ESCALATED_L2,
        },
        include: updateTicketIncludeWithActionObject,
      });

      expect(prisma.ticketAction.create).toHaveBeenCalledWith({
        data: {
          ticketId,
          userId,
          action: "Escalated to L2",
          notes,
          newStatus: TicketStatus.ESCALATED_L2,
        },
      });

      expect(result).toEqual(updatedTicket);
    });

    it("should escalate a ticket to L3 with critical value and create an action record", async () => {
      const ticketId = "ticket123";
      const userId = "user456";
      const notes = "Serious issue, needs L3 attention";
      const criticalValue = CriticalValue.C1;

      const existingTicket = {
        id: ticketId,
        title: "Test Ticket",
        description: "Description",
        category: TicketCategory.HARDWARE,
        priority: TicketPriority.HIGH,
        status: TicketStatus.ESCALATED_L2,
        criticalValue: "NONE",
      };

      const updatedTicket = {
        ...existingTicket,
        status: TicketStatus.ESCALATED_L3,
        criticalValue: CriticalValue.C1,
        updatedAt: new Date(),
        createdBy: {
          id: "user123",
          email: "user1@example.com",
          firstName: "User",
          lastName: "One",
          role: UserRole.L1_AGENT,
        },
        assignedTo: {
          id: "user456",
          email: "user2@example.com",
          firstName: "User",
          lastName: "Two",
          role: UserRole.L2_SUPPORT,
        },
      };

      const newAction = {
        id: "action4",
        ticketId,
        userId,
        action: "Escalated to L3",
        notes,
        newStatus: TicketStatus.ESCALATED_L3,
        createdAt: new Date(),
      };

      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(
        existingTicket
      );
      (prisma.ticket.update as jest.Mock).mockResolvedValueOnce(updatedTicket);
      (prisma.ticketAction.create as jest.Mock).mockResolvedValueOnce(
        newAction
      );

      const result = await ticketService.escalateTicket(
        ticketId,
        userId,
        notes,
        "L3",
        criticalValue
      );

      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: ticketId },
      });

      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: ticketId },
        data: {
          status: TicketStatus.ESCALATED_L3,
          criticalValue,
        },
        include: updateTicketIncludeWithActionObject,
      });

      expect(prisma.ticketAction.create).toHaveBeenCalledWith({
        data: {
          ticketId,
          userId,
          action: "Escalated to L3",
          notes,
          newStatus: TicketStatus.ESCALATED_L3,
        },
      });

      expect(result).toEqual(updatedTicket);
    });
  });

  describe("resolveTicket", () => {
    it("should resolve a ticket and create a resolution action record", async () => {
      const ticketId = "ticket123";
      const userId = "user789";
      const resolutionNotes = "Issue fixed in database configuration";

      const existingTicket = {
        id: ticketId,
        title: "Test Ticket",
        description: "Description",
        category: TicketCategory.SOFTWARE,
        priority: TicketPriority.HIGH,
        status: TicketStatus.ESCALATED_L3,
        criticalValue: "C1",
      };

      const resolvedTicket = {
        ...existingTicket,
        status: TicketStatus.RESOLVED,
        updatedAt: new Date(),
        createdBy: {
          id: "user123",
          email: "user1@example.com",
          firstName: "User",
          lastName: "One",
          role: UserRole.L1_AGENT,
        },
        assignedTo: {
          id: "user789",
          email: "user3@example.com",
          firstName: "User",
          lastName: "Three",
          role: UserRole.L3_SUPPORT,
        },
      };

      const newAction = {
        id: "action5",
        ticketId,
        userId,
        action: "Resolved ticket",
        notes: resolutionNotes,
        newStatus: TicketStatus.RESOLVED,
        createdAt: new Date(),
      };

      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(
        existingTicket
      );
      (prisma.ticket.update as jest.Mock).mockResolvedValueOnce(resolvedTicket);
      (prisma.ticketAction.create as jest.Mock).mockResolvedValueOnce(
        newAction
      );

      const result = await ticketService.resolveTicket(
        ticketId,
        userId,
        resolutionNotes
      );

      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: ticketId },
      });

      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: ticketId },
        data: {
          status: TicketStatus.RESOLVED,
          assignedToId: userId,
        },
        include: updateTicketIncludeWithActionObject,
      });

      expect(prisma.ticketAction.create).toHaveBeenCalledWith({
        data: {
          ticketId,
          userId,
          action: "Resolved ticket",
          notes: resolutionNotes,
          newStatus: TicketStatus.RESOLVED,
        },
      });

      expect(result).toEqual(resolvedTicket);
    });

    it("should throw an error if ticket is not found", async () => {
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        ticketService.resolveTicket(
          "nonexistent",
          "user123",
          "Resolution notes"
        )
      ).rejects.toThrow("Ticket not found");

      expect(prisma.ticket.update).not.toHaveBeenCalled();
      expect(prisma.ticketAction.create).not.toHaveBeenCalled();
    });
  });

  describe("addTicketAction", () => {
    it("should add a ticket action", async () => {
      const ticketId = "ticket123";
      const userId = "user456";
      const actionData = {
        ticketId,
        action: "Updated ticket status",
        notes: "Changed status to ATTENDING",
        newStatus: TicketStatus.ATTENDING,
      };

      const ticket = {
        id: ticketId,
        status: TicketStatus.NEW,
      };

      const createdAction = {
        id: "action123",
        ticketId,
        userId,
        action: actionData.action,
        notes: actionData.notes,
        newStatus: actionData.newStatus,
        createdAt: new Date(),
        user: {
          id: userId,
          email: "l2@example.com",
          firstName: "L2",
          lastName: "Support",
          role: UserRole.L2_SUPPORT,
        },
      };

      (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(ticket);
      (prisma.ticketAction.create as jest.Mock).mockResolvedValue(
        createdAction
      );
      (prisma.ticket.update as jest.Mock).mockResolvedValue({
        ...ticket,
        status: actionData.newStatus,
      });

      const result = await ticketService.addTicketAction(actionData, userId);

      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: ticketId },
      });

      expect(prisma.ticketAction.create).toHaveBeenCalledWith({
        data: {
          ticketId,
          userId,
          action: actionData.action,
          notes: actionData.notes,
          newStatus: actionData.newStatus,
        },
        include: expect.objectContaining({
          user: expect.any(Object),
        }),
      });

      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: ticketId },
        data: {
          status: actionData.newStatus,
        },
      });

      expect(result).toEqual(createdAction);
    });

    it("should add a ticket action without updating status", async () => {
      const ticketId = "ticket123";
      const userId = "user456";
      const actionData = {
        ticketId,
        action: "Added a comment",
        notes: "Just a comment, no status change",
        // No newStatus provided
      };

      const ticket = {
        id: ticketId,
        status: TicketStatus.ATTENDING,
      };

      const createdAction = {
        id: "action123",
        ticketId,
        userId,
        action: actionData.action,
        notes: actionData.notes,
        createdAt: new Date(),
        user: {
          id: userId,
          email: "l2@example.com",
          firstName: "L2",
          lastName: "Support",
          role: UserRole.L2_SUPPORT,
        },
      };

      (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(ticket);
      (prisma.ticketAction.create as jest.Mock).mockResolvedValue(
        createdAction
      );

      const result = await ticketService.addTicketAction(actionData, userId);

      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: ticketId },
      });

      expect(prisma.ticketAction.create).toHaveBeenCalledWith({
        data: {
          ticketId,
          userId,
          action: actionData.action,
          notes: actionData.notes,
          newStatus: undefined,
        },
        include: expect.objectContaining({
          user: expect.any(Object),
        }),
      });

      // Verify that ticket.update was not called when no newStatus is provided
      expect(prisma.ticket.update).not.toHaveBeenCalled();

      expect(result).toEqual(createdAction);
    });

    it("should throw an error if ticket not found", async () => {
      const ticketId = "nonexistent";
      const userId = "user456";
      const actionData = {
        ticketId,
        action: "Updated ticket status",
        notes: "Changed status to ATTENDING",
        newStatus: TicketStatus.ATTENDING,
      };

      (prisma.ticket.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        ticketService.addTicketAction(actionData, userId)
      ).rejects.toThrow("Ticket not found");

      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: ticketId },
      });

      expect(prisma.ticketAction.create).not.toHaveBeenCalled();
      expect(prisma.ticket.update).not.toHaveBeenCalled();
    });
  });

  describe("getMyTickets", () => {
    it("should get tickets assigned to a user with filters", async () => {
      const userId = "user123";
      const filters = {
        status: [TicketStatus.NEW, TicketStatus.ATTENDING],
        priority: [TicketPriority.HIGH],
        category: [TicketCategory.SOFTWARE],
        search: "network",
        page: 1,
        limit: 10,
      };

      const tickets = [
        {
          id: "ticket123",
          title: "Network Issue",
          description: "Network connectivity problem",
          status: TicketStatus.NEW,
          priority: TicketPriority.HIGH,
          category: TicketCategory.SOFTWARE,
          // Other ticket fields
        },
      ];

      const mockResponse = {
        tickets,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      (prisma.ticket.findMany as jest.Mock).mockResolvedValue(tickets);
      (prisma.ticket.count as jest.Mock) = jest.fn().mockResolvedValue(1);

      const result = await ticketService.getMyTickets(userId, filters);

      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assignedToId: userId,
            AND: expect.arrayContaining([
              { status: { in: filters.status } },
              { priority: { in: filters.priority } },
              { category: { in: filters.category } },
              expect.objectContaining({
                OR: expect.any(Array),
              }),
            ]),
          }),
          skip: 0,
          take: 10,
          include: expect.any(Object),
        })
      );

      expect(result).toEqual(
        expect.objectContaining({
          tickets,
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        })
      );
    });
  });

  describe("getEscalatedTickets", () => {
    it("should get L2 escalated tickets", async () => {
      const level = "L2";
      const filters = {
        criticalValue: [CriticalValue.C1],
        category: [TicketCategory.NETWORK],
        search: "urgent",
        page: 1,
        limit: 10,
      };

      const tickets = [
        {
          id: "ticket123",
          title: "Urgent Network Issue",
          description: "Critical network connectivity problem",
          status: TicketStatus.ESCALATED_L2,
          criticalValue: CriticalValue.C1,
          category: TicketCategory.NETWORK,
          // Other ticket fields
        },
      ];

      const mockResponse = {
        tickets,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      (prisma.ticket.findMany as jest.Mock).mockResolvedValue(tickets);
      (prisma.ticket.count as jest.Mock) = jest.fn().mockResolvedValue(1);

      const result = await ticketService.getEscalatedTickets(level, filters);

      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: TicketStatus.ESCALATED_L2,
            AND: expect.any(Array),
          }),
          skip: 0,
          take: 10,
          include: expect.any(Object),
        })
      );

      expect(result).toEqual(
        expect.objectContaining({
          tickets,
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        })
      );
    });

    it("should get L3 escalated tickets", async () => {
      const level = "L3";
      const filters = {
        criticalValue: [CriticalValue.C1],
        category: [TicketCategory.NETWORK],
        search: "urgent",
        page: 1,
        limit: 10,
      };

      const tickets = [
        {
          id: "ticket456",
          title: "Urgent Network Issue",
          description: "Critical network connectivity problem",
          status: TicketStatus.ESCALATED_L3,
          criticalValue: CriticalValue.C1,
          category: TicketCategory.NETWORK,
          // Other ticket fields
        },
      ];

      const mockResponse = {
        tickets,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      (prisma.ticket.findMany as jest.Mock).mockResolvedValue(tickets);
      (prisma.ticket.count as jest.Mock) = jest.fn().mockResolvedValue(1);

      const result = await ticketService.getEscalatedTickets(level, filters);

      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: TicketStatus.ESCALATED_L3,
            AND: expect.any(Array),
          }),
          skip: 0,
          take: 10,
          include: expect.any(Object),
        })
      );

      expect(result).toEqual(
        expect.objectContaining({
          tickets,
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        })
      );
    });
  });
});
