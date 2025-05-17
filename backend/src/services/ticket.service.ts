import {
  CreateTicketActionDto,
  CreateTicketDto,
  CriticalValue,
  TicketStatus,
  UpdateTicketDto
} from '../models';
import prisma from '../config/prisma';
import { UserRole } from '@prisma/client';

export class TicketService {
  async createTicket(ticketData: CreateTicketDto, userId: string) {
    return prisma.ticket.create({
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
    return prisma.ticket.findMany({
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
    const ticket = await prisma.ticket.findUnique({
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
            createdAt: 'desc'
          }
        }
      }
    });
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }

  async updateTicket(ticketId: string, updateData: UpdateTicketDto, userId: string, userRole?: UserRole) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });
    if (!ticket) throw new Error('Ticket not found');
    let actionDescription = 'Updated ticket details';
    if (updateData.criticalValue && updateData.criticalValue !== ticket.criticalValue) {
      actionDescription = `Changed critical value from ${ticket.criticalValue} to ${updateData.criticalValue}`;
    }
    if (updateData.status && updateData.status !== ticket.status) {
      actionDescription = `Changed status from ${ticket.status} to ${updateData.status}`;
    }
    if (userRole && userRole !== UserRole.L1_AGENT) {
      await prisma.ticketAction.create({
        data: {
          ticketId,
          userId,
          action: actionDescription,
          newStatus: updateData.status
        },
      });
    }
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { ...updateData, assignedToId: userId },
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
            createdAt: 'desc'
          }
        }
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
    const ticket = await prisma.ticket.findUnique({
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
    await prisma.ticketAction.create({
      data: {
        ticketId,
        userId,
        action: `Escalated to ${targetLevel}`,
        notes,
        newStatus
      }
    });
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
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
            createdAt: 'desc'
          }
        }
      }
    });
    return updatedTicket;
  }

  async addTicketAction(actionData: CreateTicketActionDto, userId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: actionData.ticketId }
    });
    if (!ticket) throw new Error('Ticket not found');
    const action = await prisma.ticketAction.create({
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
      await prisma.ticket.update({
        where: { id: actionData.ticketId },
        data: {
          status: actionData.newStatus
        }
      });
    }
    return action;
  }

  async resolveTicket(ticketId: string, userId: string, resolutionNotes: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });
    if (!ticket) throw new Error('Ticket not found');
    await prisma.ticketAction.create({
      data: {
        ticketId,
        userId,
        action: 'Resolved ticket',
        notes: resolutionNotes,
        newStatus: TicketStatus.RESOLVED
      }
    });
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.RESOLVED,
        assignedToId: userId
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
            createdAt: 'desc'
          }
        }
      }
    });
    return updatedTicket;
  }

  async getTicketsByAssignee(userId: string) {
    return prisma.ticket.findMany({
      where: {
        assignedToId: userId,
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
    return prisma.ticket.findMany({
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