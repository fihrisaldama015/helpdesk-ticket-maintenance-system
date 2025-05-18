import React from 'react';
import { CriticalValue, TicketPriority, TicketStatus } from '../types';
import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status?: TicketStatus;
  priority?: TicketPriority;
  criticalValue?: CriticalValue;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  priority,
  criticalValue,
  className
}) => {
  const baseClassName = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  
  // Status badge classes
  if (status) {
    const statusClasses = {
      NEW: 'bg-blue-100 text-blue-800',
      ATTENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      ESCALATED_L2: 'bg-orange-100 text-orange-800',
      ESCALATED_L3: 'bg-red-100 text-red-800',
      RESOLVED: 'bg-purple-100 text-purple-800'
    };
    
    const statusLabels = {
      NEW: 'New',
      ATTENDING: 'Attending',
      COMPLETED: 'Completed',
      ESCALATED_L2: 'Escalated L2',
      ESCALATED_L3: 'Escalated L3',
      RESOLVED: 'Resolved'
    };
    
    return (
      <span className={cn(baseClassName, statusClasses[status], className)}>
        {statusLabels[status]}
      </span>
    );
  }
  
  // Priority badge classes
  if (priority) {
    const priorityClasses = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={cn(baseClassName, priorityClasses[priority], className)}>
        {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()} Priority
      </span>
    );
  }
  
  // Critical value badge classes
  if (criticalValue) {
    const criticalValueClasses: Record<CriticalValue, string> = {
      C1: 'bg-red-100 text-red-800 border border-red-200',
      C2: 'bg-orange-100 text-orange-800 border border-orange-200',
      C3: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      NONE: 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    
    const criticalLabels = {
      C1: 'Critical (C1)',
      C2: 'Major (C2)',
      C3: 'Minor (C3)',
      NONE: 'None'
    };
    
    return (
      <span className={cn(baseClassName, criticalValueClasses[criticalValue], className)}>
        {criticalLabels[criticalValue]}
      </span>
    );
  }
  
  return null;
};

export default StatusBadge;