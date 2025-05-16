import { create } from 'zustand';
import type {
  Ticket,
  TicketFilter,
  TicketStatus,
  CriticalValue
} from '../types';
import ticketRepository from '../api/ticketRepository';

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  filters: TicketFilter;
  totalTickets: number;
  currentPage: number;
  limit: number;
  
  // Actions
  getTickets: (filters?: TicketFilter) => Promise<void>;
  getMyTickets: (filters?: TicketFilter) => Promise<void>;
  getEscalatedTickets: (filters?: TicketFilter) => Promise<void>;
  getTicketById: (id: string) => Promise<void>;
  createTicket: (
    title: string,
    description: string,
    category: string,
    priority: string,
    expectedCompletionDate: string
  ) => Promise<boolean>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<boolean>;
  escalateToL2: (id: string, escalationNotes: string) => Promise<boolean>;
  setCriticalValue: (id: string, criticalValue: CriticalValue) => Promise<boolean>;
  escalateToL3: (id: string, escalationNotes: string) => Promise<boolean>;
  addTicketAction: (id: string, action: string, notes: string, statusChange?: TicketStatus) => Promise<boolean>;
  resolveTicket: (id: string, resolutionNotes: string) => Promise<boolean>;
  setFilters: (filters: TicketFilter) => void;
  clearCurrentTicket: () => void;
  clearError: () => void;
}

const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  currentTicket: null,
  isLoading: false,
  error: null,
  filters: {},
  totalTickets: 0,
  currentPage: 1,
  limit: 10,

  getTickets: async (filters?: TicketFilter) => {
    set({ isLoading: true, error: null });
    const appliedFilters = filters || get().filters;
    
    try {
      const response = await ticketRepository.getTickets(appliedFilters);
      
      if (response.success && response.data) {
        set({ 
          tickets: response.data.tickets,
          totalTickets: response.data.total,
          currentPage: response.data.page,
          limit: response.data.limit,
          isLoading: false,
          filters: appliedFilters
        });
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Failed to fetch tickets' 
        });
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'An unexpected error occurred while fetching tickets' 
      });
    }
  },

  getMyTickets: async (filters?: TicketFilter) => {
    set({ isLoading: true, error: null });
    const appliedFilters = filters || get().filters;
    
    try {
      const response = await ticketRepository.getMyTickets(appliedFilters);
      
      if (response.success && response.data) {
        set({ 
          tickets: response.data.tickets,
          totalTickets: response.data.total,
          currentPage: response.data.page,
          limit: response.data.limit,
          isLoading: false,
          filters: appliedFilters
        });
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Failed to fetch your tickets' 
        });
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'An unexpected error occurred while fetching your tickets' 
      });
    }
  },

  getEscalatedTickets: async (filters?: TicketFilter) => {
    set({ isLoading: true, error: null });
    const appliedFilters = filters || get().filters;
    
    try {
      const response = await ticketRepository.getEscalatedTickets(appliedFilters);
      
      if (response.success && response.data) {
        set({ 
          tickets: response.data.tickets,
          totalTickets: response.data.total,
          currentPage: response.data.page,
          limit: response.data.limit,
          isLoading: false,
          filters: appliedFilters
        });
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Failed to fetch escalated tickets' 
        });
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'An unexpected error occurred while fetching escalated tickets' 
      });
    }
  },

  getTicketById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketRepository.getTicketById(id);
      
      if (response.success && response.data) {
        set({ 
          currentTicket: response.data,
          isLoading: false
        });
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Failed to fetch ticket details' 
        });
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'An unexpected error occurred while fetching ticket details' 
      });
    }
  },

  createTicket: async (
    title: string,
    description: string,
    category: string,
    priority: string,
    expectedCompletionDate: string
  ) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketRepository.createTicket(
        title,
        description,
        category,
        priority,
        expectedCompletionDate
      );
      
      if (response.success && response.data) {
        set({ 
          currentTicket: response.data,
          isLoading: false
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Failed to create ticket' 
        });
        return false;
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'An unexpected error occurred while creating the ticket' 
      });
      return false;
    }
  },

  updateTicketStatus: async (id: string, status: TicketStatus) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketRepository.updateTicketStatus(id, status);
      
      if (response.success && response.data) {
        set({ 
          currentTicket: response.data,
          isLoading: false
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Failed to update ticket status' 
        });
        return false;
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'An unexpected error occurred while updating ticket status' 
      });
      return false;
    }
  },

  escalateToL2: async (id: string, escalationNotes: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketRepository.escalateToL2(id, escalationNotes);
      
      if (response.success && response.data) {
        set({ 
          currentTicket: response.data,
          isLoading: false
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Failed to escalate ticket to L2' 
        });
        return false;
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'An unexpected error occurred while escalating the ticket' 
      });
      return false;
    }
  },

  setCriticalValue: async (id: string, criticalValue: CriticalValue) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketRepository.setCriticalValue(id, criticalValue);
      
      if (response.success && response.data) {
        set({ 
          currentTicket: response.data,
          isLoading: false
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Failed to set critical value' 
        });
        return false;
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'An unexpected error occurred while setting critical value' 
      });
      return false;
    }
  },

  escalateToL3: async (id: string, escalationNotes: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketRepository.escalateToL3(id, escalationNotes);
      
      if (response.success && response.data) {
        set({ 
          currentTicket: response.data,
          isLoading: false
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Failed to escalate ticket to L3' 
        });
        return false;
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'An unexpected error occurred while escalating the ticket to L3' 
      });
      return false;
    }
  },

  addTicketAction: async (id: string, action: string, notes: string, statusChange?: TicketStatus) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketRepository.addTicketAction(id, action, notes, statusChange);
      
      if (response.success && response.data) {
        set({ 
          currentTicket: response.data,
          isLoading: false
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Failed to add ticket action' 
        });
        return false;
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'An unexpected error occurred while adding ticket action' 
      });
      return false;
    }
  },

  resolveTicket: async (id: string, resolutionNotes: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketRepository.resolveTicket(id, resolutionNotes);
      
      if (response.success && response.data) {
        set({ 
          currentTicket: response.data,
          isLoading: false
        });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: response.error || 'Failed to resolve ticket' 
        });
        return false;
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: 'An unexpected error occurred while resolving the ticket' 
      });
      return false;
    }
  },

  setFilters: (filters: TicketFilter) => {
    set({ filters });
  },

  clearCurrentTicket: () => {
    set({ currentTicket: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useTicketStore;