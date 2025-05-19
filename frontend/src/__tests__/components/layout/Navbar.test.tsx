import { fireEvent, render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';
import useAuthStore from '../../../store/authStore';

// Mock the auth store
jest.mock('../../../store/authStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Navbar Component', () => {
  const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'L1_AGENT',
      },
      logout: mockLogout,
    } as any);
  });

  it('renders logo and brand name', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('HelpDesk')).toBeInTheDocument();
  });

  it('shows dashboard and tickets links for L1_AGENT', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const desktopNav = screen.getByTestId('desktop-user-controls').parentElement;
    expect(desktopNav).toBeInTheDocument();

    expect(within(desktopNav!).getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(within(desktopNav!).getByRole('link', { name: 'Tickets' })).toBeInTheDocument();
    expect(within(desktopNav!).queryByRole('link', { name: 'Escalated Tickets' })).not.toBeInTheDocument();
  });

  it('shows escalated tickets link for L2_SUPPORT and L3_SUPPORT', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'L2_SUPPORT',
      },
      logout: mockLogout,
    } as any);

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Verify desktop navigation
    const desktopNav = screen.getByTestId('desktop-user-controls').parentElement;
    expect(desktopNav).toBeInTheDocument();

    // Check desktop navigation links
    expect(within(desktopNav!).getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(within(desktopNav!).getByRole('link', { name: 'Escalated Tickets' })).toBeInTheDocument();
    expect(within(desktopNav!).queryByRole('link', { name: 'Tickets' })).not.toBeInTheDocument();

    // Verify mobile navigation
    const mobileMenu = document.getElementById('mobile-menu');
    expect(mobileMenu).toBeInTheDocument();

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(menuButton);

    // Verify mobile navigation links
    const mobileNav = within(mobileMenu!).getByRole('navigation');
    expect(within(mobileNav).getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(within(mobileNav).getByRole('link', { name: 'Escalated Tickets' })).toBeInTheDocument();
    expect(within(mobileNav).queryByRole('link', { name: 'Tickets' })).not.toBeInTheDocument();

    // Close mobile menu
    fireEvent.click(menuButton);
  });

  it('shows login and register buttons when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      logout: mockLogout,
    } as any);

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Get the login button (in desktop view)
    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toBeInTheDocument();

    // Get the register button (in desktop view)
    const registerButton = screen.getByRole('button', { name: 'Register' });
    expect(registerButton).toBeInTheDocument();

    // Verify mobile menu buttons
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLogin = within(mobileMenu!).getByRole('link', { name: 'Login' });
    const mobileRegister = within(mobileMenu!).getByRole('link', { name: 'Register' });
    expect(mobileLogin).toBeInTheDocument();
    expect(mobileRegister).toBeInTheDocument();
  });

  it('displays user full name and role in desktop nav when authenticated', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Find the user info using test ID
    const desktopUserInfo = screen.getByTestId('desktop-user-controls');
    expect(desktopUserInfo).toBeInTheDocument();
    expect(desktopUserInfo).toHaveTextContent('Test User');
    expect(desktopUserInfo).toHaveTextContent('(L1_AGENT)');
  });

  it('calls logout and navigates to /login when logout button clicked', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('toggles mobile menu when menu button is clicked', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Find the menu button using aria-label
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(menuButton);

    // Get the mobile menu container
    const mobileMenu = document.getElementById('mobile-menu');
    expect(mobileMenu).toHaveClass('max-h-96 opacity-100');

    // Verify the mobile navigation is visible
    const mobileNav = screen.getByTestId('mobile-navigation');
    expect(mobileNav).toBeInTheDocument();

    // Toggle off
    fireEvent.click(menuButton);
    expect(mobileMenu).toHaveClass('max-h-0 opacity-0');
  });
});
