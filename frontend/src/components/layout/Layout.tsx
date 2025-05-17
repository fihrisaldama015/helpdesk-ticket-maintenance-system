import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import useAuthStore from '../../store/authStore';
import { UserRole } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}

const Layout: React.FC<LayoutProps> = ({
  children,
  requireAuth = false,
  allowedRoles = []
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (requireAuth && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="animate-spin mr-2">🔄</span> Loading...
      </div>
    );
  }

  // Check if user is authenticated when required
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role when specified
  if (
    requireAuth &&
    isAuthenticated &&
    allowedRoles.length > 0 &&
    user &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="z-20 bg-transparent py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-800 font-semibold">
            &copy; {new Date().getFullYear()} HelpDesk Ticket Maintenance System. Muhamad FIhris Aldama
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;