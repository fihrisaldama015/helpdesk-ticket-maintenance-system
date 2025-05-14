import {
  CreateTicketActionDto,
  CreateTicketDto,
  CriticalValue,
  TicketStatus,
  UpdateTicketDto
} from '@/models';
import { PrismaClient } from '@prisma/client';

export class TicketService {
  private prisma = new PrismaClient();
  async createTicket(ticketData: CreateTicketDto, userId: string) {
    return this.prisma.ticket.create({
      data: {
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority,
        expectedCompletionDate: ticketData.expectedCompletionDate,
        createdById: userId,
        assignedToId: userId, // Initially assigned to creator
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });
  }

  async getTickets(filters?: {
    status?: TicketStatus;
    priority?: string;
    escalation?: string;
  }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.escalation) {
      if (filters.escalation === 'L2') where.status = TicketStatus.ESCALATED_L2;
      else if (filters.escalation === 'L3') where.status = TicketStatus.ESCALATED_L3;
    }
    return this.prisma.ticket.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  async getTicketById(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        actions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }

  async updateTicket(ticketId: string, updateData: UpdateTicketDto, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId }
    });
    if (!ticket) throw new Error('Ticket not found');
    let actionDescription = 'Updated ticket details';
    if (updateData.status && updateData.status !== ticket.status) {
      actionDescription = `Changed status from ${ticket.status} to ${updateData.status}`;
    }
    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
    });
    await this.prisma.ticketAction.create({
      data: {
        ticketId,
        userId,
        action: actionDescription,
        newStatus: updateData.status
      }
    });

    return updatedTicket;
  }

  async escalateTicket(
    ticketId: string,
    userId: string,
    notes: string,
    targetLevel: 'L2' | 'L3',
    criticalValue?: CriticalValue
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId }
    });
    if (!ticket) throw new Error('Ticket not found');
    const newStatus = targetLevel === 'L2'
      ? TicketStatus.ESCALATED_L2
      : TicketStatus.ESCALATED_L3;
    const updateData: any = {
      status: newStatus
    };
    if (criticalValue) updateData.criticalValue = criticalValue;
    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
    });
    await this.prisma.ticketAction.create({
      data: {
        ticketId,
        userId,
        action: `Escalated to ${targetLevel}`,
        notes,
        newStatus
      }
    });
    return updatedTicket;
  }

  async addTicketAction(actionData: CreateTicketActionDto, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: actionData.ticketId }
    });
    if (!ticket) throw new Error('Ticket not found');
    const action = await this.prisma.ticketAction.create({
      data: {
        ticketId: actionData.ticketId,
        userId,
        action: actionData.action,
        notes: actionData.notes,
        newStatus: actionData.newStatus
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });
    if (actionData.newStatus) {
      await this.prisma.ticket.update({
        where: { id: actionData.ticketId },
        data: {
          status: actionData.newStatus
        }
      });
    }
    return action;
  }

  async resolveTicket(ticketId: string, userId: string, resolutionNotes: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId }
    });
    if (!ticket) throw new Error('Ticket not found');
    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.RESOLVED
      }
    });
    await this.prisma.ticketAction.create({
      data: {
        ticketId,
        userId,
        action: 'Resolved ticket',
        notes: resolutionNotes,
        newStatus: TicketStatus.RESOLVED
      }
    });
    return updatedTicket;
  }

  async getTicketsByAssignee(userId: string) {
    return this.prisma.ticket.findMany({
      where: {
        assignedToId: userId,
        status: {
          not: TicketStatus.RESOLVED
        }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  async getEscalatedTickets(level: 'L2' | 'L3') {
    const status = level === 'L2'
      ? TicketStatus.ESCALATED_L2
      : TicketStatus.ESCALATED_L3;
    const where: any = {
      status
    };
    if (level === 'L3') {
      where.criticalValue = {
        in: [CriticalValue.C1, CriticalValue.C2]
      };
    }
    return this.prisma.ticket.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }
}