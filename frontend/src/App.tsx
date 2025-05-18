import { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import NotFound from './pages/errors/NotFound';
import Unauthorized from './pages/errors/Unauthorized';
import CreateTicket from './pages/tickets/CreateTicket';
import EscalatedTickets from './pages/tickets/EscalatedTickets';
import TicketDetail from './pages/tickets/TicketDetail';
import TicketList from './pages/tickets/TicketList';

function App() {
  const { loadUser, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  console.log('[app] auth', isAuthenticated)
  console.log('[app] loading', isLoading)


  return (
    <Router>
      <Routes>
        {/* Auth Routes - Redirect if already authenticated */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        {/* Protected Routes - Redirect if not authenticated */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/tickets"
          element={<TicketList />}
        />
        <Route
          path="/tickets/create"
          element={<CreateTicket />}
        />
        <Route
          path="/tickets/detail/:id"
          element={<TicketDetail />}
        />
        <Route
          path="/escalated"
          element={<EscalatedTickets />}
        />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />

        {/* Default Redirect */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;