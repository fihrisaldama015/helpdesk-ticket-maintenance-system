import { act, fireEvent, render, screen } from '@testing-library/react';
import EscalationForm from '../../../components/tickets/EscalationForm';

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
      escalateToL2: jest.fn(),
      escalateToL3: jest.fn(),
      currentTicket: {
        criticalValue: 'NONE'
      },
      isLoading: false
    }))
  };
});

import useTicketStore from '../../../store/ticketStore';

function mockZustandStore<T>(store: unknown, value: T): void {
  (store as unknown as jest.Mock).mockReturnValue(value);
}

describe('EscalationForm', () => {
  const mockTicketId = '123';
  const mockSetShowEscalationForm = jest.fn();
  const mockCanEscalateToL2 = jest.fn(() => true);
  const mockEscalateToL2 = jest.fn();
  const mockEscalateToL3 = jest.fn();

  let resolvePromise: (value: boolean) => void;

  beforeEach(() => {
    // Create a new mock Promise before each test
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockEscalateToL2.mockResolvedValue(mockPromise);
    mockEscalateToL3.mockResolvedValue(mockPromise);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockZustandStore(useTicketStore, {
      escalateToL2: mockEscalateToL2,
      escalateToL3: mockEscalateToL3,
      currentTicket: {
        criticalValue: 'NONE'
      },
      isLoading: false
    });
  });

  describe('when rendering', () => {
    it('renders the escalation form with proper styling', () => {
      render(
        <EscalationForm
          ticketId={mockTicketId}
          canEscalateToL2={mockCanEscalateToL2}
          setShowEscalationForm={mockSetShowEscalationForm}
        />
      );

      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('text-blue-700');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('font-medium');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('mb-3');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('flex');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('items-center');
    });

    it('renders escalation notes input field', () => {
      render(
        <EscalationForm
          ticketId={mockTicketId}
          canEscalateToL2={mockCanEscalateToL2}
          setShowEscalationForm={mockSetShowEscalationForm}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toBeRequired();
    });
  });

  describe('when handling escalation to L2', () => {
    it('calls escalateToL2 with correct parameters when form is submitted', async () => {
      mockCanEscalateToL2.mockReturnValue(true);

      render(
        <EscalationForm
          ticketId={mockTicketId}
          canEscalateToL2={mockCanEscalateToL2}
          setShowEscalationForm={mockSetShowEscalationForm}
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Escalation notes' } });

      const escalateButton = screen.getByRole('button', { name: /escalate/i });
      fireEvent.click(escalateButton);

      await act(async () => {
        resolvePromise(true);
      });

      expect(mockEscalateToL2).toHaveBeenCalledWith(mockTicketId, 'Escalation notes');
      expect(mockSetShowEscalationForm).toHaveBeenCalledWith(false);
    });

    it('prevents submission when escalation notes are empty', async () => {
      mockCanEscalateToL2.mockReturnValue(true);

      render(
        <EscalationForm
          ticketId={mockTicketId}
          canEscalateToL2={mockCanEscalateToL2}
          setShowEscalationForm={mockSetShowEscalationForm}
        />
      );

      const escalateButton = screen.getByRole('button', { name: /escalate/i });
      fireEvent.click(escalateButton);

      await act(async () => {
        resolvePromise(true);
      });

      expect(mockEscalateToL2).not.toHaveBeenCalled();
      expect(mockSetShowEscalationForm).not.toHaveBeenCalled();
    });

    it('calls escalateToL3 when user is L2 and form is submitted', async () => {
      mockCanEscalateToL2.mockReturnValue(false);

      render(
        <EscalationForm
          ticketId={mockTicketId}
          canEscalateToL2={mockCanEscalateToL2}
          setShowEscalationForm={mockSetShowEscalationForm}
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Escalation notes' } });

      const escalateButton = screen.getByRole('button', { name: /escalate/i });
      fireEvent.click(escalateButton);

      await act(async () => {
        resolvePromise(true);
      });

      expect(mockEscalateToL3).toHaveBeenCalledWith(
        mockTicketId,
        'Escalation notes',
        'NONE'
      );
      expect(mockSetShowEscalationForm).toHaveBeenCalledWith(false);
    });

    it('shows correct heading based on user role', () => {
      // Test for L1 user
      mockCanEscalateToL2.mockReturnValue(true);
      render(
        <EscalationForm
          ticketId={mockTicketId}
          canEscalateToL2={mockCanEscalateToL2}
          setShowEscalationForm={mockSetShowEscalationForm}
        />
      );
      expect(screen.getByText('Escalate to L2 Support')).toBeInTheDocument();

      // Clean up
      jest.clearAllMocks();

      // Test for L2 user
      mockCanEscalateToL2.mockReturnValue(false);
      render(
        <EscalationForm
          ticketId={mockTicketId}
          canEscalateToL2={mockCanEscalateToL2}
          setShowEscalationForm={mockSetShowEscalationForm}
        />
      );
      expect(screen.getByText('Escalate to L3 Support')).toBeInTheDocument();
    });

    it('prevents submission when escalation notes are empty', async () => {
      mockCanEscalateToL2.mockReturnValue(true);

      render(
        <EscalationForm
          ticketId={mockTicketId}
          canEscalateToL2={mockCanEscalateToL2}
          setShowEscalationForm={mockSetShowEscalationForm}
        />
      );

      const escalateButton = screen.getByRole('button', { name: /escalate/i });
      fireEvent.click(escalateButton);

      await act(async () => {
        resolvePromise(true);
      });

      expect(mockEscalateToL2).not.toHaveBeenCalled();
      expect(mockSetShowEscalationForm).not.toHaveBeenCalled();
    });
  });

  describe('when handling escalation', () => {
    it('calls escalateToL2 when user is L1 and form is submitted', async () => {
      mockCanEscalateToL2.mockReturnValue(true);

      render(
        <EscalationForm
          ticketId={mockTicketId}
          canEscalateToL2={mockCanEscalateToL2}
          setShowEscalationForm={mockSetShowEscalationForm}
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Escalation notes' } });

      const escalateButton = screen.getByRole('button', { name: /escalate/i });
      fireEvent.click(escalateButton);

      await act(async () => {
        resolvePromise(true);
      });

      expect(mockEscalateToL2).toHaveBeenCalledWith(mockTicketId, 'Escalation notes');
      expect(mockSetShowEscalationForm).toHaveBeenCalledWith(false);
    });

    it('calls escalateToL3 when user is L2 and form is submitted', async () => {
      mockCanEscalateToL2.mockReturnValue(false);

      render(
        <EscalationForm
          ticketId={mockTicketId}
          canEscalateToL2={mockCanEscalateToL2}
          setShowEscalationForm={mockSetShowEscalationForm}
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Escalation notes' } });

      const escalateButton = screen.getByRole('button', { name: /escalate/i });
      fireEvent.click(escalateButton);

      await act(async () => {
        resolvePromise(true);
      });

      expect(mockEscalateToL3).toHaveBeenCalledWith(
        mockTicketId,
        'Escalation notes',
        'NONE'
      );
      expect(mockSetShowEscalationForm).toHaveBeenCalledWith(false);
    });

    it('shows correct heading based on user role', () => {
      // Test for L1 user
      mockCanEscalateToL2.mockReturnValue(true);
      render(
        <EscalationForm
          ticketId={mockTicketId}
          canEscalateToL2={mockCanEscalateToL2}
          setShowEscalationForm={mockSetShowEscalationForm}
        />
      );
      expect(screen.getByText('Escalate to L2 Support')).toBeInTheDocument();

      // Clean up
      jest.clearAllMocks();

      // Test for L2 user
      mockCanEscalateToL2.mockReturnValue(false);
      render(
        <EscalationForm
          ticketId={mockTicketId}
          canEscalateToL2={mockCanEscalateToL2}
          setShowEscalationForm={mockSetShowEscalationForm}
        />
      );
      expect(screen.getByText('Escalate to L3 Support')).toBeInTheDocument();
    });
  });

});
