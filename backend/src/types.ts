
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export type MessageReaction = { [emoji: string]: number[] };

export interface BroadcastMessage {
  id: number;
  content: string;
  timestamp: string;
  channelId: string;
  sender: {
    id: number;
    name: string;
    avatar: string;
  };
  role: Role;
  isRead: boolean;
  reactions: MessageReaction;
}

// Pod Status Types
export type PodStatus = 'Running' | 'Pending' | 'Failed' | 'Succeeded' | 'Unknown';

export interface Pod {
  id: string;
  name: string;
  namespace: string;
  status: PodStatus;
  age: number; // In seconds
  restarts: number;
  cpuUsage: number | null;
  memoryUsage: number | null;
}

export interface PodUpdateEvent {
  type: 'ADDED' | 'MODIFIED' | 'DELETED';
  object: Pod;
}