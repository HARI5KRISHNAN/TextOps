// This file will centralize all API calls to the backend.
import { Message, User } from '../types';

const API_BASE_URL = '/api';

export const getMessages = async (channelId: string, userId: number): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/chat/${channelId}/messages?userId=${userId}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch messages');
    }
    return response.json();
};

export const sendMessage = async (channelId: string, content: string, userId: number): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/chat/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, userId }),
    });
     if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
    }
    return response.json();
}

export const generateSummary = async (transcript: string): Promise<{ summary: string }> => {
    const response = await fetch(`${API_BASE_URL}/ai/generate-summary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate summary');
    }

    return response.json();
};

// FIX: Add interface for the authentication response payload.
interface AuthResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        avatar: string;
    };
}

// FIX: Added missing loginUser function.
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login');
    }
    return response.json();
};

// FIX: Added missing registerUser function.
export const registerUser = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register');
    }
    return response.json();
};
