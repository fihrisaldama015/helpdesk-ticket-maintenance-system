import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import TicketList from './pages/tickets/TicketList';
import CreateTicket from './pages/tickets/CreateTicket';
import TicketDetail from './pages/tickets/TicketDetail';
import EscalatedTickets from './pages/tickets/EscalatedTickets';
import Unauthorized from './pages/errors/Unauthorized';
import NotFound from './pages/errors/NotFound';

function App() {
  const { loadUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

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
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/tickets" 
          element={isAuthenticated ? <TicketList /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/tickets/create" 
          element={isAuthenticated ? <CreateTicket /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/tickets/detail/:id" 
          element={isAuthenticated ? <TicketDetail /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/escalated" 
          element={isAuthenticated ? <EscalatedTickets /> : <Navigate to="/login" replace />} 
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