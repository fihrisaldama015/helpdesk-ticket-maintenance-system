import { ArrowUpCircle, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import useTicketStore from "@/store/ticketStore";

interface EscalationFormProps {
  ticketId: string | undefined;
  canEscalateToL2: () => boolean;
  setShowEscalationForm: (show: boolean) => void;
}

const EscalationForm: React.FC<EscalationFormProps> = ({
  ticketId,
  canEscalateToL2,
  setShowEscalationForm,
}) => {
  const { currentTicket, isLoading } = useTicketStore();
  const { escalateToL2, escalateToL3 } = useTicketStore();
  const [escalationNotes, setEscalationNotes] = useState<string>('');

  const handleEscalateToL2 = async (e: React.FormEvent, escalationNotes: string) => {
    e.preventDefault();
    if (ticketId && escalationNotes.trim()) {
      const success = await escalateToL2(ticketId, escalationNotes);
      if (success) {
        setShowEscalationForm(false);
      }
    }
  };
  const handleEscalateToL3 = async (e: React.FormEvent, escalationNotes: string) => {
    e.preventDefault();
    if (ticketId && escalationNotes.trim() && currentTicket) {
      const success = await escalateToL3(ticketId, escalationNotes, currentTicket.criticalValue || "NONE");
      if (success) {
        setShowEscalationForm(false);
      }
    }
  };
  return (
    <div className="px-6 py-5 border-t border-blue-100 animate-fadeIn bg-blue-50">
      <h4 className="font-medium text-blue-700 mb-3 flex items-center">
        <ArrowUpCircle className="h-4 w-4 mr-2 text-blue-500" />
        {canEscalateToL2() ? 'Escalate to L2 Support' : 'Escalate to L3 Support'}
      </h4>
      <form onSubmit={(e) => canEscalateToL2() ? handleEscalateToL2(e, escalationNotes) : handleEscalateToL3(e, escalationNotes)} className="bg-white p-4 rounded-md shadow-sm border border-blue-100">
        <div className="mb-4">
          <label htmlFor="escalationNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Escalation Notes
          </label>
          <textarea
            id="escalationNotes"
            rows={4}
            value={escalationNotes}
            onChange={(e) => setEscalationNotes(e.target.value)}
            className="shadow-sm outline-none focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200"
            placeholder="Explain why this ticket needs to be escalated..."
            required
          />
        </div>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEscalationForm(false)}
            className="hover:bg-red-50 transition-all border-red-200 text-red-600 hover:text-red-700"
          >
            <X size={16} />
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !escalationNotes}
            className={`${canEscalateToL2() ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-600 hover:bg-red-700'} transition-all`}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <ArrowUpCircle size={16} />
            Escalate
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EscalationForm;