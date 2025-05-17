import { CreateTicketDto, CriticalValue, TicketCategory, TicketPriority, TicketStatus, UpdateTicketDto, UserRole } from '@/models';
import { TicketService } from '@/services/ticket.service';

jest.mock('@/config/prisma', () => {
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
        }
    }
})

import prisma from '@/config/prisma';

describe('TicketService', () => {
    let ticketService: TicketService;

    beforeEach(() => {
        jest.clearAllMocks();
        ticketService = new TicketService();
    });

    describe('createTicket', () => {
        it('should create a new ticket and assign it to the creator', async () => {
            const ticketData: CreateTicketDto = {
                title: 'Test Ticket',
                description: 'This is a test ticket',
                category: TicketCategory.SOFTWARE,
                priority: TicketPriority.MEDIUM,
                expectedCompletionDate: new Date('2025-06-01T12:00:00Z'),
            };

            const userId = 'user123';

            const expectedResult = {
                id: 'ticket123',
                ...ticketData,
                status: TicketStatus.NEW,
                criticalValue: 'NONE',
                createdById: userId,
                assignedToId: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: {
                    id: userId,
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                    role: UserRole.L1_AGENT,
                },
                assignedTo: {
                    id: userId,
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User',
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

    describe('getTickets', () => {
        it('should get tickets with no filters', async () => {
            const tickets = [
                {
                    id: 'ticket123',
                    title: 'Test Ticket 1',
                    description: 'Description 1',
                    category: TicketCategory.SOFTWARE,
                    priority: TicketPriority.MEDIUM,
                    status: TicketStatus.NEW,
                    criticalValue: 'NONE',
                    expectedCompletionDate: new Date('2025-06-01'),
                    createdById: 'user123',
                    assignedToId: 'user123',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: {
                        id: 'user123',
                        email: 'user1@example.com',
                        firstName: 'User',
                        lastName: 'One',
                        role: UserRole.L1_AGENT,
                    },
                    assignedTo: {
                        id: 'user123',
                        email: 'user1@example.com',
                        firstName: 'User',
                        lastName: 'One',
                        role: UserRole.L1_AGENT,
                    },
                },
                {
                    id: 'ticket456',
                    title: 'Test Ticket 2',
                    description: 'Description 2',
                    category: TicketCategory.HARDWARE,
                    priority: TicketPriority.HIGH,
                    status: TicketStatus.ATTENDING,
                    criticalValue: 'NONE',
                    expectedCompletionDate: new Date('2025-06-02'),
                    createdById: 'user456',
                    assignedToId: 'user456',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: {
                        id: 'user456',
                        email: 'user2@example.com',
                        firstName: 'User',
                        lastName: 'Two',
                        role: UserRole.L2_SUPPORT,
                    },
                    assignedTo: {
                        id: 'user456',
                        email: 'user2@example.com',
                        firstName: 'User',
                        lastName: 'Two',
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
                    updatedAt: 'desc',
                },
            });

            expect(result).toEqual(tickets);
        });

        it('should get tickets with status filter', async () => {
            const tickets = [
                {
                    id: 'ticket123',
                    title: 'Test Ticket 1',
                    description: 'Description 1',
                    category: TicketCategory.SOFTWARE,
                    priority: TicketPriority.MEDIUM,
                    status: TicketStatus.ESCALATED_L2,
                    criticalValue: 'NONE',
                    expectedCompletionDate: new Date('2025-06-01'),
                    createdById: 'user123',
                    assignedToId: 'user123',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: {
                        id: 'user123',
                        email: 'user1@example.com',
                        firstName: 'User',
                        lastName: 'One',
                        role: UserRole.L1_AGENT,
                    },
                    assignedTo: {
                        id: 'user123',
                        email: 'user1@example.com',
                        firstName: 'User',
                        lastName: 'One',
                        role: UserRole.L1_AGENT,
                    },
                },
            ];

            (prisma.ticket.findMany as jest.Mock).mockResolvedValueOnce(tickets);

            const result = await ticketService.getTickets({ status: TicketStatus.ESCALATED_L2 });

            expect(prisma.ticket.findMany).toHaveBeenCalledWith({
                where: { status: TicketStatus.ESCALATED_L2 },
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
                    updatedAt: 'desc',
                },
            });

            expect(result).toEqual(tickets);
        });

        it('should get tickets with L2 escalation filter', async () => {
            const tickets = [
                {
                    id: 'ticket123',
                    title: 'Escalated Ticket',
                    description: 'This needs L2 support',
                    category: TicketCategory.NETWORK,
                    priority: TicketPriority.HIGH,
                    status: TicketStatus.ESCALATED_L2,
                    criticalValue: 'NONE',
                    expectedCompletionDate: new Date('2025-06-01'),
                    createdById: 'user123',
                    assignedToId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: {
                        id: 'user123',
                        email: 'user1@example.com',
                        firstName: 'User',
                        lastName: 'One',
                        role: UserRole.L1_AGENT,
                    },
                    assignedTo: null,
                },
            ];

            (prisma.ticket.findMany as jest.Mock).mockResolvedValueOnce(tickets);

            const result = await ticketService.getTickets({ escalation: 'L2' });

            expect(prisma.ticket.findMany).toHaveBeenCalledWith({
                where: { status: TicketStatus.ESCALATED_L2 },
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
                    updatedAt: 'desc',
                },
            });

            expect(result).toEqual(tickets);
        });
    });

    describe('getTicketById', () => {
        it('should get a ticket by ID with all relationships', async () => {
            const ticketId = 'ticket123';
            const ticket = {
                id: ticketId,
                title: 'Test Ticket',
                description: 'Description',
                category: TicketCategory.SOFTWARE,
                priority: TicketPriority.HIGH,
                status: TicketStatus.ESCALATED_L2,
                criticalValue: 'C2',
                expectedCompletionDate: new Date('2025-06-01'),
                createdById: 'user123',
                assignedToId: 'user456',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: {
                    id: 'user123',
                    email: 'user1@example.com',
                    firstName: 'User',
                    lastName: 'One',
                    role: UserRole.L1_AGENT,
                },
                assignedTo: {
                    id: 'user456',
                    email: 'user2@example.com',
                    firstName: 'User',
                    lastName: 'Two',
                    role: UserRole.L2_SUPPORT,
                },
                actions: [
                    {
                        id: 'action1',
                        ticketId,
                        userId: 'user123',
                        action: 'Created ticket',
                        notes: null,
                        newStatus: TicketStatus.NEW,
                        createdAt: new Date(),
                        user: {
                            id: 'user123',
                            email: 'user1@example.com',
                            firstName: 'User',
                            lastName: 'One',
                            role: UserRole.L1_AGENT,
                        },
                    },
                    {
                        id: 'action2',
                        ticketId,
                        userId: 'user123',
                        action: 'Escalated to L2',
                        notes: 'Cannot resolve at L1',
                        newStatus: TicketStatus.ESCALATED_L2,
                        createdAt: new Date(),
                        user: {
                            id: 'user123',
                            email: 'user1@example.com',
                            firstName: 'User',
                            lastName: 'One',
                            role: UserRole.L1_AGENT,
                        },
                    },
                ],
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(ticket);

            const result = await ticketService.getTicketById(ticketId);

            expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
                where: { id: ticketId },
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
                            createdAt: 'desc',
                        },
                    },
                },
            });

            expect(result).toEqual(ticket);
        });

        it('should throw an error if ticket is not found', async () => {
            (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(null);

            await expect(ticketService.getTicketById('nonexistent')).rejects.toThrow('Ticket not found');

            expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
                where: { id: 'nonexistent' },
                include: expect.any(Object),
            });
        });
    });

    describe('updateTicket', () => {
        it('should update a ticket and create an action record', async () => {
            const ticketId = 'ticket123';
            const userId = 'user456';
            const updateData: UpdateTicketDto = {
                title: 'Updated Title',
                description: 'Updated description',
                priority: TicketPriority.HIGH,
            };

            const existingTicket = {
                id: ticketId,
                title: 'Original Title',
                description: 'Original description',
                category: TicketCategory.SOFTWARE,
                priority: TicketPriority.MEDIUM,
                status: TicketStatus.NEW,
                criticalValue: 'NONE',
            };

            const updatedTicket = {
                ...existingTicket,
                title: updateData.title,
                description: updateData.description,
                priority: updateData.priority,
                updatedAt: new Date(),
                createdBy: {
                    id: 'user123',
                    email: 'user1@example.com',
                    firstName: 'User',
                    lastName: 'One',
                    role: UserRole.L1_AGENT,
                },
                assignedTo: {
                    id: 'user456',
                    email: 'user2@example.com',
                    firstName: 'User',
                    lastName: 'Two',
                    role: UserRole.L2_SUPPORT,
                },
            };

            const newAction = {
                id: 'action3',
                ticketId,
                userId,
                action: 'Updated ticket details',
                newStatus: undefined,
                createdAt: new Date(),
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(existingTicket);
            (prisma.ticket.update as jest.Mock).mockResolvedValueOnce(updatedTicket);
            (prisma.ticketAction.create as jest.Mock).mockResolvedValueOnce(newAction);

            const result = await ticketService.updateTicket(ticketId, updateData, userId);

            expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
                where: { id: ticketId },
            });

            expect(prisma.ticket.update).toHaveBeenCalledWith({
                where: { id: ticketId },
                data: updateData,
            });

            expect(prisma.ticketAction.create).toHaveBeenCalledWith({
                data: {
                    ticketId,
                    userId,
                    action: 'Updated ticket details',
                    newStatus: undefined,
                },
            });

            expect(result).toEqual(updatedTicket);
        });

        it('should update status and create an action with status change description', async () => {
            const ticketId = 'ticket123';
            const userId = 'user456';
            const updateData: UpdateTicketDto = {
                status: TicketStatus.ATTENDING,
            };

            const existingTicket = {
                id: ticketId,
                title: 'Test Ticket',
                description: 'Description',
                category: TicketCategory.SOFTWARE,
                priority: TicketPriority.MEDIUM,
                status: TicketStatus.NEW,
                criticalValue: 'NONE',
            };

            const updatedTicket = {
                ...existingTicket,
                status: TicketStatus.ATTENDING,
                updatedAt: new Date(),
                createdBy: {
                    id: 'user123',
                    email: 'user1@example.com',
                    firstName: 'User',
                    lastName: 'One',
                    role: UserRole.L1_AGENT,
                },
                assignedTo: {
                    id: 'user456',
                    email: 'user2@example.com',
                    firstName: 'User',
                    lastName: 'Two',
                    role: UserRole.L2_SUPPORT,
                },
            };

            const newAction = {
                id: 'action3',
                ticketId,
                userId,
                action: `Changed status from ${TicketStatus.NEW} to ${TicketStatus.ATTENDING}`,
                newStatus: TicketStatus.ATTENDING,
                createdAt: new Date(),
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(existingTicket);
            (prisma.ticket.update as jest.Mock).mockResolvedValueOnce(updatedTicket);
            (prisma.ticketAction.create as jest.Mock).mockResolvedValueOnce(newAction);

            const result = await ticketService.updateTicket(ticketId, updateData, userId);

            expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
                where: { id: ticketId },
            });

            expect(prisma.ticket.update).toHaveBeenCalledWith({
                where: { id: ticketId },
                data: updateData,
            });

            expect(prisma.ticketAction.create).toHaveBeenCalledWith({
                data: {
                    ticketId,
                    userId,
                    action: `Changed status from ${TicketStatus.NEW} to ${TicketStatus.ATTENDING}`,
                    newStatus: TicketStatus.ATTENDING,
                },
            });

            expect(result).toEqual(updatedTicket);
        });

        it('should throw an error if ticket is not found', async () => {
            (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(null);

            await expect(
                ticketService.updateTicket('nonexistent', { title: 'New Title' }, 'user123')
            ).rejects.toThrow('Ticket not found');

            expect(prisma.ticket.update).not.toHaveBeenCalled();
            expect(prisma.ticketAction.create).not.toHaveBeenCalled();
        });
    });

    describe('escalateTicket', () => {
        it('should escalate a ticket to L2 and create an action record', async () => {
            const ticketId = 'ticket123';
            const userId = 'user123';
            const notes = 'Cannot resolve at L1, needs L2 support';

            const existingTicket = {
                id: ticketId,
                title: 'Test Ticket',
                description: 'Description',
                category: TicketCategory.SOFTWARE,
                priority: TicketPriority.MEDIUM,
                status: TicketStatus.NEW,
                criticalValue: 'NONE',
            };

            const updatedTicket = {
                ...existingTicket,
                status: TicketStatus.ESCALATED_L2,
                updatedAt: new Date(),
                createdBy: {
                    id: 'user123',
                    email: 'user1@example.com',
                    firstName: 'User',
                    lastName: 'One',
                    role: UserRole.L1_AGENT,
                },
                assignedTo: null,
            };

            const newAction = {
                id: 'action3',
                ticketId,
                userId,
                action: 'Escalated to L2',
                notes,
                newStatus: TicketStatus.ESCALATED_L2,
                createdAt: new Date(),
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(existingTicket);
            (prisma.ticket.update as jest.Mock).mockResolvedValueOnce(updatedTicket);
            (prisma.ticketAction.create as jest.Mock).mockResolvedValueOnce(newAction);

            const result = await ticketService.escalateTicket(ticketId, userId, notes, 'L2');

            expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
                where: { id: ticketId },
            });

            expect(prisma.ticket.update).toHaveBeenCalledWith({
                where: { id: ticketId },
                data: {
                    status: TicketStatus.ESCALATED_L2,
                },
            });

            expect(prisma.ticketAction.create).toHaveBeenCalledWith({
                data: {
                    ticketId,
                    userId,
                    action: 'Escalated to L2',
                    notes,
                    newStatus: TicketStatus.ESCALATED_L2,
                },
            });

            expect(result).toEqual(updatedTicket);
        });

        it('should escalate a ticket to L3 with critical value and create an action record', async () => {
            const ticketId = 'ticket123';
            const userId = 'user456';
            const notes = 'Serious issue, needs L3 attention';
            const criticalValue = CriticalValue.C1;

            const existingTicket = {
                id: ticketId,
                title: 'Test Ticket',
                description: 'Description',
                category: TicketCategory.HARDWARE,
                priority: TicketPriority.HIGH,
                status: TicketStatus.ESCALATED_L2,
                criticalValue: 'NONE',
            };

            const updatedTicket = {
                ...existingTicket,
                status: TicketStatus.ESCALATED_L3,
                criticalValue: CriticalValue.C1,
                updatedAt: new Date(),
                createdBy: {
                    id: 'user123',
                    email: 'user1@example.com',
                    firstName: 'User',
                    lastName: 'One',
                    role: UserRole.L1_AGENT,
                },
                assignedTo: {
                    id: 'user456',
                    email: 'user2@example.com',
                    firstName: 'User',
                    lastName: 'Two',
                    role: UserRole.L2_SUPPORT,
                },
            };

            const newAction = {
                id: 'action4',
                ticketId,
                userId,
                action: 'Escalated to L3',
                notes,
                newStatus: TicketStatus.ESCALATED_L3,
                createdAt: new Date(),
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(existingTicket);
            (prisma.ticket.update as jest.Mock).mockResolvedValueOnce(updatedTicket);
            (prisma.ticketAction.create as jest.Mock).mockResolvedValueOnce(newAction);

            const result = await ticketService.escalateTicket(ticketId, userId, notes, 'L3', criticalValue);

            expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
                where: { id: ticketId },
            });

            expect(prisma.ticket.update).toHaveBeenCalledWith({
                where: { id: ticketId },
                data: {
                    status: TicketStatus.ESCALATED_L3,
                    criticalValue,
                },
            });

            expect(prisma.ticketAction.create).toHaveBeenCalledWith({
                data: {
                    ticketId,
                    userId,
                    action: 'Escalated to L3',
                    notes,
                    newStatus: TicketStatus.ESCALATED_L3,
                },
            });

            expect(result).toEqual(updatedTicket);
        });
    });

    describe('resolveTicket', () => {
        it('should resolve a ticket and create a resolution action record', async () => {
            const ticketId = 'ticket123';
            const userId = 'user789';
            const resolutionNotes = 'Issue fixed in database configuration';

            const existingTicket = {
                id: ticketId,
                title: 'Test Ticket',
                description: 'Description',
                category: TicketCategory.SOFTWARE,
                priority: TicketPriority.HIGH,
                status: TicketStatus.ESCALATED_L3,
                criticalValue: 'C1',
            };

            const resolvedTicket = {
                ...existingTicket,
                status: TicketStatus.RESOLVED,
                updatedAt: new Date(),
                createdBy: {
                    id: 'user123',
                    email: 'user1@example.com',
                    firstName: 'User',
                    lastName: 'One',
                    role: UserRole.L1_AGENT,
                },
                assignedTo: {
                    id: 'user789',
                    email: 'user3@example.com',
                    firstName: 'User',
                    lastName: 'Three',
                    role: UserRole.L3_SUPPORT,
                },
            };

            const newAction = {
                id: 'action5',
                ticketId,
                userId,
                action: 'Resolved ticket',
                notes: resolutionNotes,
                newStatus: TicketStatus.RESOLVED,
                createdAt: new Date(),
            };

            (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(existingTicket);
            (prisma.ticket.update as jest.Mock).mockResolvedValueOnce(resolvedTicket);
            (prisma.ticketAction.create as jest.Mock).mockResolvedValueOnce(newAction);

            const result = await ticketService.resolveTicket(ticketId, userId, resolutionNotes);

            expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
                where: { id: ticketId },
            });

            expect(prisma.ticket.update).toHaveBeenCalledWith({
                where: { id: ticketId },
                data: {
                    status: TicketStatus.RESOLVED,
                },
            });

            expect(prisma.ticketAction.create).toHaveBeenCalledWith({
                data: {
                    ticketId,
                    userId,
                    action: 'Resolved ticket',
                    notes: resolutionNotes,
                    newStatus: TicketStatus.RESOLVED,
                },
            });

            expect(result).toEqual(resolvedTicket);
        });

        it('should throw an error if ticket is not found', async () => {
            (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(null);

            await expect(
                ticketService.resolveTicket('nonexistent', 'user123', 'Resolution notes')
            ).rejects.toThrow('Ticket not found');

            expect(prisma.ticket.update).not.toHaveBeenCalled();
            expect(prisma.ticketAction.create).not.toHaveBeenCalled();
        });
    });
});
