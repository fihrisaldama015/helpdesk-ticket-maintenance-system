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

  it('displays user information in mobile menu when authenticated', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(menuButton);

    // Check user name and role in mobile menu
    const mobileUserName = screen.getByTestId('mobile-user-name');
    expect(mobileUserName).toHaveTextContent('Test User');

    const mobileUserRole = screen.getByTestId('mobile-user-role');
    expect(mobileUserRole).toHaveTextContent('L1 AGENT');
  });

  it('navigates and closes mobile menu when mobile links are clicked', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(menuButton);

    // Click on Dashboard link in mobile menu
    const dashboardLink = within(screen.getByTestId('mobile-navigation')).getByText('Dashboard');
    fireEvent.click(dashboardLink);

    // Verify menu is closed
    const mobileMenu = document.getElementById('mobile-menu');
    expect(mobileMenu).toHaveClass('max-h-0 opacity-0');
  });

  it('logs out and closes mobile menu when mobile logout button is clicked', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(menuButton);

    // Find and click the mobile logout button
    const mobileLogoutBtn = screen.getByText('Sign out');
    fireEvent.click(mobileLogoutBtn);

    // Verify logout was called and menu is closed
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    // Verify menu is closed
    const mobileMenu = document.getElementById('mobile-menu');
    expect(mobileMenu).toHaveClass('max-h-0 opacity-0');
  });

  it('closes mobile menu when mobile login/register links are clicked when not authenticated', () => {
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

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(menuButton);

    // Click on Login link in mobile menu
    const loginLink = within(document.getElementById('mobile-menu')!).getByText('Login');
    fireEvent.click(loginLink);

    // Verify menu is closed
    const mobileMenu = document.getElementById('mobile-menu');
    expect(mobileMenu).toHaveClass('max-h-0 opacity-0');
  });

  it('handles loading state correctly', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: true,
      user: null,
      logout: mockLogout,
    } as any);

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Verify that navigation links are not shown when loading
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Tickets' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Escalated Tickets' })).not.toBeInTheDocument();
  });
});
