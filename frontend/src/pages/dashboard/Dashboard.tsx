import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, Loader, AlertTriangle, CheckCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import useTicketStore from '../../store/ticketStore';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { tickets, getMyTickets, isLoading, setFilters } = useTicketStore();

  useEffect(() => {
    // Reset filters and load user's tickets on component mount
    setFilters({});
    getMyTickets();
  }, [getMyTickets, setFilters]);

  // Count tickets by status
  const statusCounts = {
    new: tickets.filter(ticket => ticket.status === 'NEW').length,
    attending: tickets.filter(ticket => ticket.status === 'ATTENDING').length,
    escalated: tickets.filter(ticket =>
      ticket.status === 'ESCALATED_L2' || ticket.status === 'ESCALATED_L3'
    ).length,
    completed: tickets.filter(ticket =>
      ticket.status === 'COMPLETED' || ticket.status === 'RESOLVED'
    ).length,
  };

  // Get recently assigned tickets (max 5)
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <Layout requireAuth>
      <div className="bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-xl mb-6 transition-all duration-300 hover:shadow-xl">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-white via-blue-50 to-white">
          <h3 className="text-xl leading-6 w-fit font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">
            Welcome, {user?.firstName} {user?.lastName}!
          </h3>
          <p className="mt-1 text-sm font-medium text-gray-600">
            {user?.role === 'L1_AGENT' && 'Helpdesk Agent (L1)'}
            {user?.role === 'L2_SUPPORT' && 'Technical Support (L2)'}
            {user?.role === 'L3_SUPPORT' && 'Advanced Support (L3)'}
          </p>
        </div>
        <div className="px-6 py-5">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-gray-700">
              Your dashboard
            </h4>
            {user?.role === 'L1_AGENT' && (
              <Link to="/tickets/create" className="transform hover:scale-105 transition-transform duration-200">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />}
                  className="group hover:shadow-md transition-all duration-200"
                >
                  New Ticket
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 ring-1 ring-gray-200 overflow-hidden shadow-md rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform cursor-pointer">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-blue-600 transition-transform duration-500 hover:rotate-12" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-blue-700 truncate">New Tickets</dt>
                      <dd>
                        <div className="text-2xl font-bold text-blue-900">{statusCounts.new}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 ring-1 ring-gray-200 overflow-hidden shadow-md rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform cursor-pointer">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-full">
                    <Loader className="h-6 w-6 text-yellow-600 animate-spin-slow" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-yellow-700 truncate">In Progress</dt>
                      <dd>
                        <div className="text-2xl font-bold text-yellow-900">{statusCounts.attending}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 ring-1 ring-gray-200 overflow-hidden shadow-md rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform cursor-pointer">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600 transition-transform duration-500 hover:-translate-y-1" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-red-700 truncate">Escalated</dt>
                      <dd>
                        <div className="text-2xl font-bold text-red-900">{statusCounts.escalated}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 ring-1 ring-gray-200 overflow-hidden shadow-md rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform cursor-pointer">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600 transition-transform duration-500 hover:scale-110" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-green-700 truncate">Completed</dt>
                      <dd>
                        <div className="text-2xl font-bold text-green-900">{statusCounts.completed}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-white via-blue-50 to-white">
          <h3 className="text-xl leading-6 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">
            My Working Tickets
          </h3>
        </div>
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 shadow-md"></div>
              <span className="ml-3 text-blue-600 font-medium">Loading tickets...</span>
            </div>
          ) : recentTickets.length > 0 ? (
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
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-blue-50 transition-colors duration-150 ease-in-out">
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                        {ticket.id.substring(0, 8)}...
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <Link to={`/tickets/detail/${ticket.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline">
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${ticket.status === 'NEW' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                          ticket.status === 'ATTENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                            ticket.status === 'COMPLETED' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                              ticket.status === 'RESOLVED' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                                'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${ticket.priority === 'LOW' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' :
                          ticket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                            'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(ticket.updatedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center bg-blue-50 rounded-xl shadow-inner">
              <p className="text-gray-600 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" /> No recent tickets found.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            {user?.role === 'L1_AGENT' ? (
              <Link to="/tickets" className="inline-block transform hover:scale-105 transition-transform duration-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 shadow-sm hover:shadow"
                >
                  View all tickets
                </Button>
              </Link>
            ) : (
              <Link to="/escalated" className="inline-block transform hover:scale-105 transition-transform duration-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 shadow-sm hover:shadow"
                >
                  View escalated tickets
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;