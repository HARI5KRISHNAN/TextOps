import { Pod, PodStatus } from '../types';

let podsCache: Pod[] = [];

const generatePodName = () => {
    const prefixes = ['web', 'api', 'db', 'cache', 'worker', 'queue', 'proxy', 'metrics', 'auth'];
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let idPart = '';
    for (let i = 0; i < 5; i++) {
        idPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-deployment-${idPart}`;
};

const createPods = (count: number): void => {
  // FIX: This function was returning an object that did not match the Pod type.
  // It has been updated to include 'namespace' and use 'cpuUsage'/'memoryUsage', and provides 'age' as a number.
  podsCache = Array.from({ length: count }, (_, i) => {
    // FIX: Replaced 'Error' with 'Failed' to match the PodStatus type.
    const status: PodStatus = Math.random() < 0.8 ? 'Running' : (Math.random() < 0.5 ? 'Pending' : 'Failed');
    // FIX: Changed comparison from 'Error' to 'Failed'.
    const restarts = status === 'Failed' ? Math.floor(Math.random() * 3) : 0;
    
    // FIX: Changed age to be in seconds to match the Pod type.
    const ageInSeconds = Math.floor(Math.random() * 60 * 60 * 24 * 7); // up to 7 days

    // FIX: Renamed 'cpu' to 'cpuUsage' and 'memory' to 'memoryUsage' to match the Pod type.
    const cpuUsage = status === 'Running' ? Math.floor(Math.random() * 80) + 10 : null;
    const memoryUsage = status === 'Running' ? Math.floor(Math.random() * 70) + 20 : null;
    
    const namespaces = ['default', 'kube-system', 'production', 'staging'];

    // FIX: The returned object now correctly implements the Pod interface.
    // Removed 'ready' and 'metrics' properties, added 'namespace', changed 'age' to a number, and renamed 'cpu'/'memory' to 'cpuUsage'/'memoryUsage'.
    return {
      id: `pod-${i}-${Date.now()}`,
      name: generatePodName(),
      namespace: namespaces[Math.floor(Math.random() * namespaces.length)],
      status: status,
      age: ageInSeconds,
      restarts: restarts,
      cpuUsage,
      memoryUsage,
    };
  });
};

// Initialize with a set of pods
createPods(20);

// This function simulates fetching and updating pod statuses in real-time
export const getLivePodDetails = (): Pod[] => {
    podsCache = podsCache.map(pod => {
      let newStatus = pod.status;
      let newRestarts = pod.restarts || 0;
      // FIX: Used 'cpuUsage' and 'memoryUsage' from the Pod type instead of 'cpu' and 'memory'.
      let newCpu = pod.cpuUsage;
      let newMemory = pod.memoryUsage;
      // FIX: Removed 'ready' property as it does not exist on the Pod type.

      // Randomly change status
      if (Math.random() < 0.05) {
        // FIX: Replaced 'Error' with 'Failed' to match the PodStatus type.
        const statuses: PodStatus[] = ['Running', 'Pending', 'Failed'];
        newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      }
      // Simulate self-healing
      // FIX: Changed comparison from 'Error' to 'Failed'.
      if (pod.status === 'Failed' && Math.random() < 0.2) {
        newStatus = 'Running';
        newRestarts += 1;
      }
      // Simulate pending pods starting
      if (pod.status === 'Pending' && Math.random() < 0.4) {
        newStatus = 'Running';
      }
      
      if (newStatus === 'Running') {
        // Simulate resource fluctuation
        // FIX: Used 'cpuUsage' and 'memoryUsage' and handled null values.
        newCpu = Math.max(10, Math.min(95, (pod.cpuUsage || 50) + Math.floor(Math.random() * 20) - 10));
        newMemory = Math.max(20, Math.min(90, (pod.memoryUsage || 50) + Math.floor(Math.random() * 10) - 5));
      } else {
        newCpu = null;
        newMemory = null;
      }

      // FIX: The returned object now correctly implements the Pod interface.
      return { ...pod, status: newStatus, restarts: newRestarts, cpuUsage: newCpu, memoryUsage: newMemory };
    });
    return podsCache;
};
