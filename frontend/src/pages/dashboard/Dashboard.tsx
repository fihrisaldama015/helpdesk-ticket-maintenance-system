import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, Loader, AlertTriangle, CheckCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';
import useTicketStore from '../../store/ticketStore';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { tickets, getMyTickets, isLoading } = useTicketStore();
  console.log('tickets = ', tickets)

  useEffect(() => {
    // Load user's tickets on component mount
    getMyTickets();
  }, [getMyTickets]);

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
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Welcome, {user?.firstName} {user?.lastName}!
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'L1_AGENT' && 'Helpdesk Agent (L1)'}
            {user?.role === 'L2_SUPPORT' && 'Technical Support (L2)'}
            {user?.role === 'L3_SUPPORT' && 'Advanced Support (L3)'}
          </p>
        </div>
        <div className="px-6 py-5">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-md font-medium text-gray-700">
              Your dashboard
            </h4>
            {user?.role === 'L1_AGENT' && (
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">New Tickets</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{statusCounts.new}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Loader className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{statusCounts.attending}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Escalated</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{statusCounts.escalated}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{statusCounts.completed}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Tickets
          </h3>
        </div>
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="py-10 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : recentTickets.length > 0 ? (
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
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.id.substring(0, 8)}...
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <Link to={`/tickets/detail/${ticket.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-900">
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${ticket.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'ATTENDING' ? 'bg-yellow-100 text-yellow-800' :
                              ticket.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                ticket.status === 'RESOLVED' ? 'bg-purple-100 text-purple-800' :
                                  'bg-red-100 text-red-800'
                          }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${ticket.priority === 'LOW' ? 'bg-gray-100 text-gray-800' :
                            ticket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.updatedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-gray-500">No recent tickets found.</p>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link to="/tickets">
              <Button variant="outline" size="sm">
                View all tickets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;