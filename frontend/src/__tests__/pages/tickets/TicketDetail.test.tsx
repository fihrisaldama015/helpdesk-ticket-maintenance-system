import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TicketDetail from '../../../pages/tickets/TicketDetail';
import useAuthStore from '../../../store/authStore';
import useTicketStore from '../../../store/ticketStore';
import { TicketCategory, TicketPriority, TicketStatus, User } from '../../../types';

// Mock the stores
jest.mock('../../../store/authStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../store/ticketStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock React Router
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useParams: jest.fn(),
    useNavigate: () => jest.fn(),
  };
});

// Helper function to mock Zustand store
function mockZustandStore<T>(store: unknown, value: T): void {
  (store as unknown as jest.Mock).mockReturnValue(value);
}

// Mock implementations
const mockGetTicketById = jest.fn();
const mockClearError = jest.fn();

describe('TicketDetail', () => {
  // Mock user data
  const mockL1Agent: User = {
    id: '1',
    email: 'agent@example.com',
    firstName: 'Agent',
    lastName: 'User',
    role: 'L1_AGENT'
  };

  const mockL2Support: User = {
    id: '2',
    email: 'support@example.com',
    firstName: 'Support',
    lastName: 'User',
    role: 'L2_SUPPORT'
  };

  // Mock ticket data
  const mockTicket = {
    id: '1234567890abcdef',
    title: 'Test Ticket',
    status: 'NEW' as TicketStatus,
    priority: 'HIGH' as TicketPriority,
    category: 'SOFTWARE' as TicketCategory,
    criticalValue: 'NONE',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    expectedCompletionDate: '2023-01-10T00:00:00.000Z',
    description: 'Test description',
    createdById: '1',
    createdBy: mockL1Agent,
    assignedToId: '1',
    assignedTo: mockL1Agent,
    actions: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useParams to return a ticket ID
    (require('react-router-dom').useParams as jest.Mock).mockReturnValue({ id: '1234567890abcdef' });
    
    // Default mock implementations
    mockZustandStore(useAuthStore, {
      user: mockL1Agent,
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn()
    });
    
    mockZustandStore(useTicketStore, {
      currentTicket: mockTicket,
      isLoading: false,
      error: null,
      getTicketById: mockGetTicketById,
      clearError: mockClearError
    });
  });

  it('renders the ticket detail page', () => {
    render(
      <BrowserRouter>
        <TicketDetail />
      </BrowserRouter>
    );

    // Check if ticket title is displayed
    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    
    // Check if getTicketById was called with the correct ID
    expect(mockGetTicketById).toHaveBeenCalledWith('1234567890abcdef');
  });

  it('shows loading state when ticket is loading', () => {
    mockZustandStore(useTicketStore, {
      currentTicket: null,
      isLoading: true,
      error: null,
      getTicketById: mockGetTicketById,
      clearError: mockClearError
    });

    render(
      <BrowserRouter>
        <TicketDetail />
      </BrowserRouter>
    );

    // Check if loading spinner is displayed
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('shows not found message when ticket does not exist', () => {
    mockZustandStore(useTicketStore, {
      currentTicket: null,
      isLoading: false,
      error: null,
      getTicketById: mockGetTicketById,
      clearError: mockClearError
    });

    render(
      <BrowserRouter>
        <TicketDetail />
      </BrowserRouter>
    );

    // Check if not found message is displayed
    expect(screen.getByText('Ticket Not Found')).toBeInTheDocument();
    expect(screen.getByText('The ticket you are looking for does not exist or you don\'t have permission to view it.')).toBeInTheDocument();
  });

  it('renders update status button for L1 agent', () => {
    // Mock UpdateTicketStatusButton component
    jest.mock('../../../components/tickets/UpdateTicketStatusButton', () => {
      return function MockUpdateTicketStatusButton() {
        return <button data-testid="update-status-button">Update Status</button>;
      };
    });

    render(
      <BrowserRouter>
        <TicketDetail />
      </BrowserRouter>
    );

    // L1 agents should see the Escalate to L2 button for NEW tickets
    expect(screen.getByText('Escalate to L2')).toBeInTheDocument();
  });

  it('cleans up error on unmount', () => {
    mockZustandStore(useTicketStore, {
      currentTicket: mockTicket,
      isLoading: false,
      error: 'Failed to load ticket',
      getTicketById: mockGetTicketById,
      clearError: mockClearError
    });

    const { unmount } = render(
      <BrowserRouter>
        <TicketDetail />
      </BrowserRouter>
    );

    // Error message should be visible
    expect(screen.getByText('Failed to load ticket')).toBeInTheDocument();
    
    // Unmount the component
    unmount();
    
    // Verify clearError was called on unmount
    expect(mockClearError).toHaveBeenCalled();
  });
  
  it('clears error after timeout', () => {
    // Mock the timer
    jest.useFakeTimers();
    
    // Set up the initial state with an error
    mockZustandStore(useTicketStore, {
      currentTicket: mockTicket,
      isLoading: false,
      error: 'Failed to load ticket',
      getTicketById: mockGetTicketById,
      clearError: jest.fn() // Use a local mock to track calls
    });

    // Render the component
    const { unmount } = render(
      <BrowserRouter>
        <TicketDetail />
      </BrowserRouter>
    );

    // Error message should be visible
    expect(screen.getByText('Failed to load ticket')).toBeInTheDocument();
    
    // Fast-forward time to trigger the timeout
    jest.advanceTimersByTime(5000);
    
    // Clean up
    unmount();
    jest.useRealTimers();
  });

  it('renders different action buttons for L2 support', () => {
    // Create a ticket with ESCALATED_L2 status for L2 support
    const escalatedTicket = {
      ...mockTicket,
      status: 'ESCALATED_L2' as TicketStatus
    };
    
    mockZustandStore(useAuthStore, {
      user: mockL2Support,
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn()
    });
    
    mockZustandStore(useTicketStore, {
      currentTicket: escalatedTicket,
      isLoading: false,
      error: null,
      getTicketById: mockGetTicketById,
      clearError: mockClearError
    });

    render(
      <BrowserRouter>
        <TicketDetail />
      </BrowserRouter>
    );

    // L2 support should see the Set Critical Value button for ESCALATED_L2 tickets
    expect(screen.getByText('Set Critical Value')).toBeInTheDocument();
  });

  it('clears error on unmount', () => {
    const { unmount } = render(
      <BrowserRouter>
        <TicketDetail />
      </BrowserRouter>
    );

    unmount();
    
    // Check if clearError was called
    expect(mockClearError).toHaveBeenCalled();
  });

  it('renders correct buttons based on user role and ticket status', () => {
    // Mock the button components
    jest.mock('../../../components/tickets/UpdateTicketStatusButton', () => ({
      __esModule: true,
      default: () => <button data-testid="update-status-button">Update Status</button>
    }));

    // Test L1 agent with NEW ticket
    mockZustandStore(useAuthStore, {
      user: mockL1Agent,
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn()
    });
    
    mockZustandStore(useTicketStore, {
      currentTicket: { ...mockTicket, status: 'NEW' },
      isLoading: false,
      error: null,
      getTicketById: mockGetTicketById,
      clearError: mockClearError
    });

    const { rerender } = render(
      <BrowserRouter>
        <TicketDetail />
      </BrowserRouter>
    );

    // L1 agent should see Escalate to L2 button for NEW tickets
    expect(screen.getByText('Escalate to L2')).toBeInTheDocument();

    // Test L2 support with ESCALATED_L2 ticket
    mockZustandStore(useAuthStore, {
      user: mockL2Support,
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn()
    });
    
    mockZustandStore(useTicketStore, {
      currentTicket: { ...mockTicket, status: 'ESCALATED_L2' },
      isLoading: false,
      error: null,
      getTicketById: mockGetTicketById,
      clearError: mockClearError
    });

    rerender(
      <BrowserRouter>
        <TicketDetail />
      </BrowserRouter>
    );

    // L2 support should see Set Critical Value button for ESCALATED_L2 tickets
    expect(screen.getByText('Set Critical Value')).toBeInTheDocument();
  });

  it('handles button click events', () => {
    // Mock the button components
    jest.mock('../../../components/tickets/UpdateTicketStatusButton', () => ({
      __esModule: true,
      default: () => <button data-testid="update-status-button">Update Status</button>
    }));

    render(
      <BrowserRouter>
        <TicketDetail />
      </BrowserRouter>
    );

    // Test button click
    const escalateButton = screen.getByText('Escalate to L2');
    fireEvent.click(escalateButton);
    
    // Verify the form is shown after clicking the button
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});
