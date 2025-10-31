// src/components/PodTableRow.tsx
import React from 'react';
import { Pod } from '../types';

interface PodTableRowProps {
  pod: Pod;
  onRowClick: (pod: Pod) => void;
}

const getStatusClasses = (status: Pod['status']): string => {
  switch (status) {
    case 'Running': return 'bg-status-green-soft text-status-green';
    case 'Failed': return 'bg-status-red-soft text-status-red';
    case 'Pending': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400';
    case 'Succeeded': return 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400';
    default: return 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  }
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

const formatUsage = (value: number | null, unit: 'm' | 'Mi'): string => {
    if (value === null) return 'N/A';
    return `${value}${unit}`;
}

export const PodTableRow: React.FC<PodTableRowProps> = React.memo(({ pod, onRowClick }) => {
  const statusClasses = getStatusClasses(pod.status);

  return (
    <tr 
      className="border-b border-border-color hover:bg-background-main cursor-pointer"
      onClick={() => onRowClick(pod)}
    >
      <td className="p-3 font-mono text-text-primary font-medium">{pod.name}</td>
      <td className="p-3 text-text-secondary">{pod.namespace}</td>
      <td className="p-3">
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 ${statusClasses}`}>
          {pod.status}
        </span>
      </td>
      <td className="p-3 text-text-secondary">{formatTime(pod.age)}</td>
      <td className="p-3 text-text-secondary text-center">{pod.restarts}</td>
      <td className="p-3 text-text-secondary text-center">{formatUsage(pod.cpuUsage, 'm')}</td>
      <td className="p-3 text-text-secondary text-center">{formatUsage(pod.memoryUsage, 'Mi')}</td>
    </tr>
  );
});