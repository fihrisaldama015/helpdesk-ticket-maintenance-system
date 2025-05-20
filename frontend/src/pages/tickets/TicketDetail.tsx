import AddActionForm from '@/components/tickets/AddActionForm';
import EscalationForm from '@/components/tickets/EscalationForm';
import RadioCriticalValueForm from '@/components/tickets/RadioCriticalValueForm';
import ResolutionForm from '@/components/tickets/ResolutionForm';
import TicketDescription from '@/components/tickets/TicketDescription';
import TicketHistory from '@/components/tickets/TicketHistory';
import UpdateTicketStatusButton from '@/components/tickets/UpdateTicketStatusButton';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpCircle,
  CheckSquare,
  MessageCircle,
  Shield
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/ui/button';
import useAuthStore from '../../store/authStore';
import useTicketStore from '../../store/ticketStore';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentTicket,
    getTicketById,
    isLoading,
    error,
    clearError
  } = useTicketStore();

  const [showActions, setShowActions] = useState(false);
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [showCriticalValueForm, setShowCriticalValueForm] = useState(false);
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (id) {
      getTicketById(id);
    }

    return () => {
      clearError();
    };
  }, [id, getTicketById, clearError]);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  if (isLoading) {
    return (
      <Layout requireAuth>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!currentTicket) {
    return (
      <Layout requireAuth>
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Ticket Not Found</h2>
          <p className="text-gray-600 mb-6">The ticket you are looking for does not exist or you don't have permission to view it.</p>
          <Button onClick={() => user?.role === 'L1_AGENT' ? navigate('/tickets') : navigate('/escalated')}>{user?.role === 'L1_AGENT' ? 'Back to Tickets' : 'Back to Escalated Tickets'}</Button>
        </div>
      </Layout>
    );
  }

  // Helper to check if user can perform certain actions
  const canUpdateStatus = (): boolean => {
    if (!user) return false;

    // L1 can only update to NEW, ATTENDING, COMPLETED
    if (user.role === 'L1_AGENT') {
      return currentTicket.status === 'NEW' || currentTicket.status === 'ATTENDING';
    }

    // L2 and L3 can update any status
    return user.role === 'L2_SUPPORT' || user.role === 'L3_SUPPORT';
  };

  const canEscalateToL2 = (): boolean => {
    return user?.role === 'L1_AGENT' &&
      (currentTicket.status === 'NEW' || currentTicket.status === 'ATTENDING');
  };

  const canSetCriticalValue = (): boolean => {
    return user?.role === 'L2_SUPPORT' && (currentTicket.status === 'ESCALATED_L2' || currentTicket.status === 'ATTENDING');
  };

  const canEscalateToL3 = (): boolean => {
    return user?.role === 'L2_SUPPORT' &&
      (currentTicket.status === 'ESCALATED_L2' || currentTicket.status === 'ATTENDING') &&
      (currentTicket.criticalValue === 'C1' || currentTicket.criticalValue === 'C2');
  };

  const canAddAction = (): boolean => {
    return (user?.role === 'L2_SUPPORT' && (currentTicket.status === 'ESCALATED_L2' || currentTicket.status === 'ATTENDING')) ||
      (user?.role === 'L3_SUPPORT' && (currentTicket.status === 'ESCALATED_L3' || currentTicket.status === 'ATTENDING'));
  };

  const canResolve = (): boolean => {
    return user?.role === 'L3_SUPPORT' &&
      (currentTicket.status === 'ESCALATED_L3' || currentTicket.status === 'ATTENDING') &&
      (currentTicket.criticalValue === 'C1' || currentTicket.criticalValue === 'C2');
  };

  return (
    <Layout requireAuth>
      <div className="bg-white shadow-lg rounded-lg mb-6 overflow-hidden border border-blue-100 transition-all duration-300 hover:shadow-xl">
        <TicketDescription currentTicket={currentTicket} userRole={user?.role} />

        <div className='px-6 py-5 border-t border-blue-100 flex flex-wrap gap-3 bg-blue-50'>
          {/* Error Message */}
          {showError && error && (
            <div className="mx-6 my-3 bg-red-50 border-l-4 border-red-500 p-4 animate-fadeIn flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {canUpdateStatus() && user?.role === 'L1_AGENT' && (
            <UpdateTicketStatusButton />
          )}

          {canEscalateToL2() && (
            <Button
              size="sm"
              onClick={() => setShowEscalationForm(!showEscalationForm)}
              className="bg-orange-500 hover:bg-orange-600 transition-all hover:scale-105"
            >
              <ArrowUpCircle size={16} />
              Escalate to L2
            </Button>
          )}

          {canSetCriticalValue() && (
            <Button
              size="sm"
              onClick={() => setShowCriticalValueForm(!showCriticalValueForm)}
              className="bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-105"
            >
              <Shield size={16} />
              Set Critical Value
            </Button>
          )}

          {canEscalateToL3() && (
            <Button
              size="sm"
              onClick={() => setShowEscalationForm(!showEscalationForm)}
              className="bg-red-600 hover:bg-red-700 transition-all hover:scale-105"
            >
              <AlertOctagon size={16} />
              Escalate to L3
            </Button>
          )}

          {canAddAction() && (
            <Button
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all"
            >
              <MessageCircle size={16} />
              Add Action
            </Button>
          )}

          {canResolve() && (
            <Button
              size="sm"
              onClick={() => setShowResolutionForm(!showResolutionForm)}
              className="bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-105"
            >
              <CheckSquare size={16} />
              Resolve Ticket
            </Button>
          )}
        </div>
      </div>


      {/* Escalation Form (L1->L2 or L2->L3) */}
      {showEscalationForm && (
        <EscalationForm
          ticketId={id}
          canEscalateToL2={canEscalateToL2}
          setShowEscalationForm={setShowEscalationForm}
        />
      )}

      {/* Critical Value Form (L2) */}
      {showCriticalValueForm && (
        <RadioCriticalValueForm
          ticketId={id}
          setShowCriticalValueForm={setShowCriticalValueForm}
        />
      )}

      {/* Add Action Form (L2/L3) */}
      {showActions && canAddAction() && (
        <AddActionForm
          ticketId={id}
          setShowActions={setShowActions}
        />
      )}

      {/* Resolution Form (L3) */}
      {showResolutionForm && (
        <ResolutionForm
          ticketId={id}
          setShowResolutionForm={setShowResolutionForm}
        />
      )}

      {/* Ticket History */}
      <TicketHistory />
    </Layout >
  );
};

export default TicketDetail;