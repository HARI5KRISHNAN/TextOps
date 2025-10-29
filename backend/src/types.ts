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
