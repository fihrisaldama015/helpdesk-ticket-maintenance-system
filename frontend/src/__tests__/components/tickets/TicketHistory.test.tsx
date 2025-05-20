import { render, screen } from '@testing-library/react';
import TicketHistory from '../../../components/tickets/TicketHistory';
import { Ticket, TicketAction, TicketStatus } from '../../../types';
import useTicketStore from '../../../store/ticketStore';

// Mock axiosConfig to avoid import.meta usage in tests
jest.mock('../../../api/axiosConfig', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the ticket store
jest.mock('../../../store/ticketStore');

const mockUseTicketStore = useTicketStore as jest.MockedFunction<typeof useTicketStore>;

// Mock the store implementation
const mockStore = {
  currentTicket: null,
  setCurrentTicket: jest.fn(),
  tickets: [],
  setTickets: jest.fn(),
  fetchTickets: jest.fn(),
  fetchTicketById: jest.fn(),
  createTicket: jest.fn(),
  updateTicket: jest.fn(),
  addActionToTicket: jest.fn(),
};

describe('TicketHistory', () => {
  // Mock ticket data
  const mockTicket: Ticket = {
    id: 'ticket-123',
    title: 'Test Ticket',
    description: 'Test description',
    status: 'OPEN' as TicketStatus,
    priority: 'MEDIUM',
    category: 'HARDWARE',
    criticalValue: 'C2',
    expectedCompletionDate: '2025-06-01T00:00:00.000Z',
    createdById: 'user-1',
    assignedToId: 'user-2',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    createdBy: {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      role: 'L1_AGENT',
      email: 'john.doe@example.com',
    },
    actions: []
  };

  const mockActions: TicketAction[] = [
    {
      id: 'action-1',
      ticketId: 'ticket-123',
      action: 'Status changed',
      newStatus: 'IN_PROGRESS' as TicketStatus,
      notes: 'Started working on the ticket',
      createdAt: '2023-01-01T10:00:00.000Z',
      userId: 'user-1',
      user: {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        role: 'L1_AGENT',
        email: 'john.doe@example.com',
      }
    },
    {
      id: 'action-2',
      ticketId: 'ticket-123',
      action: 'Added note',
      notes: 'Waiting for parts to arrive',
      createdAt: '2023-01-02T15:30:00.000Z',
      userId: 'user-2',
      user: {
        id: 'user-2',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'L2_SUPPORT',
        email: 'jane.smith@example.com',
      }
    }
  ];

  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
  });

  it('renders the ticket history title', () => {
    // Mock the store to return a ticket with no actions
    mockUseTicketStore.mockReturnValue({
      ...mockStore,
      currentTicket: { ...mockTicket, actions: [] }
    });

    render(<TicketHistory />);

    // Check if the title is rendered
    const title = screen.getByText('Ticket History');
    expect(title).toBeInTheDocument();
  });

  it('displays a message when there are no actions', () => {
    // Mock the store to return a ticket with no actions
    mockUseTicketStore.mockReturnValue({
      ...mockStore,
      currentTicket: { ...mockTicket, actions: [] }
    });

    render(<TicketHistory />);

    // Check if the no actions message is displayed
    const message = screen.getByText('No actions have been recorded yet.');
    expect(message).toBeInTheDocument();
  });

  it('displays the list of actions when they exist', () => {
    // Mock the store to return a ticket with actions
    mockUseTicketStore.mockReturnValue({
      ...mockStore,
      currentTicket: { ...mockTicket, actions: mockActions }
    });

    render(<TicketHistory />);

    // Check if all actions are rendered
    const actionItems = screen.getAllByRole('listitem');
    expect(actionItems).toHaveLength(mockActions.length);

    // Check if action details are displayed
    mockActions.forEach(action => {
      const userFullName = `${action.user?.firstName} ${action.user?.lastName}`;
      expect(screen.getByText(userFullName)).toBeInTheDocument();
      expect(screen.getByText(action.notes)).toBeInTheDocument();
      
      if (action.newStatus) {
        expect(screen.getByText(action.action)).toBeInTheDocument();
      }
    });
  });

  it('displays user avatars with initials', () => {
    // Mock the store to return a ticket with actions
    mockUseTicketStore.mockReturnValue({
      ...mockStore,
      currentTicket: { ...mockTicket, actions: mockActions }
    });

    render(<TicketHistory />);

    // Check that each user's name and initial is present in the document
    mockActions.forEach(action => {
      const fullName = `${action.user?.firstName} ${action.user?.lastName}`;
      const initial = action.user?.firstName.charAt(0).toUpperCase();
      
      // Check that the full name is present
      const nameElement = screen.getByText(fullName);
      expect(nameElement).toBeInTheDocument();
      
      // Check that the initial is present (in the avatar)
      const allText = document.body.textContent || '';
      expect(allText).toContain(initial);
    });
  });

  it('displays the correct timestamp for each action', () => {
    // Mock the store to return a ticket with actions
    mockUseTicketStore.mockReturnValue({
      ...mockStore,
      currentTicket: { ...mockTicket, actions: mockActions }
    });

    render(<TicketHistory />);

    // Get all timestamp elements
    const timeElements = screen.getAllByText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{1,2}:\d{2} [AP]M$/);
    
    // We should have the same number of timestamps as actions
    expect(timeElements).toHaveLength(mockActions.length);
    
    // Check that each timestamp is in the document
    timeElements.forEach(element => {
      expect(element).toBeInTheDocument();
    });
  });
});
