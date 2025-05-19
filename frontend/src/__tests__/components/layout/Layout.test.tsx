import { User } from '@/types';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import useAuthStore from '../../../store/authStore';

// Mock the auth store
jest.mock('../../../store/authStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock useNavigate and useLocation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('Layout Component', () => {
  const baseUser: User = {
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'L1_AGENT',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: baseUser as User,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loadUser: jest.fn(),
      clearError: jest.fn(),
    });
  });

  const renderWithRouter = (ui: React.ReactNode) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders children normally (no auth required)', () => {
    renderWithRouter(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('shows loading state if auth is loading', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockUseAuthStore(),
      isLoading: true,
    });

    renderWithRouter(
      <Layout requireAuth>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('redirects to login if not authenticated and auth is required', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockUseAuthStore(),
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithRouter(
      <Layout requireAuth>
        <div>Should not render</div>
      </Layout>
    );

    expect(screen.queryByText('Should not render')).not.toBeInTheDocument();
  });

  it('renders children if authenticated and auth is required', () => {
    renderWithRouter(
      <Layout requireAuth>
        <div data-testid="protected-content">Protected</div>
      </Layout>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects to unauthorized if role is not allowed', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockUseAuthStore(),
      user: { ...baseUser, role: 'L2_AGENT' },
    });

    renderWithRouter(
      <Layout requireAuth allowedRoles={['L1_AGENT']}>
        <div>Blocked Content</div>
      </Layout>
    );

    expect(screen.queryByText('Blocked Content')).not.toBeInTheDocument();
  });

  it('renders children if user has allowed role', () => {
    renderWithRouter(
      <Layout requireAuth allowedRoles={['L1_AGENT']}>
        <div data-testid="role-content">Role Content</div>
      </Layout>
    );

    expect(screen.getByTestId('role-content')).toBeInTheDocument();
  });

  it('renders footer copyright', () => {
    renderWithRouter(
      <Layout>
        <div />
      </Layout>
    );

    expect(screen.getByText(/© \d{4} HelpDesk Ticket Maintenance System/)).toBeInTheDocument();
  });
});
