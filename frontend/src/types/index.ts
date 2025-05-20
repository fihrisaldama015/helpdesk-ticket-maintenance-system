// User Types
export type UserRole = 'L1_AGENT' | 'L2_SUPPORT' | 'L3_SUPPORT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// Ticket Types
export type TicketStatus =
  | 'NEW'
  | 'ATTENDING'
  | 'COMPLETED'
  | 'ESCALATED_L2'
  | 'ESCALATED_L3'
  | 'RESOLVED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type TicketCategory = 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'ACCESS' | 'OTHER';

export type CriticalValue = 'NONE' | 'C1' | 'C2' | 'C3';

export interface TicketAction {
  id: string;
  ticketId: string;
  ticket?: Ticket;
  userId: string;
  user?: User;
  action: string;
  notes: string;
  newStatus?: TicketStatus;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  criticalValue: CriticalValue;
  expectedCompletionDate: string;
  createdById: string;
  createdBy?: User;
  assignedToId: string;
  assignedTo?: User;
  createdAt: string;
  updatedAt: string;
  actions?: TicketAction[];
}

// API Response Types
export interface ApiResponse<T> {
  status: number;
  statusText: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter Types
export interface TicketFilter {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  category?: TicketCategory[];
  criticalValue?: CriticalValue[];
  search?: string;
  page?: number;
  limit?: number;
}