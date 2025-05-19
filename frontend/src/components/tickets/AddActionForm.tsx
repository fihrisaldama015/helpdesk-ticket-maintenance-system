import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useAuthStore from "@/store/authStore";
import { TicketStatus } from "@/types";
import { ActivitySquare, Clipboard, Loader2, Plus, PlusCircle, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import useTicketStore from "@/store/ticketStore";

interface AddActionFormProps {
  ticketId: string | undefined;
  setShowActions: (show: boolean) => void;
}

const AddActionForm: React.FC<AddActionFormProps> = ({
  ticketId,
  setShowActions,
}) => {
  const { user } = useAuthStore();
  const { addTicketAction, isLoading } = useTicketStore();
  const [actionType, setActionType] = useState<string>('');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [statusChange, setStatusChange] = useState<TicketStatus>('ATTENDING');

  const handleAddAction = async (e: React.FormEvent, actionNotes: string, actionType: string, statusChange: TicketStatus | '') => {
    e.preventDefault();
    if (ticketId && actionNotes.trim() && actionType) {
      const status = statusChange ? statusChange as TicketStatus : undefined;
      const success = await addTicketAction(ticketId, actionType, actionNotes, status);
      if (success) {
        setShowActions(false);
      }
    }
  };

  return (
    <form className="px-6 py-5 border-t border-blue-100 animate-fadeIn bg-blue-50" data-testid="add-action-form">
      <h4 className="font-medium text-blue-700 mb-4 flex items-center">
        <PlusCircle className="h-5 w-5 mr-2 text-blue-500" />
        Add Action
      </h4>

      <div className="bg-white p-5 rounded-lg shadow-md border border-blue-100 transform transition-all duration-300 hover:shadow-lg" data-testid="form-card">
        <div className="space-y-5" data-testid="form-fields-container">
          <div className="group" data-testid="action-type-field">
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

          <div className="group" data-testid="description-field">
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

          <div className="group" data-testid="status-change-field">
            <label htmlFor="statusChange" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ActivitySquare className="h-4 w-4 text-blue-500" />
              Status Change
            </label>
            <Select value={statusChange as TicketStatus} onValueChange={(value) => setStatusChange(value as TicketStatus)}>
              <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-300 rounded-lg py-2.5 transition-all duration-300 bg-gray-50 hover:bg-white">
                <SelectValue placeholder="No Status Change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATTENDING" data-testid="status-attending">ATTENDING (Fixing this)</SelectItem>
                {user?.role === 'L2_SUPPORT' && <SelectItem value="COMPLETED" data-testid="status-completed">COMPLETED (Fixed)</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActions(false)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all border-blue-200"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={(e) => handleAddAction(e, actionNotes, actionType, statusChange)}
              disabled={isLoading || (!actionType || actionType.trim() === '') || (!actionNotes || actionNotes.trim() === '')}
              className="bg-blue-600 text-white hover:bg-blue-700 transition-all"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {isLoading ? "Adding..." : "Add Action"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddActionForm;