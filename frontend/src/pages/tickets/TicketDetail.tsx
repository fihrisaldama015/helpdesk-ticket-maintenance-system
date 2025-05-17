import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowUpCircle,
  Calendar,
  ChevronDown,
  Clock,
  MessageCircle,
  Tag
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import useAuthStore from '../../store/authStore';
import useTicketStore from '../../store/ticketStore';
import { CriticalValue, TicketAction, TicketStatus } from '../../types';

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
  const [actionNotes, setActionNotes] = useState('');
  const [actionType, setActionType] = useState('');
  const [statusChange, setStatusChange] = useState<TicketStatus | ''>('');
  const [escalationNotes, setEscalationNotes] = useState('');
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [selectedCriticalValue, setSelectedCriticalValue] = useState<CriticalValue>("NONE");
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

  const handleEscalateToL2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && escalationNotes.trim()) {
      const success = await escalateToL2(id, escalationNotes);
      if (success) {
        setEscalationNotes('');
        setShowEscalationForm(false);
      }
    }
  };

  const handleSetCriticalValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && selectedCriticalValue) {
      const success = await setCriticalValue(id, selectedCriticalValue);
      if (success) {
        setShowCriticalValueForm(false);
      }
    }
  };

  const handleEscalateToL3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && escalationNotes.trim()) {
      const success = await escalateToL3(id, escalationNotes, currentTicket?.criticalValue || "NONE");
      if (success) {
        setEscalationNotes('');
        setShowEscalationForm(false);
      }
    }
  };

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && actionNotes.trim() && actionType) {
      const status = statusChange ? statusChange as TicketStatus : undefined;
      const success = await addTicketAction(id, actionType, actionNotes, status);
      if (success) {
        setActionNotes('');
        setActionType('');
        setStatusChange('');
        setShowActions(false);
      }
    }
  };

  const handleResolveTicket = async (e: React.FormEvent) => {
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
    return user?.role === 'L2_SUPPORT' && currentTicket.status === 'ESCALATED_L2';
  };

  const canEscalateToL3 = (): boolean => {
    return user?.role === 'L2_SUPPORT' &&
      currentTicket.status === 'ESCALATED_L2' &&
      (currentTicket.criticalValue === 'C1' || currentTicket.criticalValue === 'C2');
  };

  const canAddAction = (): boolean => {
    return (user?.role === 'L2_SUPPORT' || user?.role === 'L3_SUPPORT') &&
      (currentTicket.status === 'ESCALATED_L2' || currentTicket.status === 'ESCALATED_L3');
  };

  const canResolve = (): boolean => {
    return user?.role === 'L3_SUPPORT' &&
      currentTicket.status === 'ESCALATED_L3' &&
      (currentTicket.criticalValue === 'C1' || currentTicket.criticalValue === 'C2');
  };

  return (
    <Layout requireAuth>
      <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
        {/* Ticket Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-1">
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
            <div className="mt-4 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/tickets')}
                className="hover:bg-gray-100 transition-colors"
              >
                Back to Tickets
              </Button>
            </div>
          </div>
        </div>

        {/* Ticket Information */}
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="border rounded-md p-4 bg-gray-50">
              <h4 className="font-medium text-gray-700 mb-3">Ticket Details</h4>

              <div className="space-y-3">
                <div className="flex items-start">
                  <Tag className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Category</span>
                    <span className="block text-sm text-gray-900">{currentTicket.category}</span>
                  </div>
                </div>

                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Priority</span>
                    <span className="block text-sm text-gray-900">{currentTicket.priority}</span>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Created</span>
                    <span className="block text-sm text-gray-900">
                      {currentTicket.createdAt ? format(new Date(currentTicket.createdAt), 'PPP') : '-'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Expected Completion</span>
                    <span className="block text-sm text-gray-900">
                      {currentTicket.expectedCompletionDate ? format(new Date(currentTicket.expectedCompletionDate), 'PPP') : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="border rounded-md p-4 bg-gray-50">
              <h4 className="font-medium text-gray-700 mb-3">Created By</h4>
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full h-10 w-10 flex items-center justify-center text-blue-600 font-medium">
                  {currentTicket.createdBy?.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {currentTicket.createdBy?.firstName} {currentTicket.createdBy?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">ID: {currentTicket.createdBy?.id.substring(0, 8)}...</div>
                </div>
              </div>

              {currentTicket.assignedTo && (
                <>
                  <h4 className="font-medium text-gray-700 mb-3">Assigned To</h4>
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full h-10 w-10 flex items-center justify-center text-green-600 font-medium">
                      {currentTicket.assignedTo?.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
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
        <div className="px-6 py-5 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-3">Description</h4>
          <div className="bg-gray-50 rounded-md p-4 whitespace-pre-wrap text-gray-800">
            {currentTicket.description}
          </div>
        </div>

        {/* Error Message */}
        {showError && error && (
          <div className="mx-6 my-3 bg-red-50 border-l-4 border-red-500 p-4 animate-fadeIn">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(canUpdateStatus() || canEscalateToL2() || canSetCriticalValue() ||
          canEscalateToL3() || canAddAction() || canResolve()) && (
            <div className="px-6 py-5 border-t border-gray-200 flex flex-wrap gap-3">
              {canUpdateStatus() && user?.role === 'L1_AGENT' && (
                <div className="dropdown relative">
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={<ChevronDown size={16} />}
                    onClick={() => setShowActions(!showActions)}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    Status
                  </Button>
                  {showActions && (
                    <div className="dropdown-content absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 transition-opacity duration-200 ease-in-out animate-fadeIn">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => handleStatusUpdate('ATTENDING')}
                          disabled={currentTicket.status === 'ATTENDING'}
                        >
                          Mark as Attending (Fixing this)
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => handleStatusUpdate('COMPLETED')}
                          disabled={currentTicket.status === 'COMPLETED'}
                        >
                          Mark as Completed
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {canEscalateToL2() && (
                <Button
                  variant="warning"
                  size="sm"
                  leftIcon={<ArrowUpCircle size={16} />}
                  onClick={() => setShowEscalationForm(!showEscalationForm)}
                  className="bg-orange-500 hover:bg-orange-600 transition-colors"
                >
                  Escalate to L2
                </Button>
              )}

              {canSetCriticalValue() && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCriticalValueForm(!showCriticalValueForm)}
                  className="bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Set Critical Value
                </Button>
              )}

              {canEscalateToL3() && (
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<ArrowUpCircle size={16} />}
                  onClick={() => setShowEscalationForm(!showEscalationForm)}
                  className="bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Escalate to L3
                </Button>
              )}

              {canAddAction() && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<MessageCircle size={16} />}
                  onClick={() => setShowActions(!showActions)}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Add Action
                </Button>
              )}

              {canResolve() && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setShowResolutionForm(!showResolutionForm)}
                  className="bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  Resolve Ticket
                </Button>
              )}
            </div>
          )}

        {/* Escalation Form (L1->L2 or L2->L3) */}
        {showEscalationForm && (
          <div className="px-6 py-5 border-t border-gray-200 animate-fadeIn">
            <h4 className="font-medium text-gray-700 mb-3">
              {canEscalateToL2() ? 'Escalate to L2 Support' : 'Escalate to L3 Support'}
            </h4>
            <form onSubmit={canEscalateToL2() ? handleEscalateToL2 : handleEscalateToL3}>
              <div className="mb-4">
                <label htmlFor="escalationNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Escalation Notes
                </label>
                <textarea
                  id="escalationNotes"
                  rows={4}
                  value={escalationNotes}
                  onChange={(e) => setEscalationNotes(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200"
                  placeholder="Explain why this ticket needs to be escalated..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEscalationForm(false)}
                  className="hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={canEscalateToL2() ? "warning" : "danger"}
                  size="sm"
                  isLoading={isLoading}
                  className={`${canEscalateToL2() ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-600 hover:bg-red-700'} transition-colors`}
                >
                  Escalate
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Critical Value Form (L2) */}
        {showCriticalValueForm && (
          <div className="px-6 py-5 border-t border-gray-200 animate-fadeIn">
            <h4 className="font-medium text-gray-700 mb-3">Set Critical Value</h4>
            <form onSubmit={handleSetCriticalValue}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Critical Value
                </label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <input
                      id="critical-c1"
                      name="criticalValue"
                      type="radio"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      value="C1"
                      checked={selectedCriticalValue === 'C1'}
                      onChange={() => setSelectedCriticalValue('C1')}
                      required
                    />
                    <label htmlFor="critical-c1" className="ml-3">
                      <span className="block text-sm font-medium text-gray-700">C1 (Critical)</span>
                      <span className="block text-sm text-gray-500">System down or significantly impacted</span>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="critical-c2"
                      name="criticalValue"
                      type="radio"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      value="C2"
                      checked={selectedCriticalValue === 'C2'}
                      onChange={() => setSelectedCriticalValue('C2')}
                    />
                    <label htmlFor="critical-c2" className="ml-3">
                      <span className="block text-sm font-medium text-gray-700">C2 (Major)</span>
                      <span className="block text-sm text-gray-500">Partial feature issue or limited impact</span>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="critical-c3"
                      name="criticalValue"
                      type="radio"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      value="C3"
                      checked={selectedCriticalValue === 'C3'}
                      onChange={() => setSelectedCriticalValue('C3')}
                    />
                    <label htmlFor="critical-c3" className="ml-3">
                      <span className="block text-sm font-medium text-gray-700">C3 (Minor)</span>
                      <span className="block text-sm text-gray-500">Minor problem or inquiry</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCriticalValueForm(false)}
                  className="hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  isLoading={isLoading}
                  disabled={!selectedCriticalValue}
                  className="bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Add Action Form (L2/L3) */}
        {showActions && canAddAction() && (
          <div className="px-6 py-5 border-t border-gray-200 animate-fadeIn">
            <h4 className="font-medium text-gray-700 mb-3">Add Action</h4>
            <form onSubmit={handleAddAction}>
              <div className="mb-4">
                <label htmlFor="actionType" className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <input
                  id="actionType"
                  type="text"
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200"
                  placeholder="e.g., Investigation, Fix Attempt, Configuration Change"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="actionNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="actionNotes"
                  rows={4}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200"
                  placeholder="Describe the action taken..."
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="statusChange" className="block text-sm font-medium text-gray-700 mb-1">
                  Status Change (Optional)
                </label>
                <select
                  id="statusChange"
                  value={statusChange}
                  onChange={(e) => setStatusChange(e.target.value as TicketStatus | '')}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200"
                >
                  <option value="">No Status Change</option>
                  <option value="COMPLETED">COMPLETED</option>
                  {currentTicket.status === 'ESCALATED_L3' && (
                    <option value="RESOLVED">RESOLVED</option>
                  )}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActions(false)}
                  className="hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Add Action
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Resolution Form (L3) */}
        {showResolutionForm && (
          <div className="px-6 py-5 border-t border-gray-200 animate-fadeIn">
            <h4 className="font-medium text-gray-700 mb-3">Resolve Ticket</h4>
            <form onSubmit={handleResolveTicket}>
              <div className="mb-4">
                <label htmlFor="resolutionNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Notes
                </label>
                <textarea
                  id="resolutionNotes"
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200"
                  placeholder="Provide details about how the issue was resolved..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResolutionForm(false)}
                  className="hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  size="sm"
                  isLoading={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  Resolve Ticket
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Ticket History */}
        <div className="px-6 py-5 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <h4 className="font-medium text-gray-700">Ticket History</h4>
            <div className="flex-grow border-t border-gray-200 ml-4"></div>
          </div>

          {currentTicket.actions && currentTicket.actions.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {currentTicket.actions?.map((action: TicketAction, actionIdx: number) => (
                  <li key={action.id}>
                    <div className="relative pb-8">
                      {actionIdx !== currentTicket.actions?.length! - 1 ? (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        ></span>
                      ) : null}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
                            <span className="text-sm font-medium text-gray-700">
                              {action.user?.firstName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">{action.user?.firstName} {action.user?.lastName}</span>
                              <span className="ml-2 text-gray-500">({action.user?.role})</span>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {format(new Date(action.createdAt), 'PPp')}
                            </p>
                          </div>
                          <div className="mt-2 bg-gray-50 rounded-md p-3">
                            <div className="text-sm font-medium text-gray-900 mb-1">
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
            <p className="text-gray-500 text-center py-4">No actions have been recorded yet.</p>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default TicketDetail;