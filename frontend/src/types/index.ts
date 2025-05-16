// User Types
export type UserRole = 'L1' | 'L2' | 'L3';

export interface User {
  id: string;
  name: string;
  email: string;
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

export type CriticalValue = 'C1' | 'C2' | 'C3' | null;

export interface TicketAction {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  notes: string;
  createdAt: string;
  statusChange?: TicketStatus;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  expectedCompletionDate: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedToName?: string;
  criticalValue?: CriticalValue;
  actions: TicketAction[];
  escalationNotes?: string;
  resolutionNotes?: string;
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