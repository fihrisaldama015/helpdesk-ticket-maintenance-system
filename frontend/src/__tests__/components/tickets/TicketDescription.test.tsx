import { render, screen } from '@testing-library/react';
import TicketDescription from '../../../components/tickets/TicketDescription';
import { Ticket, TicketCategory, TicketPriority, TicketStatus, CriticalValue } from '../../../types';
import StatusBadge from '../../../components/StatusBadge';
import { cn } from '../../../lib/utils';

// Define type for StatusBadge props
type StatusBadgeProps = {
  status?: TicketStatus;
  priority?: TicketPriority;
  criticalValue?: CriticalValue;
  className?: string;
  dataTestId?: string;
};

// Define type for StatusBadge classes
interface StatusClasses {
  [key: string]: string;
}

jest.mock('../../../components/StatusBadge', () => ({
  __esModule: true,
  default: jest.fn(({ dataTestId, status, priority, criticalValue, className = '' }: StatusBadgeProps) => {
    const baseClassName = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

    if (status) {
      const statusClasses = {
        NEW: 'bg-blue-100 text-blue-800',
        ATTENDING: 'bg-yellow-100 text-yellow-800',
        COMPLETED: 'bg-green-100 text-green-800',
        ESCALATED_L2: 'bg-orange-100 text-orange-800',
        ESCALATED_L3: 'bg-red-100 text-red-800',
        RESOLVED: 'bg-purple-100 text-purple-800'
      } as const;

      const statusLabels = {
        NEW: 'New',
        ATTENDING: 'Attending',
        COMPLETED: 'Completed',
        ESCALATED_L2: 'Escalated L2',
        ESCALATED_L3: 'Escalated L3',
        RESOLVED: 'Resolved'
      } as const;

      return (
        <span className={cn(baseClassName, statusClasses[status as keyof typeof statusClasses], className)} data-testid={dataTestId}>
          {statusLabels[status as keyof typeof statusLabels]}
        </span>
      );
    }

    if (priority) {
      const priorityClasses = {
        LOW: 'bg-gray-100 text-gray-800',
        MEDIUM: 'bg-yellow-100 text-yellow-800',
        HIGH: 'bg-red-100 text-red-800'
      } as const;

      const priorityLabels = {
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High'
      } as const;

      return (
        <span className={cn(baseClassName, priorityClasses[priority as keyof typeof priorityClasses], className)} data-testid={dataTestId}>
          {priorityLabels[priority as keyof typeof priorityLabels]}
        </span>
      );
    }

    if (criticalValue) {
      const criticalValueClasses = {
        NONE: 'bg-gray-100 text-gray-800',
        LOW: 'bg-yellow-100 text-yellow-800',
        MEDIUM: 'bg-orange-100 text-orange-800',
        HIGH: 'bg-red-100 text-red-800'
      } as const;

      const criticalValueLabels = {
        NONE: 'None',
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High'
      } as const;

      return (
        <span className={cn(baseClassName, criticalValueClasses[criticalValue as keyof typeof criticalValueClasses], className)} data-testid={dataTestId}>
          {criticalValueLabels[criticalValue as keyof typeof criticalValueLabels]}
        </span>
      );
    }

    return null;
  })
}));

// Export the mock for use in tests
export { StatusBadge as mockStatusBadge };

// Re-import the mock function
const mockStatusBadge = StatusBadge as jest.MockedFunction<typeof StatusBadge>;

// Reset the mock before each test
beforeEach(() => {
  mockStatusBadge.mockClear();
});

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(() => jest.fn())
}));

describe('TicketDescription', () => {
  const mockTicket: Ticket = {
    id: '123',
    title: 'Test Ticket',
    description: 'Test description',
    category: 'SOFTWARE' as TicketCategory,
    priority: 'LOW' as TicketPriority,
    status: 'NEW' as TicketStatus,
    criticalValue: 'C1' as CriticalValue,
    expectedCompletionDate: '2024-01-15',
    createdById: '1',
    assignedToId: '2',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    actions: []
  };

  describe('when rendering ticket information', () => {
    it('displays ticket title with proper styling', () => {
      render(<TicketDescription currentTicket={mockTicket} userRole="L1_AGENT" />);

      const title = screen.getByText(mockTicket.title);
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('text-xl');
      expect(title).toHaveClass('font-medium');
      expect(title).toHaveClass('text-gray-900');
      expect(title).toHaveClass('mb-1');
      expect(title).toHaveClass('transition-all');
      expect(title).toHaveClass('duration-300');
      expect(title).toHaveClass('hover:text-blue-700');
    });

    it('renders status badges correctly', () => {
      render(<TicketDescription currentTicket={mockTicket} userRole="L1_AGENT" />);

      expect(StatusBadge).toHaveBeenCalledTimes(3);
      expect(StatusBadge).toHaveBeenCalledWith({
        status: mockTicket.status,
        'data-testid': 'status-badge'
      }, {});

      expect(StatusBadge).toHaveBeenCalledWith({
        priority: mockTicket.priority,
        'data-testid': 'priority-badge'
      }, {});

      expect(StatusBadge).toHaveBeenCalledWith({
        criticalValue: mockTicket.criticalValue,
        'data-testid': 'critical-value-badge'
      }, {});
    });

    it('renders ticket icon with proper styling', () => {
      render(<TicketDescription currentTicket={mockTicket} userRole="L1_AGENT" />);

      const iconContainer = screen.getByTestId('ticket-icon-container');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('mr-3');
      expect(iconContainer).toHaveClass('bg-blue-100');
      expect(iconContainer).toHaveClass('p-2');
      expect(iconContainer).toHaveClass('rounded-full');

      const icon = screen.getByTestId('ticket-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-6');
      expect(icon).toHaveClass('w-6');
      expect(icon).toHaveClass('text-blue-600');
    });

    it('renders back button with proper styling for L1_AGENT', () => {
      render(<TicketDescription currentTicket={mockTicket} userRole="L1_AGENT" />);

      const backButton = screen.getByRole('button', { name: /back to tickets/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveClass('hover:bg-blue-50');
      expect(backButton).toHaveClass('transition-colors');
      expect(backButton).toHaveClass('duration-300');
      expect(backButton).toHaveClass('flex');
      expect(backButton).toHaveClass('items-center');
      expect(backButton).toHaveClass('gap-2');
      expect(backButton).toHaveClass('border-blue-200');
    });

    it('renders back button with proper styling for non-L1_AGENT', () => {
      render(<TicketDescription currentTicket={mockTicket} userRole="L2_AGENT" />);

      const backButton = screen.getByRole('button', { name: /back to escalated tickets/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveClass('hover:bg-blue-50');
      expect(backButton).toHaveClass('transition-colors');
      expect(backButton).toHaveClass('duration-300');
      expect(backButton).toHaveClass('flex');
      expect(backButton).toHaveClass('items-center');
      expect(backButton).toHaveClass('gap-2');
      expect(backButton).toHaveClass('border-blue-200');
    });
  });

  describe('when ticket has no critical value', () => {
    it('renders status, priority, and critical value badges when critical value is NONE', () => {
      const ticketWithoutCriticalValue = { ...mockTicket, criticalValue: 'NONE' as CriticalValue };
      render(<TicketDescription currentTicket={ticketWithoutCriticalValue} userRole="L1_AGENT" />);

      // Verify StatusBadge is called with correct types including data-testid
      expect(mockStatusBadge).toHaveBeenCalledWith({
        status: ticketWithoutCriticalValue.status,
        'data-testid': 'status-badge'
      }, {});

      expect(mockStatusBadge).toHaveBeenCalledWith({
        priority: ticketWithoutCriticalValue.priority,
        'data-testid': 'priority-badge'
      }, {});

      // Verify critical value badge is rendered with correct styling
      expect(mockStatusBadge).toHaveBeenCalledTimes(3);
      expect(mockStatusBadge).toHaveBeenCalledWith({
        criticalValue: 'NONE',
        'data-testid': 'critical-value-badge'
      }, {});
    });
  });

  describe('when ticket has no due date', () => {
    it('displays dash when expected completion date is empty', () => {
      const ticketWithoutDueDate = { ...mockTicket, expectedCompletionDate: '' };
      render(<TicketDescription currentTicket={ticketWithoutDueDate} userRole="L1_AGENT" />);

      const expectedCompletionSection = screen.getByTestId('expected-completion-section');
      expect(expectedCompletionSection).toHaveTextContent('-');
    });
  });
});
