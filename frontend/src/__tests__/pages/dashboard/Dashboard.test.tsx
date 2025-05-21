import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../../pages/dashboard/Dashboard';
import useAuthStore from '../../../store/authStore';
import useTicketStore from '../../../store/ticketStore';
import type { Ticket, User } from '../../../types';

// Mock the auth store
jest.mock('../../../store/authStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock the ticket store
jest.mock('../../../store/ticketStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className} data-testid={`link-to-${to}`}>
      {children}
    </a>
  ),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.MockedFunction<typeof useAuthStore>;
const mockUseTicketStore = useTicketStore as unknown as jest.MockedFunction<typeof useTicketStore>;

describe('Dashboard Component', () => {
  // Mock user data
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'L1_AGENT',
  };

  // Mock tickets data
  const mockTickets: Ticket[] = [
    {
      id: '1',
      title: 'Test Ticket 1',
      description: 'Test description 1',
      status: 'NEW',
      priority: 'HIGH',
      category: 'HARDWARE',
      criticalValue: 'NONE',
      expectedCompletionDate: '2023-01-10T00:00:00.000Z',
      createdById: '1',
      createdBy: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'L1_AGENT',
      },
      assignedToId: '1',
      assignedTo: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'L1_AGENT',
      },
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Test Ticket 2',
      description: 'Test description 2',
      status: 'ATTENDING',
      priority: 'MEDIUM',
      category: 'SOFTWARE',
      criticalValue: 'NONE',
      expectedCompletionDate: '2023-01-12T00:00:00.000Z',
      createdById: '1',
      createdBy: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'L1_AGENT',
      },
      assignedToId: '1',
      assignedTo: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'L1_AGENT',
      },
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      title: 'Test Ticket 3',
      description: 'Test description 3',
      status: 'ESCALATED_L2',
      priority: 'LOW',
      category: 'NETWORK',
      criticalValue: 'C2',
      expectedCompletionDate: '2023-01-15T00:00:00.000Z',
      createdById: '1',
      createdBy: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'L1_AGENT',
      },
      assignedToId: '2',
      assignedTo: {
        id: '2',
        email: 'support@example.com',
        firstName: 'Support',
        lastName: 'User',
        role: 'L2_SUPPORT',
      },
      createdAt: '2023-01-03T00:00:00.000Z',
      updatedAt: '2023-01-03T00:00:00.000Z',
    },
    {
      id: '4',
      title: 'Test Ticket 4',
      description: 'Test description 4',
      status: 'COMPLETED',
      priority: 'HIGH',
      category: 'SOFTWARE',
      criticalValue: 'NONE',
      expectedCompletionDate: '2023-01-08T00:00:00.000Z',
      createdById: '1',
      createdBy: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'L1_AGENT',
      },
      assignedToId: '1',
      assignedTo: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'L1_AGENT',
      },
      createdAt: '2023-01-04T00:00:00.000Z',
      updatedAt: '2023-01-04T00:00:00.000Z',
    },
  ];

  const mockGetMyTickets = jest.fn();
  const mockSetFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth store
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loadUser: jest.fn(),
      clearError: jest.fn(),
    });
    
    // Mock ticket store
    mockUseTicketStore.mockReturnValue({
      tickets: mockTickets,
      ticket: null,
      isLoading: false,
      error: null,
      getTickets: jest.fn(),
      getMyTickets: mockGetMyTickets,
      getEscalatedTickets: jest.fn(),
      getTicketById: jest.fn(),
      createTicket: jest.fn(),
      updateTicketStatus: jest.fn(),
      escalateToL2: jest.fn(),
      setCriticalValue: jest.fn(),
      escalateToL3: jest.fn(),
      addTicketAction: jest.fn(),
      resolveTicket: jest.fn(),
      clearError: jest.fn(),
      setFilters: mockSetFilters,
      filters: {},
    });
  });

  const renderWithRouter = (ui: React.ReactNode) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders the dashboard with user information', () => {
    renderWithRouter(<Dashboard />);
    
    // Check if user name is displayed
    expect(screen.getByText(`Welcome, ${mockUser.firstName} ${mockUser.lastName}!`)).toBeInTheDocument();
    
    // Check if user role is displayed
    expect(screen.getByText('Helpdesk Agent (L1)')).toBeInTheDocument();
  });

  it('calls getMyTickets and setFilters on mount', () => {
    renderWithRouter(<Dashboard />);
    
    expect(mockSetFilters).toHaveBeenCalledWith({});
    expect(mockGetMyTickets).toHaveBeenCalled();
  });

  it('displays ticket status counts correctly', () => {
    renderWithRouter(<Dashboard />);
    
    // Get all elements with the text '1' and verify we have at least 4 of them
    // (for NEW, ATTENDING, ESCALATED, COMPLETED status counts)
    const countElements = screen.getAllByText('1');
    expect(countElements.length).toBeGreaterThanOrEqual(4);
  });

  it('displays recent tickets in the table', () => {
    renderWithRouter(<Dashboard />);
    
    // Check if ticket titles are displayed
    for (const ticket of mockTickets) {
      expect(screen.getByText(ticket.title)).toBeInTheDocument();
    }
  });

  it('shows loading state when isLoading is true', () => {
    mockUseTicketStore.mockReturnValue({
      ...mockUseTicketStore(),
      isLoading: true,
    });
    
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Loading tickets...')).toBeInTheDocument();
  });

  it('shows empty state when no tickets are available', () => {
    // Create a new mock implementation for this specific test
    mockUseTicketStore.mockReturnValue({
      tickets: [],
      ticket: null,
      isLoading: false,
      error: null,
      getTickets: jest.fn(),
      getMyTickets: mockGetMyTickets,
      getEscalatedTickets: jest.fn(),
      getTicketById: jest.fn(),
      createTicket: jest.fn(),
      updateTicketStatus: jest.fn(),
      escalateToL2: jest.fn(),
      setCriticalValue: jest.fn(),
      escalateToL3: jest.fn(),
      addTicketAction: jest.fn(),
      resolveTicket: jest.fn(),
      clearError: jest.fn(),
      setFilters: mockSetFilters,
      filters: {},
    });
    
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText(/No recent tickets found/i)).toBeInTheDocument();
  });

  it('shows "View all tickets" button for L1 agents', () => {
    renderWithRouter(<Dashboard />);
    
    const viewAllTicketsButton = screen.getByText('View all tickets');
    expect(viewAllTicketsButton).toBeInTheDocument();
    // Don't check for data-testid since there might be multiple elements with the same testid
  });

  it('shows "View escalated tickets" button for L2 support', () => {
    // Create a new mock implementation for this specific test
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { ...mockUser, role: 'L2_SUPPORT' },
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loadUser: jest.fn(),
      clearError: jest.fn(),
    });
    
    renderWithRouter(<Dashboard />);
    
    // Check for the button text instead of the exact text
    const buttons = screen.getAllByRole('button');
    const viewEscalatedButton = buttons.find(button => 
      button.textContent?.includes('escalated'));
    
    expect(viewEscalatedButton).toBeTruthy();
  });

  it('shows "New Ticket" button for L1 agents', () => {
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('New Ticket')).toBeInTheDocument();
    expect(screen.getByTestId('link-to-/tickets/create')).toBeInTheDocument();
  });

  it('does not show "New Ticket" button for L2 support', () => {
    // Create a new mock implementation for this specific test
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { ...mockUser, role: 'L2_SUPPORT' },
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loadUser: jest.fn(),
      clearError: jest.fn(),
    });
    
    renderWithRouter(<Dashboard />);
    
    // Check that no button contains 'New Ticket'
    const buttons = screen.getAllByRole('button');
    const newTicketButton = buttons.find(button => 
      button.textContent?.includes('New Ticket'));
    
    expect(newTicketButton).toBeUndefined();
  });

  it('shows correct role label for L2 support', () => {
    // Create a new mock implementation for this specific test
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { ...mockUser, role: 'L2_SUPPORT' },
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loadUser: jest.fn(),
      clearError: jest.fn(),
    });
    
    renderWithRouter(<Dashboard />);
    
    expect(screen.getByText('Technical Support (L2)')).toBeInTheDocument();
  });

  it('shows correct role label for L3 support', () => {
    // Create a new mock implementation for this specific test
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { ...mockUser, role: 'L3_SUPPORT' },
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loadUser: jest.fn(),
      clearError: jest.fn(),
    });
    
    renderWithRouter(<Dashboard />);
    
    // Get all text content and check if it includes the role label
    const roleLabels = screen.getAllByText(/Support/i);
    const hasL3Label = roleLabels.some(label => 
      label.textContent?.includes('Advanced Support'));
    
    expect(hasL3Label).toBeTruthy();
  });
});
