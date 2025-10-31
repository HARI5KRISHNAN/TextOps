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
  podsCache = Array.from({ length: count }, (_, i) => {
    const status: PodStatus = Math.random() < 0.8 ? 'Running' : (Math.random() < 0.5 ? 'Pending' : 'Error');
    const restarts = status === 'Error' ? Math.floor(Math.random() * 3) : 0;
    
    const ageMinutes = Math.floor(Math.random() * 60 * 24 * 7); // up to 7 days
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

// Initialize with a set of pods
createPods(20);

// This function simulates fetching and updating pod statuses in real-time
export const getLivePodDetails = (): Pod[] => {
    podsCache = podsCache.map(pod => {
      let newStatus = pod.status;
      let newRestarts = pod.restarts || 0;
      let newCpu = pod.cpu;
      let newMemory = pod.memory;
      let newReady = pod.ready;

      // Randomly change status
      if (Math.random() < 0.05) {
        const statuses: PodStatus[] = ['Running', 'Pending', 'Error'];
        newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      }
      // Simulate self-healing
      if (pod.status === 'Error' && Math.random() < 0.2) {
        newStatus = 'Running';
        newRestarts += 1;
      }
      // Simulate pending pods starting
      if (pod.status === 'Pending' && Math.random() < 0.4) {
        newStatus = 'Running';
      }
      
      if (newStatus === 'Running') {
        newReady = '1/1';
        // Simulate resource fluctuation
        newCpu = Math.max(10, Math.min(95, pod.cpu + Math.floor(Math.random() * 20) - 10));
        newMemory = Math.max(20, Math.min(90, pod.memory + Math.floor(Math.random() * 10) - 5));
      } else {
        newReady = '0/1';
        newCpu = 0;
        newMemory = 0;
      }

      return { ...pod, status: newStatus, restarts: newRestarts, cpu: newCpu, memory: newMemory, ready: newReady };
    });
    return podsCache;
};
