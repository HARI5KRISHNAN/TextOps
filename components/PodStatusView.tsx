import React, { useState, useEffect, useCallback } from 'react';
import { Pod, PodStatus } from '../types';
import { RefreshIcon } from './icons';

// --- Helper Functions & Constants ---

const generatePodName = () => {
    const prefixes = ['web', 'api', 'db', 'cache', 'worker', 'queue', 'proxy', 'metrics', 'auth'];
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let idPart = '';
    for (let i = 0; i < 5; i++) {
        idPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-deployment-${idPart}`;
};

const createInitialPods = (count: number): Pod[] => {
  return Array.from({ length: count }, (_, i) => {
    const status: PodStatus = Math.random() < 0.8 ? 'Running' : (Math.random() < 0.5 ? 'Pending' : 'Error');
    const restarts = status === 'Error' ? Math.floor(Math.random() * 3) : 0;
    
    const ageMinutes = Math.floor(Math.random() * 60 * 24 * 7); // up to 7 days in minutes
    let ageString = '';
    if (ageMinutes < 60) {
        ageString = `${ageMinutes}m ago`;
    } else if (ageMinutes < 60 * 24) {
        ageString = `${Math.floor(ageMinutes / 60)}h ago`;
    } else {
        ageString = `${Math.floor(ageMinutes / (60 * 24))}d ago`;
    }

    const cpu = status === 'Running' ? Math.floor(Math.random() * 80) + 10 : 0;
    const memory = status === 'Running' ? Math.floor(Math.random() * 70) + 20 : 0;
    const ready = status === 'Running' ? '1/1' : '0/1';

    return {
      id: `pod-${i}-${Date.now()}`,
      name: generatePodName(),
      status: status,
      ready: ready,
      age: ageString,
      restarts: restarts,
      cpu,
      memory,
      metrics: [],
    };
  });
};

const StatusBadge: React.FC<{ status: PodStatus }> = ({ status }) => {
  const statusClasses: Record<PodStatus, string> = {
    Running: 'bg-status-green-soft text-status-green',
    Pending: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400 animate-pulse',
    Error: 'bg-status-red-soft text-status-red',
    Succeeded: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  };

  const dotClasses: Record<PodStatus, string> = {
    Running: 'bg-status-green',
    Pending: 'bg-yellow-500',
    Error: 'bg-status-red',
    Succeeded: 'bg-gray-500',
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 ${statusClasses[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[status]}`}></span>
      {status}
    </span>
  );
};

// --- Main Dashboard Component ---

const PodStatusView: React.FC = () => {
    const [pods, setPods] = useState<Pod[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshPods = useCallback(() => {
        setIsRefreshing(true);
        setPods(createInitialPods(20));
        setTimeout(() => setIsRefreshing(false), 500);
    }, []);

    useEffect(() => {
        refreshPods();
    }, [refreshPods]);

    useEffect(() => {
        const interval = setInterval(() => {
          setPods(prevPods =>
            prevPods.map(pod => {
              let newStatus = pod.status;
              let newRestarts = pod.restarts || 0;
              let newCpu = pod.cpu;
              let newMemory = pod.memory;
              let newReady = pod.ready;

              if (Math.random() < 0.05) {
                const statuses: PodStatus[] = ['Running', 'Pending', 'Error'];
                newStatus = statuses[Math.floor(Math.random() * statuses.length)];
              }
              if (pod.status === 'Error' && Math.random() < 0.2) {
                newStatus = 'Running';
                newRestarts += 1;
              }
              if (pod.status === 'Pending' && Math.random() < 0.4) {
                newStatus = 'Running';
              }
              
              if (newStatus === 'Running') {
                newReady = '1/1';
                newCpu = Math.max(10, Math.min(95, pod.cpu + Math.floor(Math.random() * 20) - 10));
                newMemory = Math.max(20, Math.min(90, pod.memory + Math.floor(Math.random() * 10) - 5));
              } else {
                newReady = '0/1';
                newCpu = 0;
                newMemory = 0;
              }

              return { ...pod, status: newStatus, restarts: newRestarts, cpu: newCpu, memory: newMemory, ready: newReady };
            })
          );
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const totalPods = pods.length;
    const runningPods = pods.filter(p => p.status === 'Running').length;
    const pendingPods = pods.filter(p => p.status === 'Pending').length;
    const errorPods = pods.filter(p => p.status === 'Error').length;

    const chartData = [
        { status: 'Running', value: runningPods, color: 'var(--color-status-green)' },
        { status: 'Error', value: errorPods, color: 'var(--color-status-red)' },
        { status: 'Pending', value: pendingPods, color: '#FBBF24' },
    ];
    
    let cumulativeOffset = 0;
    const chartSegments = chartData.map(data => {
        const percentage = totalPods > 0 ? (data.value / totalPods) * 100 : 0;
        const segment = {
            ...data,
            percentage,
            strokeDasharray: `${percentage} ${100 - percentage}`,
            strokeDashoffset: -cumulativeOffset,
        };
        cumulativeOffset += percentage;
        return segment;
    });

    return (
        <div className="flex-1 flex flex-col p-6 bg-background-main overflow-y-auto">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Pod Status Dashboard</h1>
                    <p className="text-text-secondary">Real-time overview of your Kubernetes pods.</p>
                </div>
                <button
                    onClick={refreshPods}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-hover disabled:bg-gray-400"
                >
                    <RefreshIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Total Pods" value={totalPods} />
                    <StatCard title="Running" value={runningPods} color="text-status-green" />
                    <StatCard title="Pending" value={pendingPods} color="text-yellow-500" />
                    <StatCard title="Error" value={errorPods} color="text-status-red" />
                </div>
                <div className="bg-background-panel p-4 rounded-lg border border-border-color flex items-center justify-center">
                    <div className="w-full max-w-xs flex items-center gap-4">
                        <div className="relative w-24 h-24 shrink-0">
                             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.9155" className="stroke-current text-border-color" fill="transparent" strokeWidth="2.5"></circle>
                                {chartSegments.map(segment => (
                                    <circle
                                        key={segment.status}
                                        cx="18"
                                        cy="18"
                                        r="15.9155"
                                        fill="transparent"
                                        strokeWidth="2.5"
                                        strokeDasharray={segment.strokeDasharray}
                                        strokeDashoffset={segment.strokeDashoffset}
                                        style={{ stroke: segment.color, transition: 'stroke-dasharray 0.5s ease-in-out' }}
                                    ></circle>
                                ))}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-text-primary">{totalPods}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            {chartData.map(item => (
                                <div key={item.status} className="flex items-center gap-2 text-sm">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></span>
                                    <span className="text-text-secondary">{item.status}:</span>
                                    <span className="font-semibold text-text-primary">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-background-panel p-4 rounded-lg border border-border-color flex-1">
                 <div className="overflow-x-auto h-full">
                     <table className="w-full min-w-[960px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-border-color text-text-secondary">
                          <th className="font-semibold p-3">Pod Name</th>
                          <th className="font-semibold p-3">Ready</th>
                          <th className="font-semibold p-3">Status</th>
                          <th className="font-semibold p-3">Age</th>
                          <th className="font-semibold p-3 text-center">Restarts</th>
                          <th className="font-semibold p-3 text-center">CPU Usage</th>
                          <th className="font-semibold p-3 text-center">Memory Usage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pods.map((pod) => (
                          <tr key={pod.id} className="border-b border-border-color hover:bg-background-main">
                            <td className="p-3 font-mono text-text-primary font-medium">{pod.name}</td>
                            <td className="p-3 text-text-secondary">{pod.ready}</td>
                            <td className="p-3"><StatusBadge status={pod.status} /></td>
                            <td className="p-3 text-text-secondary">{pod.age}</td>
                            <td className="p-3 text-text-secondary text-center">{pod.restarts}</td>
                            <td className="p-3 text-text-secondary text-center">{pod.cpu}%</td>
                            <td className="p-3 text-text-secondary text-center">{pod.memory}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{title: string; value: number; color?: string}> = ({ title, value, color = 'text-text-primary' }) => (
    <div className="bg-background-panel p-4 rounded-lg border border-border-color">
        <p className="text-sm text-text-secondary font-medium">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
);


export default PodStatusView;