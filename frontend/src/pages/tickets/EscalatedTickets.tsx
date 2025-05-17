import { AlertTriangle, Filter, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import useAuthStore from '../../store/authStore';
import useTicketStore from '../../store/ticketStore';
import { CriticalValue, TicketFilter, TicketStatus } from '../../types';

const EscalatedTickets: React.FC = () => {
  const { user } = useAuthStore();
  const { tickets, isLoading, getEscalatedTickets, setFilters, filters } = useTicketStore();

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TicketStatus[]>([]);
  const [criticalValueFilter, setCriticalValueFilter] = useState<CriticalValue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Initial load of escalated tickets
    getEscalatedTickets();
  }, [getEscalatedTickets]);

  const handleStatusFilterChange = (status: TicketStatus) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const handleCriticalValueFilterChange = (criticalValue: CriticalValue) => {
    if (criticalValueFilter.includes(criticalValue)) {
      setCriticalValueFilter(criticalValueFilter.filter(cv => cv !== criticalValue));
    } else {
      setCriticalValueFilter([...criticalValueFilter, criticalValue]);
    }
  };

  const applyFilters = () => {
    const newFilters: TicketFilter = {
      status: statusFilter.length > 0 ? statusFilter : undefined,
      criticalValue: criticalValueFilter.length > 0 ? criticalValueFilter : undefined,
      search: searchQuery || undefined,
      page: currentPage,
      limit: itemsPerPage
    };

    setFilters(newFilters);
    getEscalatedTickets(newFilters);
  };

  const resetFilters = () => {
    setStatusFilter([]);
    setCriticalValueFilter([]);
    setSearchQuery('');
    setCurrentPage(1);
    setFilters({});
    getEscalatedTickets({});
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Update filter with new page
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    getEscalatedTickets(newFilters);
  };

  return (
    <Layout requireAuth allowedRoles={['L2_SUPPORT', 'L3_SUPPORT']}>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Escalated Tickets
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'L2_SUPPORT' ? 'Tickets escalated to L2 support' : 'Critical tickets (C1/C2) escalated to L3 support'}
            </p>
          </div>
          <div>
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-6 bg-gray-50 border-b border-gray-200 animate-fadeIn">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {user?.role === 'L2_SUPPORT' ? (
                    <div className="flex items-center">
                      <input
                        id="status-ESCALATED_L2"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={statusFilter.includes('ESCALATED_L2')}
                        onChange={() => handleStatusFilterChange('ESCALATED_L2')}
                      />
                      <label htmlFor="status-ESCALATED_L2" className="ml-2 block text-sm text-gray-700">
                        Escalated to L2
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <input
                        id="status-ESCALATED_L3"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={statusFilter.includes('ESCALATED_L3')}
                        onChange={() => handleStatusFilterChange('ESCALATED_L3')}
                      />
                      <label htmlFor="status-ESCALATED_L3" className="ml-2 block text-sm text-gray-700">
                        Escalated to L3
                      </label>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      id="status-ATTENDING"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={statusFilter.includes('ATTENDING')}
                      onChange={() => handleStatusFilterChange('ATTENDING')}
                    />
                    <label htmlFor="status-ATTENDING" className="ml-2 block text-sm text-gray-700">
                      Attending
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Critical Value
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="critical-C1"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={criticalValueFilter.includes('C1')}
                      onChange={() => handleCriticalValueFilterChange('C1')}
                    />
                    <label htmlFor="critical-C1" className="ml-2 block text-sm text-gray-700">
                      C1 (Critical)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="critical-C2"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={criticalValueFilter.includes('C2')}
                      onChange={() => handleCriticalValueFilterChange('C2')}
                    />
                    <label htmlFor="critical-C2" className="ml-2 block text-sm text-gray-700">
                      C2 (Major)
                    </label>
                  </div>
                  {user?.role === 'L2_SUPPORT' && (
                    <div className="flex items-center">
                      <input
                        id="critical-C3"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={criticalValueFilter.includes('C3')}
                        onChange={() => handleCriticalValueFilterChange('C3')}
                      />
                      <label htmlFor="critical-C3" className="ml-2 block text-sm text-gray-700">
                        C3 (Minor)
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md transition-all duration-200"
                    placeholder="Search escalated tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="mt-4 flex space-x-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={applyFilters}
                    className="bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-5">
          {isLoading ? (
            <div className="py-10 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : tickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Critical Value
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Escalated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.id.substring(0, 8)}...
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <Link to={`/tickets/${ticket.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-900 transition-colors">
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {ticket.criticalValue ? (
                          <StatusBadge criticalValue={ticket.criticalValue} />
                        ) : (
                          <span className="text-sm text-gray-500 italic">Not set</span>
                        )}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.category}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.actions?.find(a =>
                          a.action.includes('Escalated to')
                        )?.createdAt
                          ? new Date(ticket.actions?.find(a =>
                            a.action.includes('Escalated to')
                          )!.createdAt).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="py-3 flex items-center justify-between border-t border-gray-200 mt-4">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        <span className="sr-only">Previous</span>
                        ← Prev
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={tickets.length < itemsPerPage}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors ${tickets.length < itemsPerPage ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        <span className="sr-only">Next</span>
                        Next →
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No escalated tickets found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {user?.role === 'L2_SUPPORT'
                  ? "There are currently no tickets escalated to L2 support. Tickets will appear here when L1 agents escalate issues they can't resolve."
                  : "There are currently no critical tickets (C1/C2) escalated to L3 support. Tickets will appear here when L2 support escalates critical issues."}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EscalatedTickets;