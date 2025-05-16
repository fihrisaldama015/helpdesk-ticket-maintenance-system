import apiClient from './axiosConfig';
import type { 
  ApiResponse, 
  Ticket, 
  TicketStatus, 
  CriticalValue, 
  TicketListResponse,
  TicketFilter
} from '../types';

const ticketRepository = {
  // Get all tickets with optional filters
  getTickets: async (filters?: TicketFilter): Promise<ApiResponse<TicketListResponse>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.status) {
          filters.status.forEach(status => params.append('status', status));
        }
        if (filters.priority) {
          filters.priority.forEach(priority => params.append('priority', priority));
        }
        if (filters.category) {
          filters.category.forEach(category => params.append('category', category));
        }
        if (filters.criticalValue) {
          filters.criticalValue.forEach(cv => {
            if (cv !== null) {
              params.append('criticalValue', cv);
            }
          });
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
        if (filters.page) {
          params.append('page', filters.page.toString());
        }
        if (filters.limit) {
          params.append('limit', filters.limit.toString());
        }
      }

      const response = await apiClient.get<ApiResponse<TicketListResponse>>('/tickets', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred while fetching tickets',
      };
    }
  },

  // Get tickets assigned to current user
  getMyTickets: async (filters?: TicketFilter): Promise<ApiResponse<TicketListResponse>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        // Add filter parameters as in getTickets
        if (filters.status) {
          filters.status.forEach(status => params.append('status', status));
        }
        // Add other filters similarly
      }

      const response = await apiClient.get<ApiResponse<TicketListResponse>>('/tickets/my-tickets', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred while fetching your tickets',
      };
    }
  },

  // Get escalated tickets (for L2 and L3)
  getEscalatedTickets: async (filters?: TicketFilter): Promise<ApiResponse<TicketListResponse>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        // Add filter parameters
        if (filters.criticalValue) {
          filters.criticalValue.forEach(cv => {
            if (cv !== null) {
              params.append('criticalValue', cv);
            }
          });
        }
        // Add other filters
      }

      const response = await apiClient.get<ApiResponse<TicketListResponse>>('/tickets/escalated-tickets', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred while fetching escalated tickets',
      };
    }
  },

  // Get ticket details by ID
  getTicketById: async (id: string): Promise<ApiResponse<Ticket>> => {
    try {
      const response = await apiClient.get<ApiResponse<Ticket>>(`/tickets/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred while fetching ticket details',
      };
    }
  },

  // Create new ticket (L1)
  createTicket: async (
    title: string,
    description: string,
    category: string,
    priority: string,
    expectedCompletionDate: string
  ): Promise<ApiResponse<Ticket>> => {
    try {
      const response = await apiClient.post<ApiResponse<Ticket>>('/tickets/create', {
        title,
        description,
        category,
        priority,
        expectedCompletionDate,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred while creating the ticket',
      };
    }
  },

  // Update ticket status
  updateTicketStatus: async (id: string, status: TicketStatus): Promise<ApiResponse<Ticket>> => {
    try {
      const response = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${id}/update-status`, {
        status,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred while updating ticket status',
      };
    }
  },

  // Escalate ticket to L2 (from L1)
  escalateToL2: async (id: string, escalationNotes: string): Promise<ApiResponse<Ticket>> => {
    try {
      const response = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${id}/escalate-l2`, {
        escalationNotes,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred while escalating the ticket',
      };
    }
  },

  // Set critical value (L2)
  setCriticalValue: async (id: string, criticalValue: CriticalValue): Promise<ApiResponse<Ticket>> => {
    try {
      const response = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${id}/set-critical-value`, {
        criticalValue,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred while setting critical value',
      };
    }
  },

  // Escalate ticket to L3 (from L2)
  escalateToL3: async (id: string, escalationNotes: string): Promise<ApiResponse<Ticket>> => {
    try {
      const response = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${id}/escalate-l3`, {
        escalationNotes,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred while escalating the ticket to L3',
      };
    }
  },

  // Add ticket action (L2 and L3)
  addTicketAction: async (
    id: string,
    action: string,
    notes: string,
    statusChange?: TicketStatus
  ): Promise<ApiResponse<Ticket>> => {
    try {
      const response = await apiClient.post<ApiResponse<Ticket>>(`/tickets/add-ticket-action/${id}`, {
        action,
        notes,
        statusChange,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred while adding ticket action',
      };
    }
  },

  // Resolve ticket (L3)
  resolveTicket: async (id: string, resolutionNotes: string): Promise<ApiResponse<Ticket>> => {
    try {
      const response = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${id}/resolve`, {
        resolutionNotes,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred while resolving the ticket',
      };
    }
  },
};

export default ticketRepository;