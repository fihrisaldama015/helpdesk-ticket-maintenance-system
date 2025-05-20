import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusBadge from '../../components/StatusBadge';
import { TicketStatus, TicketPriority, CriticalValue } from '../../types';

describe('StatusBadge', () => {
  const testClassName = 'test-class';

  describe('when displaying status', () => {
    const statuses = {
      NEW: { color: 'bg-blue-100', text: 'New' },
      ATTENDING: { color: 'bg-yellow-100', text: 'Attending' },
      COMPLETED: { color: 'bg-green-100', text: 'Completed' },
      ESCALATED_L2: { color: 'bg-orange-100', text: 'Escalated L2' },
      ESCALATED_L3: { color: 'bg-red-100', text: 'Escalated L3' },
      RESOLVED: { color: 'bg-purple-100', text: 'Resolved' },
    };

    Object.entries(statuses).forEach(([status, { color, text }]) => {
      test(`renders ${text} status badge with correct styling`, () => {
        render(<StatusBadge status={status as TicketStatus} />);
        
        const badge = screen.getByText(text);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass(color);
      });
    });

    test('applies additional className when provided', () => {
      render(<StatusBadge status="NEW" className={testClassName} />);
      const badge = screen.getByText('New');
      expect(badge).toHaveClass(testClassName);
    });
  });

  describe('when displaying priority', () => {
    const priorities = {
      LOW: { color: 'bg-gray-100', text: 'Low Priority' },
      MEDIUM: { color: 'bg-yellow-100', text: 'Medium Priority' },
      HIGH: { color: 'bg-red-100', text: 'High Priority' },
    };

    Object.entries(priorities).forEach(([priority, { color, text }]) => {
      test(`renders ${text} priority badge with correct styling`, () => {
        render(<StatusBadge priority={priority as TicketPriority} />);
        
        const badge = screen.getByText(text);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass(color);
      });
    });
  });

  describe('when displaying critical value', () => {
    const criticalValues = {
      C1: { color: 'bg-red-100', text: 'Critical (C1)' },
      C2: { color: 'bg-orange-100', text: 'Major (C2)' },
      C3: { color: 'bg-yellow-100', text: 'Minor (C3)' },
      NONE: { color: 'bg-gray-100', text: 'None' },
    };

    Object.entries(criticalValues).forEach(([value, { color, text }]) => {
      test(`renders ${text} critical value badge with correct styling`, () => {
        render(<StatusBadge criticalValue={value as CriticalValue} />);
        
        const badge = screen.getByText(text);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass(color);
      });
    });
  });

  describe('when multiple props are provided', () => {
    test('renders with all props combined', () => {
      render(
        <StatusBadge
          status="NEW"
          priority="HIGH"
          criticalValue="NONE"
          className={testClassName}
        />
      );

      const badge = screen.getByText('New');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-blue-100');
      expect(badge).toHaveClass(testClassName);
    });

    test('status takes precedence over other props', () => {
      render(
        <StatusBadge
          status="NEW"
          priority="HIGH"
          criticalValue="NONE"
        />
      );

      const badge = screen.getByText('New');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-blue-100');
      expect(badge).not.toHaveClass('bg-red-100');
      expect(badge).not.toHaveClass('bg-yellow-100');
    });
  });
});
