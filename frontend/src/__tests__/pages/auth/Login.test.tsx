import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Login from '../../../pages/auth/Login';

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

describe('Login', () => {
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock for auth store
    mockZustandStore(useAuthStore, {
      login: mockLogin,
      error: null,
      clearError: mockClearError,
      isLoading: false,
    });
  });

  it('renders the email input field', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Check for the email input
    const emailInput = screen.getByLabelText('Email address');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('renders the password input field', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Check for the password input
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('allows the user to log in with valid credentials', async () => {
    // Mock a successful login
    mockLogin.mockResolvedValue(true);
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Fill in the form
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Use userEvent for more realistic interactions
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    // Check that the login function was called with the correct credentials
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
  
  it('shows error message when login fails', async () => {
    // Mock a failed login
    const errorMessage = 'Invalid credentials';
    mockLogin.mockResolvedValue(false);
    
    // Update the store to include an error
    mockZustandStore(useAuthStore, {
      login: mockLogin,
      error: errorMessage,
      clearError: mockClearError,
      isLoading: false,
    });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Fill in the form
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, 'wrong@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);
    
    // Check that the error message is displayed
    const errorElement = await screen.findByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
    
    // Check that the login function was called
    expect(mockLogin).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
  });
});
