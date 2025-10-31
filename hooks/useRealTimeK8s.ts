// src/hooks/useRealTimeK8s.ts
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Pod, PodUpdateEvent } from '../types';

// The URL of your backend service. When running locally with the proxy, this works.
// In production, this would be the URL of your backend service.
const SOCKET_URL = '/'; 

export const useRealTimeK8s = () => {
  const [pods, setPods] = useState<Pod[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');

  // Logic to process an incoming update event (this remains the same)
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
  }, []);

  useEffect(() => {
    // Establish WebSocket connection
    const socket: Socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Socket connected!');
      setConnectionStatus('connected');
      
      // Request the initial list of pods upon connecting
      socket.emit('list_pods', (initialPods: Pod[]) => {
        setPods(initialPods);
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected.');
      setConnectionStatus('disconnected');
    });

    // Listen for real-time updates from the backend
    socket.on('pod_update', (event: PodUpdateEvent) => {
      processUpdate(event);
    });

    // Cleanup function to close the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [processUpdate]); // Dependency array ensures this effect runs only once

  return { pods, connectionStatus };
};
