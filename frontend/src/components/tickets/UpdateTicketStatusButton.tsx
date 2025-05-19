import { Button } from "../ui/button";
import useTicketStore from "@/store/ticketStore";
import { TicketStatus } from "../../types";
import { Play, CheckCircle } from "lucide-react";

const UpdateTicketStatusButton: React.FC = () => {
  const { currentTicket, updateTicketStatus } = useTicketStore();
  const handleUpdateStatus = async (status: TicketStatus) => {
    if (currentTicket?.id) {
      await updateTicketStatus(currentTicket.id, status);
    }
  };
  return (
    <>
      {currentTicket && currentTicket.status === 'NEW' && (
        <Button
          size="sm"
          onClick={() => handleUpdateStatus('ATTENDING')}
          className="bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105"
        >
          <Play size={16} />
          Mark as Attending (Fixing this)
        </Button>
      )}
      {currentTicket && currentTicket.status === 'ATTENDING' && (
        <Button
          size="sm"
          onClick={() => handleUpdateStatus('COMPLETED')}
          className="bg-green-600 hover:bg-green-700 transition-all hover:scale-105"
        >
          <CheckCircle size={16} />
          Mark as Completed
        </Button>
      )}
    </>
  )
}

export default UpdateTicketStatusButton