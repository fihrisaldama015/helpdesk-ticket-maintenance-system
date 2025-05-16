import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import useAuthStore from '../../../store/authStore';

// Mock the auth store
jest.mock('../../../store/authStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

describe('Layout Component', () => {
  const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'L1',
      },
      isLoading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loadUser: jest.fn(),
      clearError: jest.fn(),
    });
  });

  it('renders children when no auth is required', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div data-testid="test-content">Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('renders loading spinner when loading', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockUseAuthStore(),
      isLoading: true,
    });

    render(
      <BrowserRouter>
        <Layout requireAuth>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders children when auth is required and user is authenticated', () => {
    render(
      <BrowserRouter>
        <Layout requireAuth>
          <div data-testid="test-content">Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('renders children when user has required role', () => {
    render(
      <BrowserRouter>
        <Layout requireAuth allowedRoles={['L1']}>
          <div data-testid="test-content">Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('includes footer with copyright notice', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByText(/© \d{4} HelpDesk Ticket System/)).toBeInTheDocument();
  });
});