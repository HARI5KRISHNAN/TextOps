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

// Types for the Pod Status Service
export type PodStatus = 'Running' | 'Pending' | 'Error' | 'Succeeded';

export interface Pod {
  id: string;
  name: string;
  status: PodStatus;
  ready: string;
  age: string;
  restarts: number;
  cpu: number;
  memory: number;
  metrics: any[];
}
