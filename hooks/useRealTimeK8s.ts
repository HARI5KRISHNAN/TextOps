
// hooks/useRealTimeK8s.ts
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Pod, PodUpdateEvent } from '../types';

// Point to your backend service
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://dashboard-api.example.com'
  : '/'; // Development proxy

export const useRealTimeK8s = () => {
  const [pods, setPods] = useState<Pod[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const processUpdate = useCallback((event: PodUpdateEvent) => {
    setPods(currentPods => {
      const { type, object: updatedPod } = event;
      switch (type) {
        case 'ADDED':
          if (!currentPods.some(p => p.id === updatedPod.id)) {
            return [...currentPods, updatedPod];
          }
          return currentPods;
        case 'MODIFIED':
          return currentPods.map(p => p.id === updatedPod.id ? updatedPod : p);
        case 'DELETED':
          return currentPods.filter(p => p.id !== updatedPod.id);
        default:
          return currentPods;
      }
    });
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✓ Connected to Kubernetes backend');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('✗ Disconnected from Kubernetes backend');
      setConnectionStatus('disconnected');
    });

    // Receive initial pod list
    socket.on('initial_pods', (initialPods: Pod[]) => {
      console.log(`Received ${initialPods.length} pods`);
      setPods(initialPods);
    });

    // Receive real-time updates
    socket.on('pod_update', (event: PodUpdateEvent) => {
      processUpdate(event);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [processUpdate]);

  return { pods, connectionStatus, lastUpdate };
};
