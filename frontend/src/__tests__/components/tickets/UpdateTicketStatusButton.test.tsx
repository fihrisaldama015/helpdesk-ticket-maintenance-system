import { fireEvent, render, screen } from '@testing-library/react';
import UpdateTicketStatusButton from '../../../components/tickets/UpdateTicketStatusButton';

jest.mock('../../../store/authStore', () => {
  return {
    __esModule: true,
    default: jest.fn()
  };
});

jest.mock('../../../store/ticketStore', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      updateTicketStatus: jest.fn(),
      currentTicket: null,
      isLoading: false
    }))
  };
});

import useTicketStore from '../../../store/ticketStore';

function mockZustandStore<T>(store: unknown, value: T): void {
  (store as unknown as jest.Mock).mockReturnValue(value);
}

describe('UpdateTicketStatusButton', () => {
  const mockUpdateTicketStatus = jest.fn();
  let resolvePromise: (value: boolean) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    mockZustandStore(useTicketStore, {
      updateTicketStatus: mockUpdateTicketStatus,
      currentTicket: null,
      isLoading: false
    });
  });

  describe('when ticket status is NEW', () => {
    it('renders attending button with correct styling', () => {
      mockZustandStore(useTicketStore, {
        updateTicketStatus: mockUpdateTicketStatus,
        currentTicket: {
          id: '123',
          status: 'NEW'
        },
        isLoading: false
      });

      render(<UpdateTicketStatusButton />);

      const attendingButton = screen.getByRole('button', { name: /mark as attending/i });
      expect(attendingButton).toBeInTheDocument();
      expect(attendingButton).toHaveClass('bg-blue-600');
      expect(attendingButton).toHaveClass('hover:bg-blue-700');
      expect(attendingButton).toHaveClass('transition-all');
      expect(attendingButton).toHaveClass('hover:scale-105');
    });

    it('calls updateTicketStatus with correct parameters when attending button is clicked', async () => {
      mockZustandStore(useTicketStore, {
        updateTicketStatus: mockUpdateTicketStatus,
        currentTicket: {
          id: '123',
          status: 'NEW'
        },
        isLoading: false
      });

      render(<UpdateTicketStatusButton />);

      const attendingButton = screen.getByRole('button', { name: /mark as attending/i });
      fireEvent.click(attendingButton);

      expect(mockUpdateTicketStatus).toHaveBeenCalledWith('123', 'ATTENDING');
    });
  });

  describe('when ticket status is ATTENDING', () => {
    it('renders completed button with correct styling', () => {
      mockZustandStore(useTicketStore, {
        updateTicketStatus: mockUpdateTicketStatus,
        currentTicket: {
          id: '123',
          status: 'ATTENDING'
        },
        isLoading: false
      });

      render(<UpdateTicketStatusButton />);

      const completedButton = screen.getByRole('button', { name: /mark as completed/i });
      expect(completedButton).toBeInTheDocument();
      expect(completedButton).toHaveClass('bg-green-600');
      expect(completedButton).toHaveClass('hover:bg-green-700');
      expect(completedButton).toHaveClass('transition-all');
      expect(completedButton).toHaveClass('hover:scale-105');
    });

    it('calls updateTicketStatus with correct parameters when completed button is clicked', async () => {
      mockZustandStore(useTicketStore, {
        updateTicketStatus: mockUpdateTicketStatus,
        currentTicket: {
          id: '123',
          status: 'ATTENDING'
        },
        isLoading: false
      });

      render(<UpdateTicketStatusButton />);

      const completedButton = screen.getByRole('button', { name: /mark as completed/i });
      fireEvent.click(completedButton);

      expect(mockUpdateTicketStatus).toHaveBeenCalledWith('123', 'COMPLETED');
    });
  });

  describe('when ticket status is COMPLETED', () => {
    it('does not render any button', () => {
      mockZustandStore(useTicketStore, {
        updateTicketStatus: mockUpdateTicketStatus,
        currentTicket: {
          id: '123',
          status: 'COMPLETED'
        },
        isLoading: false
      });

      render(<UpdateTicketStatusButton />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
