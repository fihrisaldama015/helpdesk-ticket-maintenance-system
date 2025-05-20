import { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { TicketStatus, UserRole, CriticalValue } from '../models';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}

export class TicketController {
  constructor(private ticketService: TicketService) { }

  async createTicket(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const { title, description, category, priority, expectedCompletionDate } = req.body;
      if (!title || !description || !category || !priority) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }
      const ticket = await this.ticketService.createTicket(
        {
          title,
          description,
          category,
          expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
          priority
        },
        req.user.id
      );
      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getTickets(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const { status, priority, escalation } = req.query;
      const tickets = await this.ticketService.getTickets({
        status: status as TicketStatus || undefined,
        priority: priority as string || undefined,
        escalation: escalation as string || undefined
      });
      res.status(200).json(tickets);
    } catch (error) {
      console.error('Get tickets error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getTicketById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const { id } = req.params;
      const ticket = await this.ticketService.getTicketById(id);
      res.status(200).json(ticket);
    } catch (error: any) {
      if (error.message === 'Ticket not found') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('Get ticket error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async updateTicketStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const { id } = req.params;
      const { status } = req.body;
      if (req.user.role === UserRole.L1_AGENT &&
        status !== TicketStatus.NEW &&
        status !== TicketStatus.ATTENDING &&
        status !== TicketStatus.COMPLETED) {
        res.status(403).json({ message: 'L1 agents can only set status to NEW, ATTENDING, or COMPLETED' });
        return;
      }
      const ticket = await this.ticketService.updateTicket(
        id,
        { status },
        req.user.id
      );
      res.status(200).json(ticket);
    } catch (error: any) {
      if (error.message === 'Ticket not found') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('Update ticket status error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async escalateToL2(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const { id } = req.params;
      const { notes } = req.body;
      if (!notes) {
        res.status(400).json({ message: 'Escalation notes are required' });
        return;
      }
      const ticket = await this.ticketService.escalateTicket(
        id,
        req.user.id,
        notes,
        'L2'
      );
      res.status(200).json(ticket);
    } catch (error: any) {
      if (error.message === 'Ticket not found') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('Escalate to L2 error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async escalateToL3(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const { id } = req.params;
      const { notes, criticalValue } = req.body;
      if (!notes || !criticalValue) {
        res.status(400).json({ message: 'Notes and critical value are required' });
        return;
      }
      if (!Object.values(CriticalValue).includes(criticalValue)) {
        res.status(400).json({ message: 'Invalid critical value' });
        return;
      }
      if (criticalValue !== CriticalValue.C1 && criticalValue !== CriticalValue.C2) {
        res.status(400).json({ message: 'Only tickets with critical value C1 or C2 can be escalated to L3' });
        return;
      }
      await this.ticketService.updateTicket(
        id,
        { criticalValue },
        req.user.id
      );
      const ticket = await this.ticketService.escalateTicket(
        id,
        req.user.id,
        notes,
        'L3',
        criticalValue
      );
      res.status(200).json(ticket);
    } catch (error: any) {
      if (error.message === 'Ticket not found') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('Escalate to L3 error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async setCriticalValue(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const { id } = req.params;
      const { criticalValue } = req.body;
      if (req.user.role !== UserRole.L2_SUPPORT && req.user.role !== UserRole.L3_SUPPORT) {
        res.status(403).json({ message: 'not authorized' });
        return;
      }
      if (!criticalValue) {
        res.status(400).json({ message: 'Critical value is required' });
        return;
      }
      if (!Object.values(CriticalValue).includes(criticalValue)) {
        res.status(400).json({ message: 'Invalid critical value' });
        return;
      }
      const ticket = await this.ticketService.updateTicket(
        id,
        { criticalValue },
        req.user.id,
        req.user.role
      );
      res.status(200).json(ticket);
    } catch (error: any) {
      if (error.message === 'Ticket not found') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('Set critical value error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async addTicketAction(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      const { id } = req.params;
      const { action, notes, newStatus } = req.body;
      if (!action) {
        res.status(400).json({ message: 'Action description is required' });
        return;
      }
      const ticketAction = await this.ticketService.addTicketAction(
        {
          ticketId: id,
          action,
          notes,
          newStatus
        },
        req.user.id
      );
      const ticket = await this.ticketService.updateTicket(
        id,
        { assignedToId: req.user.id },
        req.user.id
      );
      res.status(201).json(ticket);
    } catch (error: any) {
      if (error.message === 'Ticket not found') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('Add ticket action error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async resolveTicket(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      if (req.user.role !== UserRole.L3_SUPPORT) {
        res.status(403).json({ message: 'not authorized' });
        return;
      }
      const { id } = req.params;
      const { resolutionNotes } = req.body;
      if (!resolutionNotes) {
        res.status(400).json({ message: 'Resolution notes are required' });
        return;
      }
      const ticket = await this.ticketService.resolveTicket(
        id,
        req.user.id,
        resolutionNotes
      );
      res.status(200).json(ticket);
    } catch (error: any) {
      if (error.message === 'Ticket not found') {
        res.status(404).json({ message: error.message });
      } else {
        console.error('Resolve ticket error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
  async getMyTickets(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const userId = req.user.id;

      // Extract and type query parameters with proper typing
      const {
        status: statusParam = [],
        priority: priorityParam = [],
        category: categoryParam = [],
        search = '',
        page = '1',
        limit = '10'
      } = req.query as {
        status?: string | string[];
        priority?: string | string[];
        category?: string | string[];
        search?: string | string[];
        page?: string;
        limit?: string;
      };

      // Parse and validate query parameters
      const pageNumber = Math.max(1, parseInt(page, 10) || 1);
      const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

      // Convert query parameters to string arrays
      const toArray = (value: string | string[] | undefined): string[] => {
        if (Array.isArray(value)) {
          return value.filter((v): v is string => typeof v === 'string');
        }
        return value ? [value] : [];
      };

      const status = toArray(statusParam);
      const priority = toArray(priorityParam);
      const category = toArray(categoryParam);

      // Ensure search is always a string
      let searchTerm = '';
      if (Array.isArray(search)) {
        searchTerm = search[0] || '';
      } else if (typeof search === 'string') {
        searchTerm = search;
      }

      const result = await this.ticketService.getMyTickets(userId, {
        status,
        priority,
        category,
        search: searchTerm,
        page: pageNumber,
        limit: limitNumber
      });

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Get my tickets error:', error);
      if (error.code) {
        res.status(500).json({
          message: 'Database error',
          code: error.code,
          meta: error.meta
        });
      } else {
        res.status(500).json({
          message: error.message || 'Internal server error',
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    }
  }

  async getEscalatedTickets(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      let level: 'L2' | 'L3';
      if (req.user.role === UserRole.L2_SUPPORT) {
        level = 'L2';
      } else if (req.user.role === UserRole.L3_SUPPORT) {
        level = 'L3';
      } else {
        res.status(403).json({ message: 'Access denied' });
        return;
      }

      // Extract and type query parameters
      const {
        criticalValue: criticalValueParam,
        category: categoryParam,
        search,
        page = '1',
        limit = '10'
      } = req.query;

      // Parse and validate query parameters
      const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNumber = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));

      // Convert query parameters to the correct types
      const criticalValue = Array.isArray(criticalValueParam)
        ? criticalValueParam.filter((v): v is string => typeof v === 'string')
        : typeof criticalValueParam === 'string'
          ? [criticalValueParam]
          : undefined;

      const category = Array.isArray(categoryParam)
        ? categoryParam.filter((v): v is string => typeof v === 'string')
        : typeof categoryParam === 'string'
          ? [categoryParam]
          : undefined;

      const searchTerm = typeof search === 'string' ? search : undefined;

      // Prepare filters with proper typing and default values
      const filters = {
        criticalValue: criticalValue || [],
        category: category || [],
        search: searchTerm || '',
        page: pageNumber,
        limit: limitNumber
      };

      const result = await this.ticketService.getEscalatedTickets(level, filters);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Get escalated tickets error:', error);
      if (error.code) {
        // Handle Prisma errors
        res.status(500).json({
          message: 'Database error',
          code: error.code,
          meta: error.meta
        });
      } else {
        res.status(500).json({
          message: error.message || 'Internal server error',
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    }
  }
}

export default new TicketController(new TicketService());