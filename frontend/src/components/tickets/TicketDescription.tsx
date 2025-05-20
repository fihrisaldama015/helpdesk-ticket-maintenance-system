import { format } from "date-fns";
import { AlertCircle, ArrowLeft, Calendar, Clipboard, Clock, FileText, Tag, Ticket as TicketIcon, UserCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../StatusBadge";
import { Button } from "../ui/button";
import { Ticket } from "@/types";

interface TicketDescriptionProps {
  currentTicket: Ticket;
  userRole: string | undefined;
}

const TicketDescription: React.FC<TicketDescriptionProps> = ({ currentTicket, userRole }) => {
  const navigate = useNavigate();
  return (
    <>
      < div className="px-6 py-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white" >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center">
            <div data-testid="ticket-icon-container" className="mr-3 bg-blue-100 p-2 rounded-full">
              <TicketIcon data-testid="ticket-icon" className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-1 transition-all duration-300 hover:text-blue-700">
                {currentTicket.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                <StatusBadge data-testid="status-badge" status={currentTicket.status} />
                <StatusBadge data-testid="priority-badge" priority={currentTicket.priority} />
                {
                  <StatusBadge data-testid="critical-value-badge" criticalValue={currentTicket.criticalValue} />
                }
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => userRole === 'L1_AGENT' ? navigate('/tickets') : navigate('/escalated')}
              className="hover:bg-blue-50 transition-colors duration-300 flex items-center gap-2 border-blue-200"
            >
              <ArrowLeft size={16} />
              {userRole === 'L1_AGENT' ? 'Back to Tickets' : 'Back to Escalated Tickets'}
            </Button>
          </div>
        </div>
      </div >

      {/* Ticket Information */}
      < div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6" >
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

              <div className="flex items-start group" data-testid="expected-completion-section">
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
      </div >

      {/* Ticket Description */}
      < div className="px-6 py-5 border-t border-blue-100" >
        <h4 className="font-medium text-blue-700 mb-3 flex items-center">
          <FileText className="h-4 w-4 mr-2 text-blue-500" />
          Description
        </h4>
        <div className="bg-blue-50 rounded-md p-4 whitespace-pre-wrap text-gray-800 border border-blue-100 transition-all duration-300 hover:shadow-md">
          {currentTicket.description}
        </div>
      </div >
    </>
  );
};

export default TicketDescription;