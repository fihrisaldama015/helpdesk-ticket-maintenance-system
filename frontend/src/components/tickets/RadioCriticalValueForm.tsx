import { CriticalValue } from "@/types";
import { AlertOctagon, AlertTriangle, Info, Loader2, Save, Shield, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useState } from "react";
import { Button } from "../ui/button";
import useTicketStore from "@/store/ticketStore";

interface RadioCriticalValueFormProps {
  ticketId: string | undefined;
  setShowCriticalValueForm: (show: boolean) => void;
}

const RadioCriticalValueForm = ({
  ticketId,
  setShowCriticalValueForm,
}: RadioCriticalValueFormProps) => {
  const { setCriticalValue, isLoading } = useTicketStore();
  const [selectedCriticalValue, setSelectedCriticalValue] = useState<CriticalValue>("NONE");
  const handleSetCriticalValue = async (e: React.FormEvent, selectedCriticalValue: CriticalValue) => {
    e.preventDefault();
    if (ticketId && selectedCriticalValue) {
      const success = await setCriticalValue(ticketId, selectedCriticalValue);
      if (success) {
        setShowCriticalValueForm(false);
      }
    }
  };
  return (
    <div className="px-6 py-5 border-t border-blue-100 animate-fadeIn bg-blue-50">
      <h4 className="font-medium text-blue-700 mb-4 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-blue-500" />
        Set Critical Value
      </h4>

      <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100 transition-all duration-300 hover:shadow-lg">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Critical Value
          </label>

          <RadioGroup
            value={selectedCriticalValue}
            onValueChange={(value) => setSelectedCriticalValue(value as CriticalValue)}
            className="space-y-3"
          >
            {/* Hidden radio inputs for form submission and accessibility */}
            <RadioGroupItem value="C1" id="critical-c1" data-testid="critical-c1" className="sr-only" />
            <RadioGroupItem value="C2" id="critical-c2" data-testid="critical-c2" className="sr-only" />
            <RadioGroupItem value="C3" id="critical-c3" data-testid="critical-c3" className="sr-only" />
            
            {/* C1 Option */}
            <div
              data-testid="critical-c1-container"
              className={`flex items-start p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                selectedCriticalValue === 'C1'
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCriticalValue('C1')}
            >
              <div className="w-full flex items-start">
                <div className="flex-1">
                  <span className={`block text-sm font-medium ${
                    selectedCriticalValue === 'C1' ? 'text-red-600' : 'text-gray-800'
                  }`}>C1 (Critical)</span>
                  <span className="block text-sm text-gray-500 mt-1">System down or significantly impacted</span>
                </div>
                <AlertOctagon 
                  className={`h-6 w-6 flex-shrink-0 transition-all duration-200 ${
                    selectedCriticalValue === 'C1' ? 'text-red-600' : 'text-gray-300'
                  }`} 
                />
              </div>
            </div>

            {/* C2 Option */}
            <div
              data-testid="critical-c2-container"
              className={`flex items-start p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                selectedCriticalValue === 'C2'
                  ? 'border-orange-200 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCriticalValue('C2')}
            >
              <div className="w-full flex items-start">
                <div className="flex-1">
                  <span className={`block text-sm font-medium ${
                    selectedCriticalValue === 'C2' ? 'text-orange-600' : 'text-gray-800'
                  }`}>C2 (Major)</span>
                  <span className="block text-sm text-gray-500 mt-1">Partial feature issue or limited impact</span>
                </div>
                <AlertTriangle 
                  className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                    selectedCriticalValue === 'C2' ? 'text-orange-500' : 'text-gray-300'
                  }`} 
                />
              </div>
            </div>

            {/* C3 Option */}
            <div
              data-testid="critical-c3-container"
              className={`flex items-start p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                selectedCriticalValue === 'C3'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCriticalValue('C3')}
            >
              <div className="w-full flex items-start">
                <div className="flex-1">
                  <span className={`block text-sm font-medium ${
                    selectedCriticalValue === 'C3' ? 'text-yellow-600' : 'text-gray-800'
                  }`}>C3 (Minor)</span>
                  <span className="block text-sm text-gray-500 mt-1">Minor problem or inquiry</span>
                </div>
                <Info 
                  className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                    selectedCriticalValue === 'C3' ? 'text-yellow-500' : 'text-gray-300'
                  }`} 
                />
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCriticalValueForm(false)}
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 transition-all"
          >
            <X size={16} />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={(e) => handleSetCriticalValue(e, selectedCriticalValue)}
            disabled={selectedCriticalValue === 'NONE' || isLoading}
            className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white transition-all"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RadioCriticalValueForm;