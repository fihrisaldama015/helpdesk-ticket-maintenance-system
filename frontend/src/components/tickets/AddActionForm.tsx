import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useAuthStore from "@/store/authStore";
import { Ticket, TicketStatus } from "@/types";
import { ActivitySquare, Clipboard, Loader2, Plus, PlusCircle, X } from "lucide-react";
import React, { useState } from "react";

interface AddActionFormProps {
  isLoading: boolean;
  handleAddAction: (e: React.FormEvent, actionNotes: string, actionType: string, statusChange: TicketStatus | '') => void;
  setShowActions: (show: boolean) => void;
}

const AddActionForm: React.FC<AddActionFormProps> = ({
  setShowActions,
  handleAddAction,
  isLoading,
}) => {
  const { user } = useAuthStore();
  const [actionType, setActionType] = useState<string>('');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [statusChange, setStatusChange] = useState<TicketStatus>('ATTENDING');

  return (
    <div className="px-6 py-5 border-t border-blue-100 animate-fadeIn bg-blue-50">
      <h4 className="font-medium text-blue-700 mb-4 flex items-center">
        <PlusCircle className="h-5 w-5 mr-2 text-blue-500" />
        Add Action
      </h4>

      <div className="bg-white p-5 rounded-lg shadow-md border border-blue-100 transform transition-all duration-300 hover:shadow-lg">
        <div className="space-y-5">
          <div className="group">
            <label htmlFor="actionType" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clipboard className="h-4 w-4 text-blue-500" />
              Action Type
            </label>
            <div className="relative">
              <input
                id="actionType"
                type="text"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-all duration-300 bg-gray-50 hover:bg-white"
                placeholder="e.g., Investigation, Fix Attempt, Configuration Change"
              />
            </div>
          </div>

          <div className="group">
            <label htmlFor="actionNotes" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clipboard className="h-4 w-4 text-blue-500" />
              Description
            </label>
            <div className="relative">
              <textarea
                id="actionNotes"
                rows={4}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
                placeholder="Describe the action taken..."
              />
            </div>
          </div>

          <div className="group">
            <label htmlFor="statusChange" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ActivitySquare className="h-4 w-4 text-blue-500" />
              Status Change (Optional)
            </label>
            <Select value={statusChange as TicketStatus} onValueChange={(value) => setStatusChange(value as TicketStatus)}>
              <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-300 rounded-lg py-2.5 transition-all duration-300 bg-gray-50 hover:bg-white">
                <SelectValue placeholder="No Status Change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATTENDING">ATTENDING</SelectItem>
                {user?.role === 'L2_SUPPORT' && <SelectItem value="ESCALATED_L2">ESCALATED_L2</SelectItem>}
                {user?.role === 'L2_SUPPORT' && <SelectItem value="COMPLETED">COMPLETED</SelectItem>}
                {user?.role === 'L3_SUPPORT' && <SelectItem value="ESCALATED_L3">ESCALATED_L3</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowActions(false)}
              className="px-4 py-2 rounded-md text-sm font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => handleAddAction(e, actionNotes, actionType, statusChange)}
              disabled={isLoading || !actionType || !actionNotes}
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-blue-200 disabled:text-blue-600"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {isLoading ? "Adding..." : "Add Action"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddActionForm;