import { act, fireEvent, render, screen } from '@testing-library/react';
import ResolutionForm from '../../../components/tickets/ResolutionForm';

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
      resolveTicket: jest.fn(),
      isLoading: false
    }))
  };
});

import useTicketStore from '../../../store/ticketStore';

function mockZustandStore<T>(store: unknown, value: T): void {
  (store as unknown as jest.Mock).mockReturnValue(value);
}

describe('ResolutionForm', () => {
  const mockTicketId = '123';
  const mockSetShowResolutionForm = jest.fn();
  const mockResolveTicket = jest.fn();
  let resolvePromise: (value: boolean) => void;

  beforeEach(() => {
    // Create a new mock Promise before each test
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockResolveTicket.mockResolvedValue(mockPromise);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockZustandStore(useTicketStore, {
      resolveTicket: mockResolveTicket,
      isLoading: false
    });
  });

  describe('when rendering', () => {
    it('renders the resolution form with proper styling', () => {
      render(
        <ResolutionForm
          ticketId={mockTicketId}
          setShowResolutionForm={mockSetShowResolutionForm}
        />
      );

      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('text-emerald-700');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('font-medium');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('mb-4');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('flex');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('items-center');
    });

    it('renders resolution notes input field', () => {
      render(
        <ResolutionForm
          ticketId={mockTicketId}
          setShowResolutionForm={mockSetShowResolutionForm}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toBeRequired();
    });
  });

  describe('when handling resolution', () => {
    it('calls resolveTicket with correct parameters when form is submitted', async () => {
      render(
        <ResolutionForm
          ticketId={mockTicketId}
          setShowResolutionForm={mockSetShowResolutionForm}
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Resolution notes' } });

      const resolveButton = screen.getByRole('button', { name: /resolve/i });
      fireEvent.click(resolveButton);

      await act(async () => {
        resolvePromise(true);
      });

      expect(mockResolveTicket).toHaveBeenCalledWith(mockTicketId, 'Resolution notes');
      expect(mockSetShowResolutionForm).toHaveBeenCalledWith(false);
    });

    it('prevents submission when resolution notes are empty', async () => {
      render(
        <ResolutionForm
          ticketId={mockTicketId}
          setShowResolutionForm={mockSetShowResolutionForm}
        />
      );

      const resolveButton = screen.getByRole('button', { name: /resolve/i });
      fireEvent.click(resolveButton);

      await act(async () => {
        resolvePromise(true);
      });

      expect(mockResolveTicket).not.toHaveBeenCalled();
      expect(mockSetShowResolutionForm).not.toHaveBeenCalled();
    });

    it('shows loading state when resolving', async () => {
      mockZustandStore(useTicketStore, {
        resolveTicket: mockResolveTicket,
        isLoading: true
      });

      render(
        <ResolutionForm
          ticketId={mockTicketId}
          setShowResolutionForm={mockSetShowResolutionForm}
        />
      );

      const resolveButton = screen.getByRole('button', { name: /resolving/i });
      expect(resolveButton).toBeDisabled();
    });

    it('shows correct button states', () => {
      // Test with empty resolution notes
      render(
        <ResolutionForm
          ticketId={mockTicketId}
          setShowResolutionForm={mockSetShowResolutionForm}
        />
      );

      const resolveButton = screen.getByRole('button', { name: /resolve/i });
      expect(resolveButton).toBeDisabled();
      expect(resolveButton).toHaveClass('bg-emerald-600');
      expect(resolveButton).toHaveClass('text-white');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).not.toBeDisabled();
      expect(cancelButton).toHaveClass('text-emerald-600');
      expect(cancelButton).toHaveClass('hover:text-emerald-700');

      // Test with resolution notes
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Resolution notes' } });

      expect(resolveButton).not.toBeDisabled();
    });
  });
});
