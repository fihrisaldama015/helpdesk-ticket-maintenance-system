import { LogOut, Menu, TicketIcon, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Button } from '../ui/button';

const Navbar: React.FC = () => {
  const { user, isLoading, logout, isAuthenticated } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isUserLoaded = isAuthenticated && !isLoading && user

  return (
    <nav className="bg-gradient-to-r from-white to-blue-50 shadow-md z-20 sticky top-0 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center group">
                <TicketIcon className="h-8 w-8 text-blue-600 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">HelpDesk</span>
              </Link>
            </div>

            {/* Desktop nav links */}
            {isUserLoaded && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="animate-fadeIn border-transparent text-gray-600 hover:border-blue-500 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105"
                >
                  Dashboard
                </Link>
                {(user?.role === 'L1_AGENT') && (
                  <Link
                    to="/tickets"
                    className="animate-fadeIn border-transparent text-gray-600 hover:border-blue-500 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105"
                  >
                    Tickets
                  </Link>
                )}
                {(user?.role === 'L2_SUPPORT' || user?.role === 'L3_SUPPORT') && (
                  <Link
                    to="/escalated"
                    className="animate-fadeIn border-transparent text-gray-600 hover:border-blue-500 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105"
                  >
                    Escalated Tickets
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Desktop user controls */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center" data-testid="desktop-user-controls">
            {isUserLoaded ? (
              <div className="flex items-center space-x-4">
                <div
                  data-testid="desktop-user-info"
                  className="text-sm font-medium text-gray-700 bg-white ring-1 ring-gray-200 py-1 px-3 rounded-full shadow-sm animate-fadeIn"
                >
                  {user?.firstName} {user?.lastName} <span className="text-blue-600 font-semibold">({user?.role})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="group hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut size={16} className="group-hover:text-red-500 transition-colors duration-200 animate-slideInLeft" />
                  <span className="group-hover:text-red-600 transition-colors duration-200 animate-slideInLeft">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="animate-slideInLeft">
                  <Button variant="outline" size="sm" className="hover:scale-105 active:scale-95 transition-all">Login</Button>
                </Link>
                <Link to="/register" className="animate-slideInLeft">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 hover:scale-105 active:scale-95 transition-all">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Button
              type="button"
              size="sm"
              className="bg-white text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6 transform transition-transform duration-200 hover:rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu with animation */}
      <div
        className={`sm:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        id="mobile-menu"
      >
        <nav role="navigation" data-testid="mobile-navigation" className="pt-2 pb-3 space-y-1">
          {isUserLoaded ? (
            <>
              <Link
                to="/dashboard"
                className="bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium hover:bg-blue-100 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              {(user?.role === 'L1_AGENT') && (
                <Link
                  to="/tickets"
                  className="border-transparent text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tickets
                </Link>
              )}
              {(user?.role === 'L2_SUPPORT' || user?.role === 'L3_SUPPORT') && (
                <Link
                  to="/escalated"
                  className="border-transparent text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Escalated Tickets
                </Link>
              )}
              <div className="border-t border-gray-200 pt-4 pb-3 bg-gradient-to-r from-white to-blue-50">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <div
                      data-testid="mobile-user-name"
                      className="text-base font-medium text-gray-800"
                    >
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div
                      data-testid="mobile-user-role"
                      className="text-sm font-medium text-blue-600"
                    >
                      {user?.role.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="mt-3 mx-3 space-y-1">
                  <Button
                    variant="default"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-gray-600 hover:text-red-600 bg-white hover:bg-red-50 transition-colors duration-200 rounded-md"
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1 px-4 pt-2 pb-3">
              <Link
                to="/login"
                className="block py-2 text-base font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200 rounded-md px-3"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block py-2 text-base font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200 rounded-md px-3"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </nav>
  );
};

export default Navbar;