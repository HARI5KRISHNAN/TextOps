import React, { useState, useEffect } from 'react';
import { Pod, PodStatus } from '../types';
import { ServerIcon } from './icons';

const createInitialPods = (count: number): Pod[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `pod-${i}`,
    name: `pod-${i}-webapp-${Math.random().toString(36).substring(2, 7)}`,
    status: Math.random() < 0.8 ? 'Running' : (Math.random() < 0.5 ? 'Pending' : 'Error'),
    // FIX: Add missing properties to match the Pod type.
    ready: '1/1',
    age: '1d',
    restarts: 0,
    cpu: 0,
    memory: 0,
    metrics: [],
  }));
};

const StatusBar: React.FC = () => {
    const [pods, setPods] = useState<Pod[]>(createInitialPods(12));
    const [allSystemsOperational, setAllSystemsOperational] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            let hasError = false;
            const newPods = pods.map(pod => {
                if (Math.random() < 0.1) { // 10% chance to change status
                    const statuses: PodStatus[] = ['Running', 'Pending', 'Error'];
                    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
                    if (newStatus === 'Error') hasError = true;
                    return { ...pod, status: newStatus };
                }
                if (pod.status === 'Error') hasError = true;
                return pod;
            });
            setPods(newPods);
            setAllSystemsOperational(!hasError);
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [pods]);

    const getStatusColor = (status: PodStatus): string => {
        switch (status) {
            case 'Running': return 'bg-status-green';
            case 'Pending': return 'bg-yellow-500';
            case 'Error': return 'bg-status-red';
            default: return 'bg-gray-500';
        }
    };

    return (
        <footer className="h-10 bg-background-panel border-t border-border-color flex items-center px-4 text-xs shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 font-semibold text-text-primary">
                    <ServerIcon className="w-4 h-4" />
                    <span>Pod Status</span>
                </div>
                <div className="flex items-center gap-2">
                    {pods.map(pod => (
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
