import { Check, CheckSquare, Clipboard, Loader2, X } from "lucide-react";
import { useState } from "react";
import useTicketStore from "@/store/ticketStore";
import { Button } from "../ui/button";

interface ResolutionFormProps {
  ticketId: string | undefined;
  setShowResolutionForm: (show: boolean) => void;
}

const ResolutionForm: React.FC<ResolutionFormProps> = ({
  ticketId,
  setShowResolutionForm,
}) => {
  const { resolveTicket, isLoading } = useTicketStore();
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const handleResolveTicket = async (e: React.FormEvent, resolutionNotes: string) => {
    e.preventDefault();
    if (ticketId && resolutionNotes.trim()) {
      const success = await resolveTicket(ticketId, resolutionNotes);
      if (success) {
        setShowResolutionForm(false);
      }
    }
  };
  return (
    <div className="px-6 py-5 border-t border-emerald-100 animate-fadeIn bg-emerald-50">
      <h4 className="font-medium text-emerald-700 mb-4 flex items-center">
        <CheckSquare className="h-5 w-5 mr-2 text-emerald-500" />
        Resolve Ticket
      </h4>

      <div className="bg-white p-5 rounded-lg shadow-md border border-emerald-100 transform transition-all duration-300 hover:shadow-lg">
        <div className="space-y-5">
          <div className="group">
            <label htmlFor="resolutionNotes" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clipboard className="h-4 w-4 text-emerald-500" />
              Resolution Notes
            </label>
            <div className="relative">
              <textarea
                id="resolutionNotes"
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
                placeholder="Provide details about how the issue was resolved..."
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResolutionForm(false)}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 transition-all"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={(e) => handleResolveTicket(e, resolutionNotes)}
              disabled={isLoading || !resolutionNotes}
              className="bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {isLoading ? "Resolving..." : "Resolve Ticket"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionForm;