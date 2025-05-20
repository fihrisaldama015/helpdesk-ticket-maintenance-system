import { Filter, PlusCircle, Search, AlertTriangle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Button } from '../../components/ui/button';
import StatusBadge from '../../components/StatusBadge';
import useAuthStore from '../../store/authStore';
import useTicketStore from '../../store/ticketStore';
import { TicketCategory, TicketFilter, TicketPriority, TicketStatus } from '../../types';

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
    if (user?.role === 'L1_AGENT') {
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

    if (user?.role === 'L1_AGENT') {
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

    if (user?.role === 'L1_AGENT') {
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

    if (user?.role === 'L1_AGENT') {
      getMyTickets(newFilters);
    } else {
      getTickets(newFilters);
    }
  };

  return (
    <Layout requireAuth>
      <div className="bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-white via-blue-50 to-white flex justify-between items-center">
          <div>
            <h3 className="text-xl leading-6 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">
              {user?.role === 'L1_AGENT' ? 'My Tickets' : 'All Tickets'}
            </h3>
            <p className="mt-1 text-sm font-medium text-gray-600">
              {user?.role === 'L1_AGENT' ? 'Tickets assigned to you' : 'All tickets in the system'}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className={`mr-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : 'rotate-0'}`} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {user?.role === 'L1_AGENT' && (
              <Link to="/tickets/create" className="transform hover:scale-105 active:scale-95 transition-all">
                <Button
                  className="group transition-all bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                >
                  <PlusCircle size={16} className="group-hover:rotate-90" />
                  New Ticket
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="p-6 bg-gradient-to-b from-blue-50 to-white border-b border-gray-200 transform transition-all duration-500">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {/* Status Filter */}
              <div className="transform transition-all duration-500 hover:shadow-md p-4 rounded-lg hover:bg-white">
                <label className="block text-sm font-semibold text-blue-700 mb-3">
                  Status
                </label>
                <div className="space-y-2">
                  {Object.values({
                    NEW: 'New',
                    ATTENDING: 'In Progress',
                    ESCALATED_L2: 'Escalated to L2',
                  }).map((status, index) => (
                    <div key={index} className="flex items-center group">
                      <input
                        id={`status-${index}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200 cursor-pointer"
                        checked={statusFilter.includes(Object.keys({
                          NEW: 'New',
                          ATTENDING: 'In Progress',
                          ESCALATED_L2: 'Escalated to L2',
                        })[index] as TicketStatus)}
                        onChange={() => handleStatusFilterChange(Object.keys({
                          NEW: 'New',
                          ATTENDING: 'In Progress',
                          ESCALATED_L2: 'Escalated to L2',
                        })[index] as TicketStatus)}
                      />
                      <label htmlFor={`status-${index}`} className="ml-2 block text-sm text-gray-700 group-hover:text-blue-700 transition-colors duration-200 cursor-pointer">
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div className="transform transition-all duration-500 hover:shadow-md p-4 rounded-lg hover:bg-white">
                <label className="block text-sm font-semibold text-blue-700 mb-3">
                  Priority
                </label>
                <div className="space-y-2">
                  {Object.values({
                    LOW: 'Low',
                    MEDIUM: 'Medium',
                    HIGH: 'High',
                  }).map((priority, index) => (
                    <div key={index} className="flex items-center group">
                      <input
                        id={`priority-${index}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200 cursor-pointer"
                        checked={priorityFilter.includes(Object.keys({
                          LOW: 'Low',
                          MEDIUM: 'Medium',
                          HIGH: 'High',
                        })[index] as TicketPriority)}
                        onChange={() => handlePriorityFilterChange(Object.keys({
                          LOW: 'Low',
                          MEDIUM: 'Medium',
                          HIGH: 'High',
                        })[index] as TicketPriority)}
                      />
                      <label htmlFor={`priority-${index}`} className="ml-2 block text-sm text-gray-700 group-hover:text-blue-700 transition-colors duration-200 cursor-pointer">
                        {priority}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="transform transition-all duration-500 hover:shadow-md p-4 rounded-lg hover:bg-white">
                <label className="block text-sm font-semibold text-blue-700 mb-3">
                  Category
                </label>
                <div className="space-y-2">
                  {Object.values({
                    HARDWARE: 'Hardware',
                    SOFTWARE: 'Software',
                    NETWORK: 'Network',
                    EMAIL: 'Email',
                    ACCOUNT: 'Account',
                    OTHER: 'Other',
                  }).map((category, index) => (
                    <div key={index} className="flex items-center group">
                      <input
                        id={`category-${index}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200 cursor-pointer"
                        checked={categoryFilter.includes(Object.keys({
                          HARDWARE: 'Hardware',
                          SOFTWARE: 'Software',
                          NETWORK: 'Network',
                          EMAIL: 'Email',
                          ACCOUNT: 'Account',
                          OTHER: 'Other',
                        })[index] as TicketCategory)}
                        onChange={() => handleCategoryFilterChange(Object.keys({
                          HARDWARE: 'Hardware',
                          SOFTWARE: 'Software',
                          NETWORK: 'Network',
                          EMAIL: 'Email',
                          ACCOUNT: 'Account',
                          OTHER: 'Other',
                        })[index] as TicketCategory)}
                      />
                      <label htmlFor={`category-${index}`} className="ml-2 block text-sm text-gray-700 group-hover:text-blue-700 transition-colors duration-200 cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Filter */}
              <div className="transform transition-all duration-500 hover:shadow-md p-4 rounded-lg hover:bg-white">
                <label className="block text-sm font-semibold text-blue-700 mb-3">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-blue-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 sm:text-sm transition-all duration-200"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button
                    size="sm"
                    onClick={applyFilters}
                    className="bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='py-5 px-6'>
          {isLoading ? (
            <div className="py-10 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : tickets.length > 0 ? (
            <div className="overflow-x-auto rounded-xl shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-white">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Category
                    </th>
                    {(user?.role === 'L2_SUPPORT' || user?.role === 'L3_SUPPORT') && (
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        Critical Value
                      </th>
                    )}
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-blue-50 transition-colors duration-150 ease-in-out">
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                        {ticket.id.substring(0, 8)}...
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <Link to={`/tickets/detail/${ticket.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline">
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap transform transition-all duration-200 hover:scale-105">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap transform transition-all duration-200 hover:scale-105">
                        <StatusBadge priority={ticket.priority} />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {ticket.category}
                      </td>
                      {(user?.role === 'L2_SUPPORT' || user?.role === 'L3_SUPPORT') && (
                        <td className="px-3 py-4 whitespace-nowrap transform transition-all duration-200 hover:scale-105">
                          {ticket.criticalValue ? (
                            <StatusBadge criticalValue={ticket.criticalValue} />
                          ) : (
                            <span className="text-gray-400 text-sm italic">Not set</span>
                          )}
                        </td>
                      )}
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(ticket.expectedCompletionDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="py-3 px-3 flex items-center justify-between border-t border-gray-200 mt-4">
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
                        className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium transition-colors duration-200 ${currentPage <= 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'}`}
                      >
                        <span className="sr-only">Previous</span>
                        ← Prev
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={tickets.length < itemsPerPage}
                        className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium transition-colors duration-200 ${tickets.length < itemsPerPage
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'}`}
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
            <div className="py-10 text-center bg-blue-50 rounded-xl shadow-inner">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md text-blue-500 mb-4 animate-bounce">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">There are no tickets matching your current filters.</p>
              {user?.role === 'L1_AGENT' && (
                <div className="mt-4">
                  <Link to="/tickets/create" className="transform hover:scale-105 transition-transform duration-200">
                    <Button
                      size="sm"
                      className="group hover:shadow-md transition-all bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                    >
                      <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                      Create a new ticket
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout >
  );
};

export default TicketList;