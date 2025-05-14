export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface Ticket {
    id: string;
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    criticalValue: CriticalValue;
    expectedCompletionDate?: Date;
    createdById: string;
    assignedToId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TicketAction {
    id: string;
    ticketId: string;
    userId: string;
    action: string;
    notes?: string;
    newStatus?: TicketStatus;
    createdAt: Date;
}

export interface CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}

export interface CreateTicketDto {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    expectedCompletionDate?: Date;
}

export interface UpdateTicketDto {
    title?: string;
    description?: string;
    category?: TicketCategory;
    priority?: TicketPriority;
    status?: TicketStatus;
    criticalValue?: CriticalValue;
    expectedCompletionDate?: Date;
    assignedToId?: string;
}

export interface CreateTicketActionDto {
    ticketId: string;
    action: string;
    notes?: string;
    newStatus?: TicketStatus;
}

/**
 * User Role Enum
 * 
 * - L1_AGENT: Helpdesk Agent
 * - L2_SUPPORT: Technical Support
 * - L3_SUPPORT: Advanced Support
 * 
 * @enum {string}
 */
export enum UserRole {
    L1_AGENT = 'L1_AGENT',
    L2_SUPPORT = 'L2_SUPPORT',
    L3_SUPPORT = 'L3_SUPPORT',
}

/**
 * Ticket Status Enum
 * 
 * - NEW: New ticket
 * - ATTENDING: Ticket is being attended to
 * - COMPLETED: Ticket is completed
 * - ESCALATED_L2: Ticket is escalated to L2 support
 * - ESCALATED_L3: Ticket is escalated to L3 support
 * - RESOLVED: Ticket is resolved
 * 
 * @enum {string}
 */
export enum TicketStatus {
    NEW = 'NEW',
    ATTENDING = 'ATTENDING',
    COMPLETED = 'COMPLETED',
    ESCALATED_L2 = 'ESCALATED_L2',
    ESCALATED_L3 = 'ESCALATED_L3',
    RESOLVED = 'RESOLVED'
}

/**
 * Ticket Priority Enum
 * 
 * - LOW: Low priority
 * - MEDIUM: Medium priority
 * - HIGH: High priority
 * 
 * @enum {string}
 */
export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

/**
 * Ticket Category Enum
 * 
 * - HARDWARE: Hardware issue
 * - SOFTWARE: Software issue
 * - NETWORK: Network issue
 * - ACCESS: Access issue
 * - OTHER: Other issue
 * 
 * @enum {string}
 */
export enum TicketCategory {
    HARDWARE = 'HARDWARE',
    SOFTWARE = 'SOFTWARE',
    NETWORK = 'NETWORK',
    ACCESS = 'ACCESS',
    OTHER = 'OTHER'
}

/**
 * Critical Value Enum
 * 
 * - C1: High priority
 * - C2: Medium priority
 * - C3: Low priority
 * - NONE: No critical value
 * 
 * @enum {string}
 */
export enum CriticalValue {
    C1 = 'C1',
    C2 = 'C2',
    C3 = 'C3',
    NONE = 'NONE'
}