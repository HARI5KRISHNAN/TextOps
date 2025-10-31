import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Pod, PodUpdateEvent } from '../types';

const getSocketURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, connect to the same host that serves the page, using WSS for security
    return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
  }
  // In development, connect directly to the backend server on its specific port
  return 'http://localhost:5001';
};

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
    const socket: Socket = io(getSocketURL(), {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      // Force secure connection in production
      secure: process.env.NODE_ENV === 'production',
    });

    socket.on('connect', () => {
      console.log('✓ Connected to backend via WebSocket');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('✗ Disconnected from backend');
      setConnectionStatus('disconnected');
    });

    socket.on('initial_pods', (initialPods: Pod[]) => {
      console.log(`Received ${initialPods.length} pods`);
      setPods(initialPods);
    });

    socket.on('pod_update', (event: PodUpdateEvent) => {
      processUpdate(event);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [processUpdate]);

  return { pods, connectionStatus, lastUpdate };
};
