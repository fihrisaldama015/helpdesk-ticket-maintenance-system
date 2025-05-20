import { act, fireEvent, render, screen } from '@testing-library/react';
import RadioCriticalValueForm from '../../../components/tickets/RadioCriticalValueForm';

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
      setCriticalValue: jest.fn(),
      isLoading: false
    }))
  };
});

import useTicketStore from '../../../store/ticketStore';

function mockZustandStore<T>(store: unknown, value: T): void {
  (store as unknown as jest.Mock).mockReturnValue(value);
}

describe('RadioCriticalValueForm', () => {
  const mockTicketId = '123';
  const mockSetShowCriticalValueForm = jest.fn();
  const mockSetCriticalValue = jest.fn();
  let resolvePromise: (value: boolean) => void;

  beforeEach(() => {
    // Create a new mock Promise before each test
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockSetCriticalValue.mockResolvedValue(mockPromise);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockZustandStore(useTicketStore, {
      setCriticalValue: mockSetCriticalValue,
      isLoading: false
    });
  });

  describe('when rendering', () => {
    it('renders the critical value form with proper styling', () => {
      render(
        <RadioCriticalValueForm
          ticketId={mockTicketId}
          setShowCriticalValueForm={mockSetShowCriticalValueForm}
        />
      );

      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('text-blue-700');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('font-medium');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('mb-4');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('flex');
      expect(screen.getByRole('heading', { level: 4 })).toHaveClass('items-center');
    });

    it('renders critical value radio group', () => {
      render(
        <RadioCriticalValueForm
          ticketId={mockTicketId}
          setShowCriticalValueForm={mockSetShowCriticalValueForm}
        />
      );

      expect(screen.getByText('Critical Value')).toBeInTheDocument();
      expect(screen.getByTestId('critical-c1')).toBeInTheDocument();
      expect(screen.getByTestId('critical-c2')).toBeInTheDocument();
      expect(screen.getByTestId('critical-c3')).toBeInTheDocument();
    });
  });

  describe('when handling critical value selection', () => {
    it('calls setCriticalValue with correct parameters when form is submitted', async () => {
      render(
        <RadioCriticalValueForm
          ticketId={mockTicketId}
          setShowCriticalValueForm={mockSetShowCriticalValueForm}
        />
      );

      const mediumRadio = screen.getByTestId('critical-c2');
      fireEvent.click(mediumRadio);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await act(async () => {
        resolvePromise(true);
      });

      expect(mockSetCriticalValue).toHaveBeenCalledWith(mockTicketId, 'C2');
      expect(mockSetShowCriticalValueForm).toHaveBeenCalledWith(false);
    });

    it('shows loading state when saving', async () => {
      mockZustandStore(useTicketStore, {
        setCriticalValue: mockSetCriticalValue,
        isLoading: true
      });

      render(
        <RadioCriticalValueForm
          ticketId={mockTicketId}
          setShowCriticalValueForm={mockSetShowCriticalValueForm}
        />
      );

      const saveButton = screen.getByRole('button', { name: /saving/i });
      expect(saveButton).toBeDisabled();
    });

    it('shows correct button states', () => {
      // Test with default NONE selection
      render(
        <RadioCriticalValueForm
          ticketId={mockTicketId}
          setShowCriticalValueForm={mockSetShowCriticalValueForm}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
      expect(saveButton).toHaveClass('bg-indigo-600');
      expect(saveButton).toHaveClass('text-white');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).not.toBeDisabled();
      expect(cancelButton).toHaveClass('text-indigo-600');
      expect(cancelButton).toHaveClass('hover:text-indigo-700');

      // Test with non-NONE selection
      const mediumRadio = screen.getByTestId('critical-c2');
      fireEvent.click(mediumRadio);

      expect(saveButton).not.toBeDisabled();
    });
  });
});
