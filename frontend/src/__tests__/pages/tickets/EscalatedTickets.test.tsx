import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EscalatedTickets from '../../../pages/tickets/EscalatedTickets';
import useAuthStore from '../../../store/authStore';
import useTicketStore from '../../../store/ticketStore';
import { CriticalValue, TicketCategory } from '../../../types';

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

const mockTickets = [
  {
    id: 'ticket-123',
    title: 'Test Ticket 1',
    status: 'OPEN',
    criticalValue: 'C1' as CriticalValue,
    priority: 'HIGH',
    category: 'SOFTWARE' as TicketCategory,
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'ticket-124',
    title: 'Test Ticket 2',
    status: 'IN_PROGRESS',
    criticalValue: 'C2' as CriticalValue,
    priority: 'MEDIUM',
    category: 'HARDWARE' as TicketCategory,
    createdAt: '2023-01-02T00:00:00.000Z'
  }
];

describe('EscalatedTickets', () => {
  const mockGetEscalatedTickets = jest.fn();
  const mockSetFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockZustandStore(useAuthStore, {
      user: { role: 'L2_SUPPORT' },
      isAuthenticated: true,
      isLoading: false
    });
    
    mockZustandStore(useTicketStore, {
      tickets: [],
      totalTickets: 0,
      isLoading: false,
      getEscalatedTickets: mockGetEscalatedTickets,
      setFilters: mockSetFilters,
      filters: {}
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <EscalatedTickets />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    // Find the heading by its test ID
    const heading = screen.getByTestId('escalated-tickets-heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Escalated Tickets');
    expect(heading).toHaveClass('text-xl', 'leading-6', 'font-bold', 'text-transparent');
  });

  it('shows loading state when loading', () => {
    mockZustandStore(useTicketStore, {
      ...useTicketStore(),
      isLoading: true
    });
    
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays no tickets message when there are no tickets', () => {
    renderComponent();
    expect(screen.getByText('No escalated tickets found')).toBeInTheDocument();
    expect(screen.getByText(/There are currently no tickets escalated to L2 support/)).toBeInTheDocument();
  });

  it('displays tickets when they exist', () => {
    mockZustandStore(useTicketStore, {
      ...useTicketStore(),
      tickets: mockTickets,
      totalTickets: 2
    });
    
    renderComponent();
    
    expect(screen.getByText('Test Ticket 1')).toBeInTheDocument();
    expect(screen.getByText('Test Ticket 2')).toBeInTheDocument();
    expect(screen.getByText('C1')).toBeInTheDocument();
    expect(screen.getByText('C2')).toBeInTheDocument();
  });

  it('applies filters when filter button is clicked', async () => {
    renderComponent();
    
    // Show filters
    fireEvent.click(screen.getByText('Show Filters'));
    
    // Select critical value C1
    const c1Checkbox = screen.getByLabelText('C1');
    fireEvent.click(c1Checkbox);
    
    // Click apply filters
    fireEvent.click(screen.getByText('Apply Filters'));
    
    await waitFor(() => {
      expect(mockSetFilters).toHaveBeenCalledWith(expect.objectContaining({
        criticalValue: ['C1'],
        page: 1
      }));
      expect(mockGetEscalatedTickets).toHaveBeenCalledWith(expect.objectContaining({
        criticalValue: ['C1'],
        page: 1
      }));
    });
  });

  it('resets filters when reset button is clicked', async () => {
    renderComponent();
    
    // Show filters
    fireEvent.click(screen.getByText('Show Filters'));
    
    // Select critical value C1
    const c1Checkbox = screen.getByLabelText('C1');
    fireEvent.click(c1Checkbox);
    
    // Click reset filters
    fireEvent.click(screen.getByText('Reset'));
    
    await waitFor(() => {
      expect(mockSetFilters).toHaveBeenCalledWith({});
      expect(mockGetEscalatedTickets).toHaveBeenCalledWith({});
    });
  });

  it('handles pagination', () => {
    mockZustandStore(useTicketStore, {
      ...useTicketStore(),
      tickets: mockTickets,
      totalTickets: 15,
      filters: { page: 1 }
    });
    
    renderComponent();
    
    // Click next page
    fireEvent.click(screen.getByText('Next →'));
    
    expect(mockSetFilters).toHaveBeenCalledWith({
      page: 2
    });
    
    // Click previous page
    fireEvent.click(screen.getByText('← Prev'));
    
    expect(mockSetFilters).toHaveBeenCalledWith({
      page: 1
    });
  });

  it('shows different message for L3 support', () => {
    mockZustandStore(useAuthStore, {
      user: { role: 'L3_SUPPORT' },
      isAuthenticated: true,
      isLoading: false
    });
    
    renderComponent();
    
    expect(screen.getByText(/critical tickets \(C1\/C2\) escalated to L3 support/)).toBeInTheDocument();
  });
});
