"use client";

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MaintenanceRequestStatus } from '@/lib/types';

const statusColors: Record<MaintenanceRequestStatus, string> = {
  'New': 'bg-gray-400',
  'In Progress': 'bg-blue-500',
  'Repaired': 'bg-green-500',
  'Scrap': 'bg-red-500',
  'Blocked': 'bg-orange-500',
  'Ready for next stage': 'bg-purple-500',
};

const availableStatuses: MaintenanceRequestStatus[] = [
  'In Progress',
  'Blocked',
  'Ready for next stage',
];

type StatusIndicatorProps = {
  currentStatus: MaintenanceRequestStatus;
  onChange: (newStatus: MaintenanceRequestStatus) => void;
};

export default function StatusIndicator({ currentStatus, onChange }: StatusIndicatorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'w-6 h-6 rounded-full border-2 border-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            statusColors[currentStatus] || 'bg-gray-400'
          )}
          aria-label={`Current status: ${currentStatus}. Click to change.`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {availableStatuses.map((status) => (
          <DropdownMenuItem key={status} onSelect={() => onChange(status)} disabled={status === currentStatus}>
            <div className="flex items-center gap-2">
              <span className={cn('w-3 h-3 rounded-full', statusColors[status])} />
              {status}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
