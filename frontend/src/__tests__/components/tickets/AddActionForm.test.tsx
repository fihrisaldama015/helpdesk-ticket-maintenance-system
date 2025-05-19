import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AddActionForm from '../../../components/tickets/AddActionForm';


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
      addTicketAction: jest.fn(),
      isLoading: false
    }))
  };
});

import useAuthStore from '../../../store/authStore';
import useTicketStore from '../../../store/ticketStore';

function mockZustandStore<T>(store: unknown, value: T): void {
  (store as unknown as jest.Mock).mockReturnValue(value);
}

describe('AddActionForm', () => {
  const mockTicketId = '123';
  const mockSetShowActions = jest.fn();
  const mockAddTicketAction = jest.fn();

  let resolvePromise: (value: boolean) => void;

  beforeEach(() => {
    // Create a new mock Promise before each test
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockAddTicketAction.mockResolvedValue(mockPromise);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockZustandStore(useTicketStore, {
      addTicketAction: mockAddTicketAction,
      isLoading: false
    });

    mockZustandStore(useAuthStore, {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'L2_SUPPORT'
      },
      isAuthenticated: true,
      isLoading: false
    });

    mockZustandStore(useTicketStore, {
      addTicketAction: jest.fn(),
      isLoading: false
    });
  });

  describe('Basic Rendering', () => {
    it('renders form with required fields', () => {
      render(
        <AddActionForm
          ticketId={mockTicketId}
          setShowActions={mockSetShowActions}
        />
      );

      // Verify heading
      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Add Action');

      // Verify form fields
      expect(screen.getByTestId('action-type-field')).toBeInTheDocument();
      expect(screen.getByTestId('description-field')).toBeInTheDocument();
      expect(screen.getByTestId('status-change-field')).toBeInTheDocument();

      // Verify buttons
      expect(screen.getByRole('button', { name: /add action/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

      expect(screen.getAllByText('ATTENDING (Fixing this)')).toHaveLength(2);
    });

    it('renders status options based on user role', () => {
      // Mock initial store state with L2_SUPPORT role
      mockZustandStore(useAuthStore, {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'L2_SUPPORT'
        }
      });

      // Initial render
      const { rerender } = render(
        <AddActionForm
          ticketId={mockTicketId}
          setShowActions={mockSetShowActions}
        />
      );

      // Verify COMPLETED option is visible for L2_SUPPORT
      expect(screen.getByText('COMPLETED (Fixed)')).toBeInTheDocument();

      // Update store state to L1_AGENT role
      mockZustandStore(useAuthStore, {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'L1_AGENT'
        }
      });

      // Re-render with new store state
      rerender(
        <AddActionForm
          ticketId={mockTicketId}
          setShowActions={mockSetShowActions}
        />
      );

      // Verify COMPLETED option is hidden for L1_AGENT
      expect(screen.queryByText('COMPLETED (Fixed)')).not.toBeInTheDocument();

      // Verify other status options are still visible
      const attendingOptions = screen.getAllByText('ATTENDING (Fixing this)');
      expect(attendingOptions.some(option => option.tagName === 'OPTION')).toBe(true);
    });

    it('renders form with proper styling and layout', () => {
      // Render the component
      render(
        <AddActionForm
          ticketId={mockTicketId}
          setShowActions={mockSetShowActions}
        />
      );

      // Verify container styling
      const container = screen.getByTestId('add-action-form');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('px-6', 'py-5', 'border-t', 'border-blue-100', 'animate-fadeIn', 'bg-blue-50');

      // Verify form card styling
      const formCard = screen.getByTestId('form-card');
      expect(formCard).toBeInTheDocument();
      expect(formCard).toHaveClass('bg-white', 'p-5', 'rounded-lg', 'shadow-md', 'border', 'border-blue-100');

      // Verify form fields
      const actionTypeField = screen.getByTestId('action-type-field');
      const descriptionField = screen.getByTestId('description-field');
      const statusChangeField = screen.getByTestId('status-change-field');

      // Verify field existence
      expect(actionTypeField).toBeInTheDocument();
      expect(descriptionField).toBeInTheDocument();
      expect(statusChangeField).toBeInTheDocument();

      // Verify spacing between fields
      const formFieldsContainer = screen.getByTestId('form-fields-container');
      expect(formFieldsContainer).toBeInTheDocument();
      expect(formFieldsContainer).toHaveClass('space-y-5');
    });
  });

  describe('Form Validation Tests', () => {
    it('disables Add Action button when form is invalid', () => {
      // Render the component
      render(
        <AddActionForm
          ticketId={mockTicketId}
          setShowActions={mockSetShowActions}
        />
      );

      // Get the Add Action button
      const addButton = screen.getByRole('button', { name: /add action/i });

      // Verify button is disabled when form is empty
      expect(addButton).toBeDisabled();

      // Fill in description only
      const descriptionInput = screen.getByLabelText(/description/i);
      fireEvent.change(descriptionInput, { target: { value: 'Investigating the issue...' } });
      expect(addButton).toBeDisabled();

      // Fill in status change only
      fireEvent.click(screen.getAllByText('ATTENDING (Fixing this)')[0]);
      fireEvent.click(screen.getAllByText('ATTENDING (Fixing this)')[1]);
      expect(addButton).toBeDisabled();

      // Clear description
      fireEvent.change(descriptionInput, { target: { value: '' } });
      expect(addButton).toBeDisabled();
    });

    it('enables Add Action button when required fields are filled', () => {
      // Render the component
      render(
        <AddActionForm
          ticketId={mockTicketId}
          setShowActions={mockSetShowActions}
        />
      );

      // Get the Add Action button
      const addButton = screen.getByRole('button', { name: /add action/i });
      const actionTypeInput = screen.getByLabelText(/action type/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      // Fill in action type
      fireEvent.change(actionTypeInput, { target: { value: 'Investigation' } });
      expect(addButton).toBeDisabled();

      // Fill in description
      fireEvent.change(descriptionInput, { target: { value: 'Investigating the issue...' } });
      expect(addButton).not.toBeDisabled();

      // Clear action type
      fireEvent.change(actionTypeInput, { target: { value: '' } });
      expect(addButton).toBeDisabled();

      // Fill in action type again
      fireEvent.change(actionTypeInput, { target: { value: 'Investigation' } });
      expect(addButton).not.toBeDisabled();

      // Clear description
      fireEvent.change(descriptionInput, { target: { value: '' } });
      expect(addButton).toBeDisabled();
    });

    it('handles whitespace-only inputs correctly', () => {
      // Render the component
      render(
        <AddActionForm
          ticketId={mockTicketId}
          setShowActions={mockSetShowActions}
        />
      );

      // Get the Add Action button
      const addButton = screen.getByRole('button', { name: /add action/i });
      const actionTypeInput = screen.getByLabelText(/action type/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      // Test whitespace-only action type
      fireEvent.change(actionTypeInput, { target: { value: '   ' } });
      fireEvent.change(descriptionInput, { target: { value: 'Investigating the issue...' } });
      expect(addButton).toBeDisabled();

      // Test whitespace-only description
      fireEvent.change(actionTypeInput, { target: { value: 'Investigation' } });
      fireEvent.change(descriptionInput, { target: { value: '   ' } });
      expect(addButton).toBeDisabled();

      // Test valid inputs
      fireEvent.change(actionTypeInput, { target: { value: 'Investigation' } });
      fireEvent.change(descriptionInput, { target: { value: 'Investigating the issue...' } });
      expect(addButton).not.toBeDisabled();
    });

    it('handles status change selection correctly', () => {
      // Render the component
      render(
        <AddActionForm
          ticketId={mockTicketId}
          setShowActions={mockSetShowActions}
        />
      );

      // Get the Add Action button
      const addButton = screen.getByRole('button', { name: /add action/i });
      const actionTypeInput = screen.getByLabelText(/action type/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      // Fill in required fields
      fireEvent.change(actionTypeInput, { target: { value: 'Investigation' } });
      fireEvent.change(descriptionInput, { target: { value: 'Investigating the issue...' } });
      expect(addButton).not.toBeDisabled();

      // Select status change
      fireEvent.click(screen.getAllByText('ATTENDING (Fixing this)')[0]);
      fireEvent.click(screen.getAllByText('ATTENDING (Fixing this)')[1]);
      expect(addButton).not.toBeDisabled();
    });
  });
  describe('Form Submission Tests', () => {
    it('calls addTicketAction with correct parameters', async () => {
      // Set up mock functions
      const mockAddTicketAction = jest.fn().mockResolvedValue(true);
      mockZustandStore(useTicketStore, {
        addTicketAction: mockAddTicketAction,
        isLoading: false
      });

      // Render the component
      render(
        <AddActionForm
          ticketId={mockTicketId}
          setShowActions={mockSetShowActions}
        />
      );

      // Fill in form fields
      const actionTypeInput = screen.getByLabelText(/action type/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      fireEvent.change(actionTypeInput, { target: { value: 'Investigation' } });
      fireEvent.change(descriptionInput, { target: { value: 'Investigating the issue...' } });

      // Submit form
      const addButton = screen.getByRole('button', { name: /add action/i });
      fireEvent.click(addButton);

      // Wait for async operation
      await waitFor(() => {
        expect(mockAddTicketAction).toHaveBeenCalledWith(
          mockTicketId,
          'Investigation',
          'Investigating the issue...',
          'ATTENDING'
        );
      });
    });

    it('closes form after successful submission', async () => {
      // Set up mock functions
      const mockAddTicketAction = jest.fn().mockResolvedValue(true);
      mockZustandStore(useTicketStore, {
        addTicketAction: mockAddTicketAction,
        isLoading: false
      });

      // Render the component
      render(
        <AddActionForm
          ticketId={mockTicketId}
          setShowActions={mockSetShowActions}
        />
      );

      // Fill in form fields
      const actionTypeInput = screen.getByLabelText(/action type/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      fireEvent.change(actionTypeInput, { target: { value: 'Investigation' } });
      fireEvent.change(descriptionInput, { target: { value: 'Investigating the issue...' } });

      // Submit form
      const addButton = screen.getByRole('button', { name: /add action/i });
      fireEvent.click(addButton);

      // Wait for async operation
      await waitFor(() => {
        expect(mockAddTicketAction).toHaveBeenCalled();
        expect(mockSetShowActions).toHaveBeenCalledWith(false);
      });
    });

    it('handles submission failure', async () => {
      // Set up mock functions to fail
      const mockAddTicketAction = jest.fn().mockResolvedValue(false);
      mockZustandStore(useTicketStore, {
        addTicketAction: mockAddTicketAction,
        isLoading: false
      });

      // Render the component
      render(
        <AddActionForm
          ticketId={mockTicketId}
          setShowActions={mockSetShowActions}
        />
      );

      // Fill in form fields
      const actionTypeInput = screen.getByLabelText(/action type/i);
    });
  });


  it('closes form after successful submission', async () => {
    // Set up mock functions
    const mockAddTicketAction = jest.fn().mockResolvedValue(true);
    mockZustandStore(useTicketStore, {
      addTicketAction: mockAddTicketAction,
      isLoading: false
    });

    // Render the component
    render(
      <AddActionForm
        ticketId={mockTicketId}
        setShowActions={mockSetShowActions}
      />
    );

    // Fill in form fields
    const actionTypeInput = screen.getByLabelText(/action type/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(actionTypeInput, { target: { value: 'Investigation' } });
    fireEvent.change(descriptionInput, { target: { value: 'Investigating the issue...' } });

    // Submit form
    const addButton = screen.getByRole('button', { name: /add action/i });
    fireEvent.click(addButton);

    // Wait for async operation
    await waitFor(() => {
      expect(mockAddTicketAction).toHaveBeenCalled();
      expect(mockSetShowActions).toHaveBeenCalledWith(false);
    });
  });

  it('handles submission failure', async () => {
    // Set up mock functions to fail
    const mockAddTicketAction = jest.fn().mockResolvedValue(false);
    mockZustandStore(useTicketStore, {
      addTicketAction: mockAddTicketAction,
      isLoading: false
    });

    // Render the component
    render(
      <AddActionForm
        ticketId={mockTicketId}
        setShowActions={mockSetShowActions}
      />
    );

    // Fill in form fields
    const actionTypeInput = screen.getByLabelText(/action type/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(actionTypeInput, { target: { value: 'Investigation' } });
    fireEvent.change(descriptionInput, { target: { value: 'Investigating the issue...' } });

    // Submit form
    const addButton = screen.getByRole('button', { name: /add action/i });
    fireEvent.click(addButton);

    // Wait for async operation
    await waitFor(() => {
      expect(mockAddTicketAction).toHaveBeenCalled();
      // Form should remain open on failure
      expect(mockSetShowActions).not.toHaveBeenCalled();
    });
  });
});