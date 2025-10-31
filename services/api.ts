// This file will centralize all API calls to the backend.
import { GoogleGenAI } from '@google/genai';
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
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Provide a concise summary of the following meeting transcript. Use bullet points for key decisions and action items:\n\n${transcript}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const summary = response.text;
        
        if (!summary) {
            throw new Error('The AI returned an empty summary.');
        }

        return { summary };
    } catch (error) {
        console.error('Error generating summary with Gemini:', error);
        throw new Error('Failed to generate summary from the AI. Please check your API key and network connection.');
    }
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
