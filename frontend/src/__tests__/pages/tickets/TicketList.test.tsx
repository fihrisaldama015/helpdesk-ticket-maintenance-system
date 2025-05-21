import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import TicketList from '../../../pages/tickets/TicketList';
import useAuthStore from '../../../store/authStore';
import useTicketStore from '../../../store/ticketStore';
import { Ticket, TicketCategory, TicketPriority, TicketStatus, User } from '../../../types';

// Mock the stores
jest.mock('../../../store/authStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../store/ticketStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Helper function to mock Zustand store
function mockZustandStore<T>(store: unknown, value: T): void {
  (store as unknown as jest.Mock).mockReturnValue(value);
}

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to} data-testid={`link-to-${to}`}>{children}</a>
  ),
}));

// Mock implementations
const mockGetTickets = jest.fn();
const mockGetMyTickets = jest.fn();
const mockSetFilters = jest.fn();

// Mock data
const mockTickets: Ticket[] = [
  {
    id: '1234567890abcdef',
    title: 'Test Ticket 1',
    status: 'NEW' as TicketStatus,
    priority: 'HIGH' as TicketPriority,
    category: 'SOFTWARE' as TicketCategory,
    criticalValue: 'NONE',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    expectedCompletionDate: '2023-01-10T00:00:00.000Z',
    description: 'Test description',
    createdById: '1',
    createdBy: {
      id: '1',
      email: 'agent@example.com',
      firstName: 'Agent',
      lastName: 'User',
      role: 'L1_AGENT'
    },
    assignedToId: '1',
    assignedTo: {
      id: '1',
      email: 'agent@example.com',
      firstName: 'Agent',
      lastName: 'User',
      role: 'L1_AGENT'
    },
    actions: [],
  },
  {
    id: '2234567890abcdef',
    title: 'Test Ticket 2',
    status: 'ATTENDING' as TicketStatus,
    priority: 'MEDIUM' as TicketPriority,
    category: 'HARDWARE' as TicketCategory,
    criticalValue: 'NONE',
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
    expectedCompletionDate: '2023-01-12T00:00:00.000Z',
    description: 'Another test description',
    createdById: '2',
    createdBy: {
      id: '2',
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Two',
      role: 'L1_AGENT'

    },
    assignedToId: '1',
    assignedTo: {
      id: '1',
      email: 'agent@example.com',
      firstName: 'Agent',
      lastName: 'User',
      role: 'L1_AGENT'
    },
    actions: [],
  }
];

describe('TicketList', () => {
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
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockZustandStore(useAuthStore, {
      user: mockL1Agent,
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn()
    });
    
    mockZustandStore(useTicketStore, {
      tickets: mockTickets,
      totalTickets: 1,
      isLoading: false,
      getTickets: mockGetTickets,
      getMyTickets: mockGetMyTickets,
      setFilters: mockSetFilters,
      filters: {}
    });
  });

  it('renders the ticket list for L1 agent', () => {
    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    // Check if the correct title is displayed
    expect(screen.getByText('My Tickets')).toBeInTheDocument();
    
    // Check if getMyTickets was called
    expect(mockGetMyTickets).toHaveBeenCalled();
  });

  it('shows loading state when tickets are loading', () => {
    mockZustandStore(useTicketStore, {
      tickets: [],
      totalTickets: 0,
      isLoading: true,
      getTickets: mockGetTickets,
      getMyTickets: mockGetMyTickets,
      setFilters: mockSetFilters,
      filters: {}
    });

    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    // Check if loading spinner is displayed
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('shows empty state when no tickets are found', () => {
    mockZustandStore(useTicketStore, {
      tickets: [],
      totalTickets: 0,
      isLoading: false,
      getTickets: mockGetTickets,
      getMyTickets: mockGetMyTickets,
      setFilters: mockSetFilters,
      filters: {}
    });

    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    // Check if empty state message is displayed
    expect(screen.getByText('No tickets found')).toBeInTheDocument();
  });

  it('renders the ticket list for L2 support', () => {
    mockZustandStore(useAuthStore, {
      user: mockL2Support,
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn()
    });

    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    // Check if the correct title is displayed
    expect(screen.getByText('All Tickets')).toBeInTheDocument();
    
    // Check if getTickets was called for L2 support
    expect(mockGetTickets).toHaveBeenCalled();
  });

  it('toggles filter visibility when filter button is clicked', async () => {
    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    // Initially filters should be hidden
    const filterButton = screen.getByText('Show Filters');
    expect(filterButton).toBeInTheDocument();
    
    // Click to show filters
    await userEvent.click(filterButton);
    expect(screen.getByText('Hide Filters')).toBeInTheDocument();
    
    // Click to hide filters
    await userEvent.click(screen.getByText('Hide Filters'));
    expect(screen.getByText('Show Filters')).toBeInTheDocument();
  });

  it('applies status filter correctly', async () => {
    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    // Show filters
    await userEvent.click(screen.getByText('Show Filters'));
    
    // Check and uncheck status filter
    const newStatusCheckbox = screen.getByLabelText('New');
    await userEvent.click(newStatusCheckbox);
    
    // Click apply button
    await userEvent.click(screen.getByText('Apply Filters'));
    
    // Check if getMyTickets was called with the correct filters
    expect(mockGetMyTickets).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ['NEW']
      })
    );
  });

  it('applies priority filter correctly', async () => {
    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    // Show filters
    await userEvent.click(screen.getByText('Show Filters'));
    
    // Check priority filter
    const highPriorityCheckbox = screen.getByLabelText('High');
    await userEvent.click(highPriorityCheckbox);
    
    // Click apply button
    await userEvent.click(screen.getByText('Apply Filters'));
    
    // Check if getMyTickets was called with the correct filters
    expect(mockGetMyTickets).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: ['HIGH']
      })
    );
  });

  it('applies category filter correctly', async () => {
    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    // Show filters
    await userEvent.click(screen.getByText('Show Filters'));
    
    // Check category filter
    const softwareCategoryCheckbox = screen.getByLabelText('Software');
    await userEvent.click(softwareCategoryCheckbox);
    
    // Click apply button
    await userEvent.click(screen.getByText('Apply Filters'));
    
    // Check if getMyTickets was called with the correct filters
    expect(mockGetMyTickets).toHaveBeenCalledWith(
      expect.objectContaining({
        category: ['SOFTWARE']
      })
    );
  });

  it('resets filters correctly', async () => {
    // Set initial filters
    mockZustandStore(useTicketStore, {
      tickets: mockTickets,
      totalTickets: 2,
      isLoading: false,
      getTickets: mockGetTickets,
      getMyTickets: mockGetMyTickets,
      setFilters: mockSetFilters,
      filters: { status: ['NEW'], priority: ['HIGH'] }
    });

    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    // Show filters
    await userEvent.click(screen.getByText('Show Filters'));
    
    // Click reset button
    await userEvent.click(screen.getByText('Reset'));
    
    // Check if getMyTickets was called with empty filters
    expect(mockGetMyTickets).toHaveBeenCalledWith({});
  });

  it('handles pagination correctly', async () => {
    // Mock multiple pages of tickets
    mockZustandStore(useTicketStore, {
      tickets: mockTickets,
      totalTickets: 25, // More than one page
      isLoading: false,
      getTickets: mockGetTickets,
      getMyTickets: mockGetMyTickets,
      setFilters: mockSetFilters,
      filters: { page: 1, limit: 10 }
    });

    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    // Click next page
    const nextPageButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextPageButton);
    
    // Check if getMyTickets was called with the next page
    expect(mockGetMyTickets).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2
      })
    );
  });

  it('displays the correct title based on user role', () => {
    // Test for L1 Agent
    mockZustandStore(useAuthStore, {
      user: mockL1Agent,
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn()
    });

    const { rerender } = render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );
    
    expect(screen.getByText('My Tickets')).toBeInTheDocument();
    
    // Test for L2 Support
    mockZustandStore(useAuthStore, {
      user: mockL2Support,
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn()
    });
    
    rerender(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );
    
    expect(screen.getByText('All Tickets')).toBeInTheDocument();
  });

  it('shows create ticket button only for L1 agents', () => {
    // Test for L1 Agent
    mockZustandStore(useAuthStore, {
      user: mockL1Agent,
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn()
    });

    const { rerender } = render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('link', { name: /new ticket/i })).toBeInTheDocument();
    
    // Test for L2 Support
    mockZustandStore(useAuthStore, {
      user: mockL2Support,
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn()
    });
    
    rerender(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );
    
    expect(screen.queryByRole('link', { name: /new ticket/i })).not.toBeInTheDocument();
  });

  it('applies search filter correctly', async () => {
    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );
    
    // Show filters if they're not already visible
    const showFiltersButton = screen.getByRole('button', { name: /show filters/i });
    if (showFiltersButton) {
      await userEvent.click(showFiltersButton);
    }
    
    // Find search input and type a query
    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await userEvent.type(searchInput, 'test search');
    
    // Click the Apply Filters button
    const applyButton = screen.getByRole('button', { name: /apply filters/i });
    await userEvent.click(applyButton);
    
    // Check if either getMyTickets or getTickets was called with the search query
    const checkSearchParam = (calls: any[][]) => {
      return calls.some(call => {
        const [params] = call;
        return params?.search === 'test search';
      });
    };
    
    const myTicketsCalled = checkSearchParam(mockGetMyTickets.mock.calls);
    const allTicketsCalled = checkSearchParam(mockGetTickets.mock.calls);
    
    const wasCalledWithSearch = myTicketsCalled || allTicketsCalled;
    
    expect(wasCalledWithSearch).toBe(true);
  });

  it('displays ticket details correctly', () => {
    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );
    
    // Check if ticket details are displayed
    const ticketRow = screen.getByText('Test Ticket 1').closest('tr');
    expect(ticketRow).toBeInTheDocument();
    
    // Use non-null assertion since we've confirmed ticketRow exists
    const ticketRowElement = ticketRow!;
    
    // Check for category
    expect(within(ticketRowElement).getByText('SOFTWARE')).toBeInTheDocument();
    
    // Find the priority badge in the ticket row
    const priorityBadge = within(ticketRowElement).getByTestId('status-badge');
    expect(priorityBadge).toBeInTheDocument();
    expect(priorityBadge).toHaveAttribute('data-priority', 'HIGH');
    expect(priorityBadge).toHaveTextContent('High Priority');
    
    // The agent's name is not displayed in the ticket row in the actual component
  });

  it('navigates to ticket detail when clicking on a ticket', async () => {
    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );
    
    // Click on the first ticket
    const ticketLink = screen.getByText('Test Ticket 1').closest('a');
    expect(ticketLink).toHaveAttribute('href', '/tickets/detail/1234567890abcdef');
  });

  it('shows loading spinner when loading', () => {
    mockZustandStore(useTicketStore, {
      tickets: [],
      totalTickets: 0,
      isLoading: true,
      getTickets: mockGetTickets,
      getMyTickets: mockGetMyTickets,
      setFilters: mockSetFilters,
      filters: {}
    });

    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    // Check if loading spinner is displayed
    const loadingSpinner = screen.getByTestId('loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('shows empty state when no tickets are found', () => {
    mockZustandStore(useTicketStore, {
      tickets: [],
      totalTickets: 0,
      isLoading: false,
      getTickets: mockGetTickets,
      getMyTickets: mockGetMyTickets,
      setFilters: mockSetFilters,
      filters: {}
    });

    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    // Check if empty state message is displayed
    expect(screen.getByText('No tickets found')).toBeInTheDocument();
  });

  it('calls getTickets for L2 support', () => {
    mockZustandStore(useAuthStore, {
      user: mockL2Support,
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn()
    });

    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    expect(mockGetTickets).toHaveBeenCalled();
    expect(mockGetMyTickets).not.toHaveBeenCalled();
  });

  it('calls getMyTickets for L1 agent', () => {
    render(
      <BrowserRouter>
        <TicketList />
      </BrowserRouter>
    );

    expect(mockGetMyTickets).toHaveBeenCalled();
    expect(mockGetTickets).not.toHaveBeenCalled();
  });
});
