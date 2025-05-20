import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Register from '../../../pages/auth/Register';

// Mock the useNavigate hook
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the auth store
jest.mock('../../../store/authStore', () => {
  return {
    __esModule: true,
    default: jest.fn()
  };
});

import useAuthStore from '../../../store/authStore';

// Mock Zustand store function
function mockZustandStore<T>(store: unknown, value: T): void {
  (store as unknown as jest.Mock).mockReturnValue(value);
}

describe('Register', () => {
  const mockRegister = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock for auth store
    mockZustandStore(useAuthStore, {
      register: mockRegister,
      error: null,
      clearError: mockClearError,
      isLoading: false,
      isAuthenticated: false,
    });
  });

  it('renders all form fields', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Wait for the form to be present in the document
    const form = await screen.findByRole('form');
    expect(form).toBeInTheDocument();
    
    // Check for all input fields
    const inputs = await screen.findAllByRole('textbox');
    expect(inputs).toHaveLength(3); // firstName, lastName, email
    
    // Check for password inputs
    const passwordInputs = await screen.findAllByLabelText(/password/i, { selector: 'input' });
    expect(passwordInputs).toHaveLength(2); // password and confirm password
    
    // Check for role select
    const roleSelect = await screen.findByRole('combobox', { name: /role/i });
    expect(roleSelect).toBeInTheDocument();
    
    // Check for the register button - use getAllByRole and find the submit button
    const registerButtons = await screen.findAllByRole('button', { name: /register/i });
    const submitButton = registerButtons.find(button => button.getAttribute('type') === 'submit');
    expect(submitButton).toBeInTheDocument();
    
    // Check for login link
    const loginLink = await screen.findByText(/already have an account\?/i);
    expect(loginLink).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Try to submit the form without filling any fields
    const registerButtons = screen.getAllByRole('button', { name: /register/i });
    const submitButton = registerButtons.find(button => button.getAttribute('type') === 'submit');
    if (submitButton) {
      await userEvent.click(submitButton);
    } else {
      throw new Error('Submit button not found');
    }
    
    // Check for required field error messages
    expect(await screen.findByText('First name is required')).toBeInTheDocument();
    expect(await screen.findByText('Last name is required')).toBeInTheDocument();
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    expect(await screen.findByText('Please confirm your password')).toBeInTheDocument();
    expect(await screen.findByText('Please select a role')).toBeInTheDocument();
    
    // Check that the register function was not called
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    // Mock the register function to track if it's called
    const mockRegisterFn = jest.fn();
    mockRegister.mockImplementation(mockRegisterFn);
    
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Get the form element
    const form = screen.getByRole('form');
    // Disable HTML5 validation for testing
    form.setAttribute('novalidate', '');
    
    // Fill in required fields with valid data
    await userEvent.type(screen.getByLabelText('First name'), 'John');
    await userEvent.type(screen.getByLabelText('Last name'), 'Doe');
    
    // Enter an invalid email that passes HTML5 validation but fails our custom validation
    const emailInput = screen.getByLabelText('Email address');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'invalid-email@');
    
    // Fill in other required fields
    await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'Password123!');
    await userEvent.selectOptions(screen.getByLabelText('Role'), 'L1_AGENT');
    
    // Try to submit the form - find the submit button among multiple Register buttons
    const registerButtons = screen.getAllByRole('button', { name: /register/i });
    const submitButton = registerButtons.find(button => button.getAttribute('type') === 'submit');
    if (submitButton) {
      await userEvent.click(submitButton);
    } else {
      throw new Error('Submit button not found');
    }
    
    // Check for email validation error - the error message should be displayed
    const errorMessage = await screen.findByText('Invalid email address');
    expect(errorMessage).toBeInTheDocument();
    
    // Verify the register function was not called due to validation error
    expect(mockRegisterFn).not.toHaveBeenCalled();
  });

  it('validates password match', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Fill in the form with mismatched passwords
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'differentpassword');
    
    // Try to submit the form - find the submit button among multiple Register buttons
    const registerButtons = screen.getAllByRole('button', { name: /register/i });
    const submitButton = registerButtons.find(button => button.getAttribute('type') === 'submit');
    if (submitButton) {
      await userEvent.click(submitButton);
    } else {
      throw new Error('Submit button not found');
    }
    
    // Check for password match error
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('allows the user to register with valid credentials', async () => {
    // Mock a successful registration
    mockRegister.mockResolvedValue(true);
    
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText('First name'), 'John');
    await userEvent.type(screen.getByLabelText('Last name'), 'Doe');
    await userEvent.type(screen.getByLabelText('Email address'), 'john.doe@example.com');
    
    // Toggle password visibility
    const passwordInput = screen.getByLabelText('Password');
    const togglePasswordButton = screen.getByRole('button', { name: /show password/i });
    await userEvent.click(togglePasswordButton);
    
    await userEvent.type(passwordInput, 'Password123!');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'Password123!');
    
    // Select a role
    await userEvent.selectOptions(screen.getByLabelText('Role'), 'L1_AGENT');
    
    // Submit the form
    const registerButtons = screen.getAllByRole('button', { name: /register/i });
    const submitButton = registerButtons.find(button => button.getAttribute('type') === 'submit');
    if (submitButton) {
      await userEvent.click(submitButton);
    } else {
      throw new Error('Submit button not found');
    }
    
    // Check that the register function was called with the correct data
    expect(mockRegister).toHaveBeenCalledWith(
      'John',
      'Doe',
      'john.doe@example.com',
      'Password123!',
      'L1_AGENT'
    );
  });

  it('shows error message when registration fails', async () => {
    // Mock a failed registration
    const errorMessage = 'Registration failed';
    mockRegister.mockResolvedValue(false);
    
    // Update the store to include an error
    mockZustandStore(useAuthStore, {
      register: mockRegister,
      error: errorMessage,
      clearError: mockClearError,
      isLoading: false,
      isAuthenticated: false,
    });
    
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Check that the error message is displayed
    const errorElement = await screen.findByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
  });

  it('redirects to dashboard if already authenticated', async () => {
    // Reset mocks before the test
    mockNavigate.mockClear();
    
    // Update the store to be authenticated
    mockZustandStore(useAuthStore, {
      register: mockRegister,
      error: null,
      clearError: mockClearError,
      isLoading: false,
      isAuthenticated: true,
    });
    
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Wait for the effect to run
    await Promise.resolve();
    
    // Check that navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
