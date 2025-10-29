import { Chat as GeminiChat } from "@google/genai";
import React from 'react';

// FIX: Added for ChatList component.
export interface Chat {
  id: string;
  name: string;
}
export interface Group {
  id: string;
  name: string;
  chats: Chat[];
}

export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id?: number;
  role: Role;
  content: string;
  sender?: User; // For multi-user chat
  timestamp?: string;
  type?: 'text' | 'summary';
  file?: {
    url: string;
    name: string;
    type: string;
  };
  isRead?: boolean;
  reactions?: { [emoji: string]: number[] };
}

export type View = 'home' | 'messages' | 'permission' | 'status' | 'settings';

export interface User {
  id: number;
  name: string;
  avatar: string;
  email?: string;
  token?: string;
  level?: string;
}

export type AccessLevel = 'Admin' | 'Editor' | 'Viewer';

export interface PermissionMember {
  id:string;
  name: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Inactive';
  accessLevel: AccessLevel;
}

export interface DirectMessage {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  online?: boolean;
  unreadCount?: number;
}

export interface DirectConversation extends DirectMessage {
    messages: Message[];
}

// New type for the project dashboard
export interface Project {
  id: string;
  title: string;
  category: string;
  categoryTheme: 'blue' | 'orange' | 'pink' | 'purple' | 'sky';
  description: string;
  progress: number;
  members: User[];
  comments: number;
  attachments: number;
  status: 'Started' | 'On Going' | 'Completed';
  highlighted?: boolean;
  tasks?: ProjectTask[];
}

// Types for Project Detail View
export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: User;
  dueDate?: string;
  attachments?: ProjectFile[];
}

export interface ProjectComment {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  replies?: ProjectComment[];
}

export interface ProjectFile {
  id: string;
  name: string;
  size: string;
  type: 'PDF' | 'Image' | 'Word' | 'Generic';
  url: string;
}


// FIX: Added Pod and PodStatus types for PodStatusView component.
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

// FIX: Added missing types for Kanban components.
export type TaskPriority = 'None' | 'Low' | 'Medium' | 'High';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee?: User;
  dueDate?: string;
  priority?: TaskPriority;
  labels?: string[];
  subtasks?: Subtask[];
  attachments?: ProjectFile[];
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export type SortOption = 'default' | 'priority' | 'dueDateAsc' | 'dueDateDesc';