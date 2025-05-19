import useTicketStore from "@/store/ticketStore";
import { format } from "date-fns";
import { Activity, ClipboardList, Clock, History } from "lucide-react";
import { TicketAction } from "../../types";
import StatusBadge from "../StatusBadge";

const TicketHistory: React.FC = () => {
  const { currentTicket } = useTicketStore();

  return (
    <div className="px-6 py-5 border-t border-blue-100">
      <div className="flex items-center mb-4">
        <h4 className="font-medium text-blue-700 flex items-center">
          <History className="h-4 w-4 mr-2 text-blue-500" />
          Ticket History
        </h4>
        <div className="flex-grow border-t border-blue-200 ml-4"></div>
      </div>

      {currentTicket && currentTicket.actions && currentTicket.actions.length > 0 ? (
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
  )
}

export default TicketHistory
