import AddActionForm from '@/components/tickets/AddActionForm';
import EscalationForm from '@/components/tickets/EscalationForm';
import RadioCriticalValueForm from '@/components/tickets/RadioCriticalValueForm';
import { format } from 'date-fns';
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowUpCircle,
  Calendar,
  Check,
  CheckCircle,
  CheckSquare,
  Clipboard,
  ClipboardList,
  Clock,
  FileText,
  History,
  MessageCircle,
  Play,
  Shield,
  Tag,
  Ticket,
  UserCheck,
  Users,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/StatusBadge';
import useAuthStore from '../../store/authStore';
import useTicketStore from '../../store/ticketStore';
import { CriticalValue, TicketAction, TicketStatus } from '../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ResolutionForm from '@/components/tickets/ResolutionForm';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentTicket,
    getTicketById,
    updateTicketStatus,
    escalateToL2,
    setCriticalValue,
    escalateToL3,
    addTicketAction,
    resolveTicket,
    isLoading,
    error,
    clearError
  } = useTicketStore();

  const [showActions, setShowActions] = useState(false);
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [showCriticalValueForm, setShowCriticalValueForm] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
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

  const handleStatusUpdate = async (status: TicketStatus) => {
    if (id) {
      await updateTicketStatus(id, status);
    }
  };

  const handleSetCriticalValue = async (e: React.FormEvent, selectedCriticalValue: CriticalValue) => {
    e.preventDefault();
    if (id && selectedCriticalValue) {
      const success = await setCriticalValue(id, selectedCriticalValue);
      if (success) {
        setShowCriticalValueForm(false);
      }
    }
  };

  const handleEscalateToL2 = async (e: React.FormEvent, escalationNotes: string) => {
    e.preventDefault();
    if (id && escalationNotes.trim()) {
      const success = await escalateToL2(id, escalationNotes);
      if (success) {
        setShowEscalationForm(false);
      }
    }
  };

  const handleEscalateToL3 = async (e: React.FormEvent, escalationNotes: string) => {
    e.preventDefault();
    if (id && escalationNotes.trim()) {
      const success = await escalateToL3(id, escalationNotes, currentTicket?.criticalValue || "NONE");
      if (success) {
        setShowEscalationForm(false);
      }
    }
  };

  const handleAddAction = async (e: React.FormEvent, actionNotes: string, actionType: string, statusChange: TicketStatus | '') => {
    e.preventDefault();
    if (id && actionNotes.trim() && actionType) {
      const status = statusChange ? statusChange as TicketStatus : undefined;
      const success = await addTicketAction(id, actionType, actionNotes, status);
      if (success) {
        setShowActions(false);
      }
    }
  };

  const handleResolveTicket = async (e: React.FormEvent, resolutionNotes: string) => {
    e.preventDefault();
    if (id && resolutionNotes.trim()) {
      const success = await resolveTicket(id, resolutionNotes);
      if (success) {
        setResolutionNotes('');
        setShowResolutionForm(false);
      }
    }
  };

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
          <Button onClick={() => navigate('/tickets')}>Back to Tickets</Button>
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
        {/* Ticket Header */}
        <div className="px-6 py-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center">
              <div className="mr-3 bg-blue-100 p-2 rounded-full">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-1 transition-all duration-300 hover:text-blue-700">
                  {currentTicket.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <StatusBadge status={currentTicket.status} />
                  <StatusBadge priority={currentTicket.priority} />
                  {currentTicket.criticalValue && (
                    <StatusBadge criticalValue={currentTicket.criticalValue} />
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/tickets')}
                className="hover:bg-blue-50 transition-colors duration-300 flex items-center gap-2 border-blue-200"
              >
                <ArrowLeft size={16} />
                Back to Tickets
              </Button>
            </div>
          </div>
        </div>

        {/* Ticket Information */}
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="transform transition-all duration-300 hover:scale-102">
            <div className="border border-blue-100 rounded-md p-4 bg-white shadow-sm hover:shadow transition-all duration-300">
              <h4 className="font-medium text-blue-700 mb-3 flex items-center">
                <Clipboard className="h-4 w-4 mr-2 text-blue-500" />
                Ticket Details
              </h4>

              <div className="space-y-3">
                <div className="flex items-start group">
                  <Tag className="h-5 w-5 text-blue-500 mr-2 mt-0.5 group-hover:text-blue-600 transition-colors duration-300" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Category</span>
                    <span className="block text-sm text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{currentTicket.category}</span>
                  </div>
                </div>

                <div className="flex items-start group">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 group-hover:text-blue-600 transition-colors duration-300" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Priority</span>
                    <span className="block text-sm text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{currentTicket.priority}</span>
                  </div>
                </div>

                <div className="flex items-start group">
                  <Calendar className="h-5 w-5 text-blue-500 mr-2 mt-0.5 group-hover:text-blue-600 transition-colors duration-300" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Created</span>
                    <span className="block text-sm text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {currentTicket.createdAt ? format(new Date(currentTicket.createdAt), 'PPP') : '-'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start group">
                  <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5 group-hover:text-blue-600 transition-colors duration-300" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Expected Completion</span>
                    <span className="block text-sm text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {currentTicket.expectedCompletionDate ? format(new Date(currentTicket.expectedCompletionDate), 'PPP') : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="transform transition-all duration-300 hover:scale-102">
            <div className="border border-blue-100 rounded-md p-4 bg-white shadow-sm hover:shadow transition-all duration-300">
              <h4 className="font-medium text-blue-700 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-500" />
                Created By
              </h4>
              <div className="flex items-center mb-4 group">
                <div className="bg-blue-100 rounded-full h-10 w-10 flex items-center justify-center text-blue-600 font-medium group-hover:bg-blue-200 transition-all duration-300">
                  {currentTicket.createdBy?.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {currentTicket.createdBy?.firstName} {currentTicket.createdBy?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">ID: {currentTicket.createdBy?.id.substring(0, 8)}...</div>
                </div>
              </div>

              {currentTicket.assignedTo && (
                <>
                  <h4 className="font-medium text-blue-700 mb-3 flex items-center">
                    <UserCheck className="h-4 w-4 mr-2 text-blue-500" />
                    Current Assignee
                  </h4>
                  <div className="flex items-center group">
                    <div className="bg-green-100 rounded-full h-10 w-10 flex items-center justify-center text-green-600 font-medium group-hover:bg-green-200 transition-all duration-300">
                      {currentTicket.assignedTo?.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                        {currentTicket.assignedTo?.firstName} {currentTicket.assignedTo?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">ID: {currentTicket.assignedTo?.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Description */}
        <div className="px-6 py-5 border-t border-blue-100">
          <h4 className="font-medium text-blue-700 mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-blue-500" />
            Description
          </h4>
          <div className="bg-blue-50 rounded-md p-4 whitespace-pre-wrap text-gray-800 border border-blue-100 transition-all duration-300 hover:shadow-md">
            {currentTicket.description}
          </div>
        </div>

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
            <div className="px-6 py-0 border-t border-blue-100 flex flex-wrap gap-3 bg-blue-50">
              <Select onValueChange={(value) => handleStatusUpdate(value as TicketStatus)}>
                <SelectTrigger className="w-auto border-blue-300 hover:bg-blue-100 transition-colors duration-300 px-3 py-2 h-9 text-sm rounded-md">
                  <div className="flex items-center gap-2">
                    <Activity size={16} />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="min-w-[224px]">
                  <SelectItem value="ATTENDING" className="py-2.5 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-blue-500" />
                      <span>Mark as Attending (Fixing this)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="COMPLETED" className="py-2.5 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Mark as Completed</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {canEscalateToL2() && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => setShowEscalationForm(!showEscalationForm)}
              className="bg-orange-500 hover:bg-orange-600 transition-colors duration-300 flex items-center gap-2 transform hover:scale-105"
            >
              <ArrowUpCircle size={16} />
              Escalate to L2
            </Button>
          )}

          {canSetCriticalValue() && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCriticalValueForm(!showCriticalValueForm)}
              className="bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-2 transform hover:scale-105"
            >
              <Shield size={16} />
              Set Critical Value
            </Button>
          )}

          {canEscalateToL3() && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowEscalationForm(!showEscalationForm)}
              className="bg-red-600 hover:bg-red-700 transition-colors duration-300 flex items-center gap-2 transform hover:scale-105"
            >
              <AlertOctagon size={16} />
              Escalate to L3
            </Button>
          )}

          {canAddAction() && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2 transform hover:scale-105"
            >
              <MessageCircle size={16} />
              Add Action
            </Button>
          )}

          {canResolve() && (
            <Button
              variant="success"
              size="sm"
              onClick={() => setShowResolutionForm(!showResolutionForm)}
              className="bg-emerald-600 hover:bg-emerald-700 transition-colors duration-300 flex items-center gap-2 transform hover:scale-105"
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
          isLoading={isLoading}
          canEscalateToL2={canEscalateToL2}
          setShowEscalationForm={setShowEscalationForm}
          handleEscalateToL2={handleEscalateToL2}
          handleEscalateToL3={handleEscalateToL3}
        />
      )}

      {/* Critical Value Form (L2) */}
      {showCriticalValueForm && (
        <RadioCriticalValueForm
          isLoading={isLoading}
          handleSetCriticalValue={handleSetCriticalValue}
          setShowCriticalValueForm={setShowCriticalValueForm}
        />
      )}

      {/* Add Action Form (L2/L3) */}
      {showActions && canAddAction() && (
        <AddActionForm
          isLoading={isLoading}
          handleAddAction={handleAddAction}
          setShowActions={setShowActions}
        />
      )}

      {/* Resolution Form (L3) */}
      {showResolutionForm && (
        <ResolutionForm isLoading={isLoading} handleResolveTicket={handleResolveTicket} setShowResolutionForm={setShowResolutionForm} />
      )}

      {/* Ticket History */}
      <div className="px-6 py-5 border-t border-blue-100">
        <div className="flex items-center mb-4">
          <h4 className="font-medium text-blue-700 flex items-center">
            <History className="h-4 w-4 mr-2 text-blue-500" />
            Ticket History
          </h4>
          <div className="flex-grow border-t border-blue-200 ml-4"></div>
        </div>

        {currentTicket.actions && currentTicket.actions.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {currentTicket.actions?.map((action: TicketAction, actionIdx: number) => (
                <li key={action.id}>
                  <div className="relative pb-8">
                    {actionIdx !== currentTicket.actions?.length! - 1 ? (
                      <span
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-blue-200"
                        aria-hidden="true"
                      ></span>
                    ) : null}
                    <div className="relative flex items-start space-x-3 group">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white group-hover:bg-blue-200 transition-colors duration-300">
                          <span className="text-sm font-medium text-blue-600">
                            {action.user?.firstName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{action.user?.firstName} {action.user?.lastName}</span>
                            <span className="ml-2 text-gray-500">({action.user?.role})</span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(action.createdAt), 'PPp')}
                          </p>
                        </div>
                        <div className="mt-2 bg-white border border-blue-100 rounded-md p-3 shadow-sm transition-all duration-300 hover:shadow">
                          <div className="text-sm font-medium text-gray-900 mb-1 flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-blue-500" />
                            {action.action}
                            {action.newStatus && (
                              <span className="ml-2">
                                <StatusBadge status={action.newStatus} />
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                            {action.notes}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8 flex flex-col items-center">
            <ClipboardList className="h-16 w-16 text-blue-200 mb-2" />
            <p>No actions have been recorded yet.</p>
          </div>
        )}
      </div>
    </Layout >
  );
};

export default TicketDetail;