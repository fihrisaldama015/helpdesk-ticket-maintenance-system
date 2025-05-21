import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';
import useAuthStore from '../store/authStore';

// Mock React Router
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Route: () => <div>Route</div>,
    Navigate: () => <div>Navigate</div>,
  };
});

// Mock the auth store
jest.mock('../store/authStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock all page components
jest.mock('../pages/auth/Login', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('../pages/auth/Register', () => () => <div data-testid="register-page">Register Page</div>);
jest.mock('../pages/dashboard/Dashboard', () => () => <div data-testid="dashboard-page">Dashboard Page</div>);
jest.mock('../pages/errors/NotFound', () => () => <div data-testid="not-found-page">Not Found Page</div>);
jest.mock('../pages/errors/Unauthorized', () => () => <div data-testid="unauthorized-page">Unauthorized Page</div>);
jest.mock('../pages/tickets/CreateTicket', () => () => <div data-testid="create-ticket-page">Create Ticket Page</div>);
jest.mock('../pages/tickets/EscalatedTickets', () => () => <div data-testid="escalated-tickets-page">Escalated Tickets Page</div>);
jest.mock('../pages/tickets/TicketDetail', () => () => <div data-testid="ticket-detail-page">Ticket Detail Page</div>);
jest.mock('../pages/tickets/TicketList', () => () => <div data-testid="ticket-list-page">Ticket List Page</div>);



describe('App', () => {
  const mockLoadUser = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('calls loadUser on mount', () => {
    // Setup auth store mock
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      loadUser: mockLoadUser,
      isAuthenticated: false,
    });
    
    render(<App />);
    
    // Verify loadUser was called
    expect(mockLoadUser).toHaveBeenCalledTimes(1);
  });
  
  test('renders with authenticated user', () => {
    // Setup auth store mock for authenticated user
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      loadUser: mockLoadUser,
      isAuthenticated: true,
    });
    
    const { container } = render(<App />);
    
    // Verify that the app renders without crashing
    expect(container).toBeTruthy();
  });
  
  test('renders with unauthenticated user', () => {
    // Setup auth store mock for unauthenticated user
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      loadUser: mockLoadUser,
      isAuthenticated: false,
    });
    
    const { container } = render(<App />);
    
    // Verify that the app renders without crashing
    expect(container).toBeTruthy();
  });
});
