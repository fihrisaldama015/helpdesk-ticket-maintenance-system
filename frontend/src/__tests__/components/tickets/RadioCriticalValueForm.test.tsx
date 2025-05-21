import { act, fireEvent, render, screen } from '@testing-library/react';
import RadioCriticalValueForm from '../../../components/tickets/RadioCriticalValueForm';

// Mock the stores
jest.mock('../../../store/authStore', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('../../../store/ticketStore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    setCriticalValue: jest.fn(),
    isLoading: false
  }))
}));

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

      const heading = screen.getByRole('heading', { level: 4, name: /set critical value/i });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-blue-700');
      expect(heading).toHaveClass('font-medium');
      expect(heading).toHaveClass('mb-4');
      expect(heading).toHaveClass('flex');
      expect(heading).toHaveClass('items-center');
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
    // Test each critical value option (C1, C2, C3)
    const testCases = [
      { 
        value: 'C1', 
        label: 'C1 (Critical)', 
        testId: 'critical-c1-container',
        bgClass: 'bg-red-50', 
        borderClass: 'border-red-200',
        textClass: 'text-red-600',
        description: 'System down or significantly impacted',
        iconClass: 'text-red-600'
      },
      { 
        value: 'C2', 
        label: 'C2 (Major)', 
        testId: 'critical-c2-container',
        bgClass: 'bg-orange-50', 
        borderClass: 'border-orange-200',
        textClass: 'text-orange-600',
        description: 'Partial feature issue or limited impact',
        iconClass: 'text-orange-500'
      },
      { 
        value: 'C3', 
        label: 'C3 (Minor)', 
        testId: 'critical-c3-container',
        bgClass: 'bg-yellow-50', 
        borderClass: 'border-yellow-200',
        textClass: 'text-yellow-600',
        description: 'Minor problem or inquiry',
        iconClass: 'text-yellow-500'
      },
    ];

    testCases.forEach(({ value, label, testId, bgClass, borderClass, textClass, description, iconClass }) => {
      it(`selects ${value} when clicking on the ${label} option and updates UI accordingly`, () => {
        render(
          <RadioCriticalValueForm
            ticketId={mockTicketId}
            setShowCriticalValueForm={mockSetShowCriticalValueForm}
          />
        );

        // Find the clickable container directly by test ID
        const container = screen.getByTestId(testId);
        
        // Verify the container exists and has the correct classes
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass('flex', 'items-start', 'p-4', 'rounded-lg', 'border-2');
        
        // Click the container
        fireEvent.click(container);
        
        // Verify the container has the selected styles
        expect(container).toHaveClass(bgClass);
        expect(container).toHaveClass(borderClass);
        
        // Verify the label text is visible and has the correct color
        const labelElement = screen.getByText(label);
        expect(labelElement).toBeInTheDocument();
        expect(labelElement).toHaveClass(textClass);
        
        // Verify the description is visible
        expect(screen.getByText(description)).toBeInTheDocument();
        
        // Verify the container shows as selected (has the correct border and background classes)
        expect(container).toHaveClass(borderClass);
        expect(container).toHaveClass(bgClass);
        
        // Verify the icon has the correct color
        const iconElement = container.querySelector('svg');
        expect(iconElement).toHaveClass(iconClass);
      });
    });
  });

  describe('when handling form submission', () => {
    // Test form submission for each critical value option
    const testCases = [
      { value: 'C1', testId: 'critical-c1' },
      { value: 'C2', testId: 'critical-c2' },
      { value: 'C3', testId: 'critical-c3' },
    ];

    testCases.forEach(({ value, testId }) => {
      it(`submits the form with ${value} selected`, async () => {
        render(
          <RadioCriticalValueForm
            ticketId={mockTicketId}
            setShowCriticalValueForm={mockSetShowCriticalValueForm}
          />
        );

        // Select the option using the container test ID
        const optionContainer = screen.getByTestId(testId);
        fireEvent.click(optionContainer);

        // Submit the form
        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await act(async () => {
          resolvePromise(true);
        });

        // Verify the store was called with the correct parameters
        expect(mockSetCriticalValue).toHaveBeenCalledWith(mockTicketId, value);
        expect(mockSetShowCriticalValueForm).toHaveBeenCalledWith(false);
      });
    });

    it('does not close the form when setCriticalValue fails', async () => {
      mockSetCriticalValue.mockResolvedValueOnce(false);
      
      render(
        <RadioCriticalValueForm
          ticketId={mockTicketId}
          setShowCriticalValueForm={mockSetShowCriticalValueForm}
        />
      );

      const option = screen.getByTestId('critical-c2');
      fireEvent.click(option);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await act(async () => {
        resolvePromise(false);
      });

      expect(mockSetCriticalValue).toHaveBeenCalledWith(mockTicketId, 'C2');
      expect(mockSetShowCriticalValueForm).not.toHaveBeenCalled();
    });

    it('does not call setCriticalValue when ticketId is undefined', async () => {
      render(
        <RadioCriticalValueForm
          ticketId={undefined as any}
          setShowCriticalValueForm={mockSetShowCriticalValueForm}
        />
      );

      const option = screen.getByTestId('critical-c2');
      fireEvent.click(option);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(mockSetCriticalValue).not.toHaveBeenCalled();
    });

    it('closes the form when cancel button is clicked', () => {
      render(
        <RadioCriticalValueForm
          ticketId={mockTicketId}
          setShowCriticalValueForm={mockSetShowCriticalValueForm}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockSetShowCriticalValueForm).toHaveBeenCalledWith(false);
    });
    
    it('disables save button when no option is selected', () => {
      render(
        <RadioCriticalValueForm
          ticketId={mockTicketId}
          setShowCriticalValueForm={mockSetShowCriticalValueForm}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
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
      
      // Verify the loading spinner is shown
      const loader = saveButton.querySelector('[class*="animate-spin"]');
      expect(loader).toBeInTheDocument();
    });

    it('shows correct button states', () => {
      // Test with default NONE selection
      render(
        <RadioCriticalValueForm
          ticketId={mockTicketId}
          setShowCriticalValueForm={mockSetShowCriticalValueForm}
        />
      );

      // Save button should be disabled by default (no selection)
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
      expect(saveButton).toHaveClass('bg-indigo-600');
      expect(saveButton).toHaveClass('text-white');

      // Select an option and verify save button is enabled
      const option = screen.getByText('C1 (Critical)');
      fireEvent.click(option);
      expect(saveButton).not.toBeDisabled();

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
