import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Unauthorized from '../../../pages/errors/Unauthorized';

// Mock the Layout component to simplify testing
jest.mock('../../../components/layout/Layout', () => ({ children }: { children: React.ReactNode }) => (
  <div data-testid="layout">{children}</div>
));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Unauthorized Component', () => {
  beforeEach(() => {
    // Reset mock before each test
    jest.clearAllMocks();
  });

  test('renders Unauthorized page correctly', () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );

    // Check if the page renders correctly
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('You do not have permission to access this page.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
  });

  test('navigates back when "Go Back" button is clicked', () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );

    // Click the "Go Back" button
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    
    // Check if navigate(-1) was called
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('navigates to dashboard when "Go to Dashboard" button is clicked', () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>
    );

    // Click the "Go to Dashboard" button
    fireEvent.click(screen.getByRole('button', { name: /go to dashboard/i }));
    
    // Check if navigate('/dashboard') was called
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
