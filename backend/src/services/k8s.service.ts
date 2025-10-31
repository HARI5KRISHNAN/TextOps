
import { V1Pod, Watch } from '@kubernetes/client-node';
import * as k8s from '@kubernetes/client-node';
import { Pod, PodUpdateEvent } from '../types';
import { Server } from 'socket.io';

let allPods: Pod[] = [];
let watch: Watch;

/**
 * Transform Kubernetes V1Pod object into our simplified Pod type
 */
function transformK8sPod(v1Pod: V1Pod): Pod {
  const podName = v1Pod.metadata?.name || 'unknown';
  const namespace = v1Pod.metadata?.namespace || 'default';
  const status = v1Pod.status?.phase || 'Unknown';

  // Calculate pod age in seconds
  const creationTime = v1Pod.metadata?.creationTimestamp;
  const age = creationTime 
    ? Math.floor((Date.now() - new Date(creationTime).getTime()) / 1000)
    : 0;

  // Count restarts
  const restarts = v1Pod.status?.containerStatuses?.reduce(
    (sum, cs) => sum + (cs.restartCount || 0),
    0
  ) || 0;

  // Get CPU and Memory usage (requires metrics-server in cluster)
  // Note: These will be null unless metrics-server is installed
  let cpuUsage: number | null = null;
  let memoryUsage: number | null = null;

  // Parse resource requests/limits if available
  const container = v1Pod.spec?.containers?.[0];
  if (container?.resources?.requests) {
    const cpu = container.resources.requests['cpu'];
    const memory = container.resources.requests['memory'];
    
    if (cpu) cpuUsage = parseInt(cpu as string, 10);
    if (memory) memoryUsage = parseInt(memory as string, 10) / (1024 * 1024); // Convert to Mi
  }

  return {
    id: `${namespace}/${podName}`,
    name: podName,
    namespace,
    status: status as any,
    age,
    restarts,
    cpuUsage,
    memoryUsage,
  };
}

/**
 * Initialize Kubernetes watcher and emit updates to Socket.IO clients
 */
export async function startWatchingPods(io: Server): Promise<void> {
  try {
    const kc = new k8s.KubeConfig();
    
    // Load configuration from the cluster (ServiceAccount)
    kc.loadFromCluster();

    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    // List all pods initially
    console.log('Fetching initial pod list...');
    const podResponse = await k8sApi.listPodForAllNamespaces();
    allPods = (podResponse.body.items || []).map(transformK8sPod);
    console.log(`Found ${allPods.length} pods`);

    // Setup watch for pod changes
    watch = new Watch(kc);

    const watchRequest = await watch.watch(
      '/api/v1/pods', // Watch all pods across all namespaces
      {},
      (type: string, obj: V1Pod) => {
        const transformedPod = transformK8sPod(obj);

        // Determine the event type
        if (type === 'ADDED') {
          allPods.push(transformedPod);
        } else if (type === 'MODIFIED') {
          allPods = allPods.map(p => 
            p.id === transformedPod.id ? transformedPod : p
          );
        } else if (type === 'DELETED') {
          allPods = allPods.filter(p => p.id !== transformedPod.id);
        }

        // Broadcast update to all connected clients
        const event: PodUpdateEvent = { type: type as any, object: transformedPod };
        io.emit('pod_update', event);

        console.log(`Pod Event [${type}]: ${transformedPod.name}`);
      },
      (err) => {
        console.error('Watch error:', err);
        // Attempt to reconnect after a delay
        setTimeout(() => startWatchingPods(io), 5000);
      },
      () => {
        console.log('Watch closed');
      }
    );

    console.log('✓ Kubernetes watch established');
  } catch (error) {
    console.error('Failed to start watching pods:', error);
    throw error;
  }
}

/**
 * Get current list of all pods
 */
export function getPods(): Pod[] {
  return allPods;
}

/**
 * Stop watching pod changes
 */
export function stopWatchingPods(): void {
  if (watch) {
    watch.abort();
  }
}
