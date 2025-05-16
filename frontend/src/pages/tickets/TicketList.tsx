import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Filter, Search } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import useAuthStore from '../../store/authStore';
import useTicketStore from '../../store/ticketStore';
import { TicketStatus, TicketPriority, TicketCategory, TicketFilter } from '../../types';

const TicketList: React.FC = () => {
  const { user } = useAuthStore();
  const { tickets, isLoading, getTickets, getMyTickets, setFilters, filters } = useTicketStore();
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TicketStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Initial load of tickets based on user role
    if (user?.role === 'L1') {
      getMyTickets();
    } else {
      getTickets();
    }
  }, [getTickets, getMyTickets, user?.role]);

  const handleStatusFilterChange = (status: TicketStatus) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const handlePriorityFilterChange = (priority: TicketPriority) => {
    if (priorityFilter.includes(priority)) {
      setPriorityFilter(priorityFilter.filter(p => p !== priority));
    } else {
      setPriorityFilter([...priorityFilter, priority]);
    }
  };

  const handleCategoryFilterChange = (category: TicketCategory) => {
    if (categoryFilter.includes(category)) {
      setCategoryFilter(categoryFilter.filter(c => c !== category));
    } else {
      setCategoryFilter([...categoryFilter, category]);
    }
  };

  const applyFilters = () => {
    const newFilters: TicketFilter = {
      status: statusFilter.length > 0 ? statusFilter : undefined,
      priority: priorityFilter.length > 0 ? priorityFilter : undefined,
      category: categoryFilter.length > 0 ? categoryFilter : undefined,
      search: searchQuery || undefined,
      page: currentPage,
      limit: itemsPerPage
    };
    
    setFilters(newFilters);
    
    if (user?.role === 'L1') {
      getMyTickets(newFilters);
    } else {
      getTickets(newFilters);
    }
  };

  const resetFilters = () => {
    setStatusFilter([]);
    setPriorityFilter([]);
    setCategoryFilter([]);
    setSearchQuery('');
    setCurrentPage(1);
    setFilters({});
    
    if (user?.role === 'L1') {
      getMyTickets({});
    } else {
      getTickets({});
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Update filter with new page
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    
    if (user?.role === 'L1') {
      getMyTickets(newFilters);
    } else {
      getTickets(newFilters);
    }
  };

  return (
    <Layout requireAuth>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {user?.role === 'L1' ? 'My Tickets' : 'All Tickets'}
          </h3>
          <div className="flex space-x-3">
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {user?.role === 'L1' && (
              <Link to="/tickets/create">
                <Button 
                  variant="primary" 
                  size="sm"
                  leftIcon={<PlusCircle size={16} />}
                >
                  New Ticket
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {showFilters && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {(['NEW', 'ATTENDING', 'COMPLETED', 'ESCALATED_L2', 'ESCALATED_L3', 'RESOLVED'] as TicketStatus[]).map(status => (
                    <div key={status} className="flex items-center">
                      <input
                        id={`status-${status}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={statusFilter.includes(status)}
                        onChange={() => handleStatusFilterChange(status)}
                      />
                      <label htmlFor={`status-${status}`} className="ml-2 block text-sm text-gray-700">
                        {status.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="space-y-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as TicketPriority[]).map(priority => (
                    <div key={priority} className="flex items-center">
                      <input
                        id={`priority-${priority}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={priorityFilter.includes(priority)}
                        onChange={() => handlePriorityFilterChange(priority)}
                      />
                      <label htmlFor={`priority-${priority}`} className="ml-2 block text-sm text-gray-700">
                        {priority.charAt(0) + priority.slice(1).toLowerCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="space-y-2">
                  {(['HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'OTHER'] as TicketCategory[]).map(category => (
                    <div key={category} className="flex items-center">
                      <input
                        id={`category-${category}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={categoryFilter.includes(category)}
                        onChange={() => handleCategoryFilterChange(category)}
                      />
                      <label htmlFor={`category-${category}`} className="ml-2 block text-sm text-gray-700">
                        {category.charAt(0) + category.slice(1).toLowerCase()}
                      </label>
                    </div>
                  ))}
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
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="mt-4 flex space-x-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
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
                      Priority
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    {(user?.role === 'L2' || user?.role === 'L3') && (
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Critical
                      </th>
                    )}
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Completion
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.id.substring(0, 8)}...
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <Link to={`/tickets/${ticket.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-900">
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <StatusBadge priority={ticket.priority} />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.category}
                      </td>
                      {(user?.role === 'L2' || user?.role === 'L3') && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          {ticket.criticalValue ? (
                            <StatusBadge criticalValue={ticket.criticalValue} />
                          ) : (
                            <span className="text-gray-400 text-sm">Not set</span>
                          )}
                        </td>
                      )}
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.expectedCompletionDate).toLocaleDateString()}
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
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                          currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        ← Prev
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={tickets.length < itemsPerPage}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                          tickets.length < itemsPerPage ? 'opacity-50 cursor-not-allowed' : ''
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
              <p className="text-gray-500">No tickets found.</p>
              {user?.role === 'L1' && (
                <div className="mt-4">
                  <Link to="/tickets/create">
                    <Button 
                      variant="primary"
                      leftIcon={<PlusCircle size={16} />}
                    >
                      Create a new ticket
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TicketList;