import { Check, CheckSquare, Clipboard, Loader2, X } from "lucide-react";
import { useState } from "react";

interface ResolutionFormProps {
  isLoading: boolean;
  handleResolveTicket: (e: React.FormEvent, resolutionNotes: string) => void;
  setShowResolutionForm: (show: boolean) => void;
}

const ResolutionForm: React.FC<ResolutionFormProps> = ({
  isLoading,
  handleResolveTicket,
  setShowResolutionForm,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  return (
    <div className="px-6 py-5 border-t border-emerald-100 animate-fadeIn bg-emerald-50">
      <h4 className="font-medium text-emerald-700 mb-4 flex items-center">
        <CheckSquare className="h-5 w-5 mr-2 text-emerald-500" />
        Resolve Ticket
      </h4>

      <div className="bg-white p-5 rounded-lg shadow-md border border-emerald-100 transform transition-all duration-300 hover:shadow-lg">
        <form onSubmit={(e) => handleResolveTicket(e, resolutionNotes)} className="space-y-5">
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
            <button
              type="button"
              onClick={() => setShowResolutionForm(false)}
              className="px-4 py-2 rounded-md text-sm font-medium border border-emerald-200 text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-300 flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !resolutionNotes}
              className="px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-emerald-200 disabled:text-emerald-600"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {isLoading ? "Resolving..." : "Resolve Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResolutionForm;