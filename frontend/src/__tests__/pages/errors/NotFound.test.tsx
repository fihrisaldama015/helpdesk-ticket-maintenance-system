import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../../../pages/errors/NotFound';

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

describe('NotFound Component', () => {
  beforeEach(() => {
    // Reset mock before each test
    jest.clearAllMocks();
  });

  test('renders NotFound page correctly', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    // Check if the page renders correctly
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText("The page you are looking for doesn't exist or has been moved.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
  });

  test('navigates back when "Go Back" button is clicked', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    // Click the "Go Back" button
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    
    // Check if navigate(-1) was called
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('navigates to home when "Go Home" button is clicked', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    // Click the "Go Home" button
    fireEvent.click(screen.getByRole('button', { name: /go home/i }));
    
    // Check if navigate('/') was called
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
