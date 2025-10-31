
import React, { useMemo, useState } from 'react';
import { Pod, PodStatus } from '../types';
import { PodTableRow } from './PodTableRow';
import PodDetailModal from './PodDetailModal';
import { RefreshIcon, PlusIcon } from './icons';

interface PodStatusViewProps {
    pods: Pod[];
    connectionStatus: 'connected' | 'disconnected';
}

const PodStatusView: React.FC<PodStatusViewProps> = ({ pods, connectionStatus }) => {
  // --- State for Filtering ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);

  // Get unique namespaces and statuses for the dropdown options
  const uniqueNamespaces = useMemo(() => {
    const namespaces = new Set(pods.map(p => p.namespace));
    return ['All', ...Array.from(namespaces).sort()];
  }, [pods]);

  // All possible statuses (from type definition)
  const allStatuses: ('All' | PodStatus)[] = ['All', 'Running', 'Pending', 'Failed', 'Succeeded', 'Unknown'];


  // --- Combined Filtering and Sorting Logic ---
  const filteredAndSortedPods = useMemo(() => {
    let result = pods;

    // 1. Filter by Search Term (Pod Name)
    if (searchTerm) {
      result = result.filter(pod => 
        pod.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filter by Namespace
    if (selectedNamespace !== 'All') {
      result = result.filter(pod => pod.namespace === selectedNamespace);
    }

    // 3. Filter by Status
    if (selectedStatus !== 'All') {
      result = result.filter(pod => pod.status === selectedStatus);
    }

    // 4. Sorting (e.g., Critical statuses first)
    const statusOrder: Record<PodStatus, number> = { 'Failed': 1, 'Pending': 2, 'Running': 3, 'Succeeded': 4, 'Unknown': 5 };
    return [...result].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  }, [pods, searchTerm, selectedNamespace, selectedStatus]);
  // --- End Combined Logic ---
  
  const handlePodRowClick = (pod: Pod) => {
    setSelectedPod(pod);
  };

  const handleCloseModal = () => {
    setSelectedPod(null);
  };
  
  return (
    <>
      <div className="flex-1 flex flex-col p-6 bg-background-main overflow-y-auto no-scrollbar">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-text-primary">☁️ Kubernetes Pod Dashboard</h1>
          </div>
          <div className="mt-2 bg-accent-purple-soft text-accent-purple text-sm p-3 rounded-lg border border-accent-purple/20">
              Connection Status: <strong className="font-semibold">{connectionStatus}</strong> (Live updates are {connectionStatus === 'connected' ? 'enabled' : 'disabled'}).
          </div>
        </header>

        {/* --- Filter and Search Controls --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-center">
          {/* Search by Pod Name */}
          <div className="lg:col-span-2">
            <input
              type="text"
              className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
              placeholder="Search Pod Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter by Namespace */}
          <div>
            <select
              className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
            >
              {uniqueNamespaces.map(ns => (
                <option key={ns} value={ns}>{ns === 'All' ? 'All Namespaces' : ns}</option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {allStatuses.map(status => (
                <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-full text-right">
              <p className="text-sm text-text-secondary">Showing <strong>{filteredAndSortedPods.length}</strong> of <strong>{pods.length}</strong> pods</p>
          </div>
        </div>
        {/* --- End Filter and Search Controls --- */}

        <div className="bg-background-panel p-4 rounded-lg border border-border-color flex-1">
          <div className="overflow-x-auto h-full no-scrollbar">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="sticky top-0 bg-background-panel">
                  <tr className="border-b border-border-color text-text-secondary">
                    <th className="font-semibold p-3">Pod</th>
                    <th className="font-semibold p-3">Namespace</th>
                    <th className="font-semibold p-3">Status</th>
                    <th className="font-semibold p-3">Age</th>
                    <th className="font-semibold p-3 text-center">Restarts</th>
                    <th className="font-semibold p-3 text-center">CPU (m)</th>
                    <th className="font-semibold p-3 text-center">Memory (Mi)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedPods.length === 0 ? (
                    <tr><td colSpan={7} className="text-center p-8 text-text-secondary">No pods match the current filters.</td></tr>
                  ) : (
                    filteredAndSortedPods.map(pod => (
                      <PodTableRow key={pod.id} pod={pod} onRowClick={handlePodRowClick} />
                    ))
                  )}
                </tbody>
              </table>
          </div>
        </div>
      </div>
      {selectedPod && (
        <PodDetailModal pod={selectedPod} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default PodStatusView;