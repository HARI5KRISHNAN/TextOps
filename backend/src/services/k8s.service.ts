


import { V1Pod, Watch } from '@kubernetes/client-node';
import * as k8s from '@kubernetes/client-node';
import { Pod, PodUpdateEvent } from '../types';
import { Server } from 'socket.io';

let allPods: Pod[] = [];
let watch: Watch;
// FIX: Add a variable to hold the watch request object, which can be aborted.
let watchRequest: any;

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
    
    // FIX: Use in-cluster config for production, and local kubeconfig for development.
    // This prevents the backend from crashing during local dev.
    if (process.env.NODE_ENV === 'production') {
      console.log('Loading K8s config from cluster...');
      kc.loadFromCluster();
    } else {
      console.log('Loading K8s config from default (local kubeconfig)...');
      kc.loadFromDefault();
    }

    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    // List all pods initially
    console.log('Fetching initial pod list...');
    // FIX: The method returns a response object with a `body` property. Destructure it to correctly access the pod list.
    const response = await k8sApi.listPodForAllNamespaces();
    // FIX: Correctly access the pod list from the response object. The error indicates `response` is V1PodList, which has an `items` property.
    allPods = (response.items || []).map(transformK8sPod);
    console.log(`Found ${allPods.length} pods`);

    // Setup watch for pod changes
    watch = new Watch(kc);

    // FIX: Store the request object to be able to abort it later.
    watchRequest = await watch.watch(
      '/api/v1/pods', // Watch all pods across all namespaces
      {},
      (type: string, obj: V1Pod) => {
        const transformedPod = transformK8sPod(obj);

        // Determine the event type
        if (type === 'ADDED') {
          // Avoid duplicates if a pod already exists in the initial list
          if (!allPods.some(p => p.id === transformedPod.id)) {
            allPods.push(transformedPod);
          }
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
      // FIX: Combined error and done callbacks into one, as watch() expects only 4 arguments.
      (err) => {
        if (err) {
            console.error('Watch error:', err);
            // Attempt to reconnect after a delay
            setTimeout(() => startWatchingPods(io), 5000);
        } else {
            console.log('Watch closed');
        }
      }
    );

    console.log('✓ Kubernetes watch established');
  } catch (error) {
    console.error('Failed to start watching pods:', error);
    // Add a retry mechanism for local development if the initial connection fails
    if (process.env.NODE_ENV !== 'production') {
        console.log('Retrying K8s connection in 15 seconds...');
        setTimeout(() => startWatchingPods(io), 15000);
    } else {
        throw error; // In production, let it fail fast to be restarted by Kubernetes
    }
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
// FIX: Call abort() on the watch request object, not the Watch instance.
export function stopWatchingPods(): void {
  if (watchRequest) {
    watchRequest.abort();
    watchRequest = null;
  }
}
