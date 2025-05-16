import { TicketController } from '../controllers/ticket.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models';
import { TicketService } from '../services/ticket.service';
import express from 'express';

const router = express.Router();

const ticketService = new TicketService();
const ticketController = new TicketController(ticketService);

router.use(authenticate);
// ALL ROLE
router.get('/', ticketController.getTickets.bind(ticketController));
router.get('/:id', ticketController.getTicketById.bind(ticketController));
router.get('/my-tickets', ticketController.getMyTickets.bind(ticketController));

// L1_AGENT (Helpdesk Agent)
router.post('/create', authorize([UserRole.L1_AGENT]), ticketController.createTicket.bind(ticketController));

router.put('/:id/update-status', authorize([UserRole.L1_AGENT]), ticketController.updateTicketStatus.bind(ticketController));
router.put('/:id/escalate-l2', authorize([UserRole.L1_AGENT]), ticketController.escalateToL2.bind(ticketController));

// L2_SUPPORT (Technical Support)
router.put('/:id/set-critical-value', authorize([UserRole.L2_SUPPORT]), ticketController.setCriticalValue.bind(ticketController));
router.put('/:id/escalate-l3', authorize([UserRole.L2_SUPPORT]), ticketController.escalateToL3.bind(ticketController));

// L3_SUPPORT (Advanced Support)
router.put('/:id/resolve', authorize([UserRole.L3_SUPPORT]), ticketController.resolveTicket.bind(ticketController));

// L2_SUPPORT (Technical Support) & L3_SUPPORT (Advanced Support)
router.get('/escalated-tickets', authorize([UserRole.L2_SUPPORT, UserRole.L3_SUPPORT]), ticketController.getEscalatedTickets.bind(ticketController));

router.post('/add-ticket-action/:id', authorize([UserRole.L2_SUPPORT, UserRole.L3_SUPPORT]), ticketController.addTicketAction.bind(ticketController));

export default router;
