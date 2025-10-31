import React from 'react';
import { Pod, PodStatus } from '../types';
import { ServerIcon } from './icons';

interface StatusBarProps {
  pods: Pod[];
  onOpenPodStatusView: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ pods, onOpenPodStatusView }) => {
    const allSystemsOperational = !pods.some(p => p.status === 'Failed');

    const getStatusColor = (status: PodStatus): string => {
        switch (status) {
            case 'Running': return 'bg-status-green';
            case 'Pending': return 'bg-yellow-500';
            case 'Failed': return 'bg-status-red';
            case 'Succeeded': return 'bg-sky-500';
            default: return 'bg-gray-500';
        }
    };

    // Display a maximum of 20 pods in the status bar for performance and UI reasons.
    const podsToShow = pods.slice(0, 20);

    return (
        <footer
            onClick={onOpenPodStatusView}
            className="h-10 bg-background-panel border-t border-border-color flex items-center px-4 text-xs shrink-0 cursor-pointer hover:bg-background-main transition-colors"
        >
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 font-semibold text-text-primary">
                    <ServerIcon className="w-4 h-4" />
                    <span>Pod Status</span>
                </div>
                <div className="flex items-center gap-2">
                    {podsToShow.map(pod => (
                        <div key={pod.id} className="group relative">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(pod.status)}`}></div>
                            <div className="absolute bottom-full mb-2 px-2 py-1 bg-background-main border border-border-color text-text-primary text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {pod.name} ({pod.status})
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${allSystemsOperational ? 'bg-status-green' : 'bg-status-red'}`}></div>
                <span className="text-text-secondary font-medium">
                    {allSystemsOperational ? 'All Systems Operational' : 'System Error Detected'}
                </span>
            </div>
        </footer>
    );
};

export default StatusBar;