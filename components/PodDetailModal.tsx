import React from 'react';
import { Pod } from '../types';
import { XCircleIcon } from './icons';

interface PodDetailModalProps {
  pod: Pod;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-3 border-b border-border-color">
    <dt className="text-sm font-medium text-text-secondary">{label}</dt>
    <dd className="text-sm text-text-primary col-span-2 font-mono">{value}</dd>
  </div>
);

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
  const d = Math.floor(seconds / (3600*24));
  const h = Math.floor(seconds % (3600*24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);

  let result = '';
  if (d > 0) result += `${d}d `;
  if (h > 0) result += `${h}h `;
  if (m > 0) result += `${m}m `;
  if (s > 0 || result === '') result += `${s}s`;
  return result.trim();
};

const PodDetailModal: React.FC<PodDetailModalProps> = ({ pod, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-background-panel rounded-lg shadow-xl w-full max-w-2xl border border-border-color"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border-color flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            Pod Details: <span className="font-mono text-accent-purple">{pod.name}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
            aria-label="Close modal"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          <dl>
            <DetailRow label="Name" value={pod.name} />
            <DetailRow label="Namespace" value={pod.namespace} />
            <DetailRow label="Status" value={
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex ${getStatusClasses(pod.status)}`}>
                {pod.status}
              </span>
            } />
            <DetailRow label="Age" value={`${formatTime(pod.age)} ago`} />
            <DetailRow label="Restarts" value={pod.restarts} />
            <DetailRow label="CPU Usage" value={pod.cpuUsage !== null ? `${pod.cpuUsage}m` : 'N/A'} />
            <DetailRow label="Memory Usage" value={pod.memoryUsage !== null ? `${pod.memoryUsage}Mi` : 'N/A'} />
            <DetailRow label="Unique ID" value={pod.id} />
          </dl>
        </div>
        <div className="p-4 bg-background-main rounded-b-lg border-t border-border-color flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PodDetailModal;
