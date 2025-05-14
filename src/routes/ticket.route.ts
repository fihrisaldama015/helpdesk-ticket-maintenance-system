import ticketController from '@/controllers/ticket.controller';
import express from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { UserRole } from '@/models';

const router = express.Router();

router.use(authenticate);
// ALL ROLE
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.get('/my-tickets', ticketController.getMyTickets);

// L1_AGENT (Helpdesk Agent)
router.post('/create', authorize([UserRole.L1_AGENT]), ticketController.createTicket);

router.put('/:id/update-status', authorize([UserRole.L1_AGENT]), ticketController.updateTicketStatus);
router.put('/:id/escalate-l2', authorize([UserRole.L1_AGENT]), ticketController.escalateToL2);

// L2_SUPPORT (Technical Support)
router.put('/:id/set-critical-value', authorize([UserRole.L2_SUPPORT]), ticketController.setCriticalValue);
router.put('/:id/escalate-l3', authorize([UserRole.L2_SUPPORT]), ticketController.escalateToL3);

// L3_SUPPORT (Advanced Support)
router.put('/:id/resolve', authorize([UserRole.L3_SUPPORT]), ticketController.resolveTicket);

// L2_SUPPORT (Technical Support) & L3_SUPPORT (Advanced Support)
router.get('/escalated-tickets', authorize([UserRole.L2_SUPPORT, UserRole.L3_SUPPORT]), ticketController.getEscalatedTickets);

router.post('/add-ticket-action/:id', authorize([UserRole.L2_SUPPORT, UserRole.L3_SUPPORT]), ticketController.addTicketAction);

export default router;
