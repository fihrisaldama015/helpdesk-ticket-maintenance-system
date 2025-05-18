import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../../../components/StatusBadge';
import { TicketStatus, TicketPriority, CriticalValue } from '../../../types';

describe('StatusBadge Component', () => {
  it('renders status badges correctly', () => {
    const statuses: TicketStatus[] = ['NEW', 'ATTENDING', 'COMPLETED', 'ESCALATED_L2', 'ESCALATED_L3', 'RESOLVED'];
    
    statuses.forEach(status => {
      const { rerender } = render(<StatusBadge status={status} />);
      expect(screen.getByText(status.replace('_', ' '))).toBeInTheDocument();
      rerender(<></>);
    });
  });

  it('renders priority badges correctly', () => {
    const priorities: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
    
    priorities.forEach(priority => {
      const { rerender } = render(<StatusBadge priority={priority} />);
      expect(screen.getByText(`${priority.charAt(0) + priority.slice(1).toLowerCase()} Priority`)).toBeInTheDocument();
      rerender(<></>);
    });
  });

  it('renders critical value badges correctly', () => {
    const criticalValues: CriticalValue[] = ['C1', 'C2', 'C3'];
    const criticalLabels = {
      'C1': 'Critical (C1)',
      'C2': 'Major (C2)',
      'C3': 'Minor (C3)'
    };
    
    criticalValues.forEach(value => {
      const { rerender } = render(<StatusBadge criticalValue={value} />);
      expect(screen.getByText(criticalLabels[value])).toBeInTheDocument();
      rerender(<></>);
    });
  });

  it('applies custom className', () => {
    render(<StatusBadge status="NEW" className="custom-class" />);
    expect(screen.getByText('New')).toHaveClass('custom-class');
  });

  it('returns null when no props are provided', () => {
    const { container } = render(<StatusBadge />);
    expect(container.firstChild).toBeNull();
  });
});