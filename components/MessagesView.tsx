import React, { useState, useRef, useEffect } from 'react';
import MessageListItem from './MessageListItem';
import { DirectConversation, Role, Message, User } from '../types';
import ConversationView from './ConversationView';
import { DoubleArrowLeftIcon, DoubleArrowRightIcon, SearchIcon } from './icons';
import { generateSummary as apiGenerateSummary } from '../services/api';


export const dummyConversations: DirectConversation[] = [
    { 
        id: 'dm1', name: 'Patrick Newman', avatar: 'https://i.pravatar.cc/40?u=1', lastMessage: 'Hey, are we still on for the meeting?', timestamp: '2m ago', online: true, unreadCount: 2,
        messages: [
            { id: 101, role: Role.MODEL, content: 'Hey there!' },
            { id: 102, role: Role.USER, content: 'Hey, are we still on for the meeting?' }
        ] 
    },
    { 
        id: 'dm2', name: 'Yulia Polischuk', avatar: 'https://i.pravatar.cc/40?u=2', lastMessage: 'Just sent over the design files.', timestamp: '1h ago', online: false,
        messages: [
            { id: 201, role: Role.USER, content: 'Hey Yulia, could you send me the latest design files for the project?' },
            { id: 202, role: Role.MODEL, content: 'Sure, I can do that. Which project are you referring to?' },
            { id: 203, role: Role.USER, content: 'The "Whooper" redesign.' },
            { id: 204, role: Role.MODEL, content: 'Got it. Just sent over the design files.' }
        ] 
    },
    { 
        id: 'dm3', name: 'Amanda Freeze', avatar: 'https://i.pravatar.cc/40?u=3', lastMessage: 'Can you review my pull request?', timestamp: '3h ago', online: true, unreadCount: 5,
        messages: [
             { id: 301, role: Role.USER, content: 'Can you review my pull request?' }
        ] 
    },
    { 
        id: 'dm4', name: 'Anatoly Belik', avatar: 'https://i.pravatar.cc/40?u=4', lastMessage: 'Let\'s catch up later this week.', timestamp: 'yesterday', online: false,
        messages: [
            { id: 401, role: Role.MODEL, content: 'Let\'s catch up later this week.' }
        ] 
    },
    { 
        id: 'dm5', name: 'Jessica Koel', avatar: 'https://i.pravatar.cc/40?u=5', lastMessage: 'Great work on the presentation!', timestamp: 'yesterday', online: true,
        messages: [
            { id: 501, role: Role.MODEL, content: 'Great work on the presentation!' }
        ]
    },
    { 
        id: 'dm6', name: 'Kamil Boerger', avatar: 'https://i.pravatar.cc/40?u=6', lastMessage: 'See you at the company event.', timestamp: '2d ago', online: false,
        messages: [
             { id: 601, role: Role.MODEL, content: 'See you at the company event.' }
        ] 
    },
    { 
        id: 'dm7', name: 'Tamara Shevchenko', avatar: 'https://i.pravatar.cc/40?u=7', lastMessage: 'The new feature is live!', timestamp: '3d ago', online: true,
        messages: [
            { id: 701, role: Role.MODEL, content: 'The new feature is live!' }
        ]
    },
    { id: 'dm8', name: 'Sam Nelson', avatar: 'https://i.pravatar.cc/40?u=8', lastMessage: 'Lunch today?', timestamp: '1w ago', online: false, messages: [{ id: 801, role: Role.USER, content: 'Lunch today?'}] },
    { id: 'dm9', name: 'Jonas Berger', avatar: 'https://i.pravatar.cc/40?u=9', lastMessage: 'Thanks for your help with the bug.', timestamp: '1w ago', online: true, messages: [{ id: 901, role: Role.MODEL, content: 'No problem! Glad I could help.'}, { id: 902, role: Role.USER, content: 'Thanks for your help with the bug.'}] },
    { id: 'dm10', name: 'Kristian Kurzawa', avatar: 'https://i.pravatar.cc/40?u=10', lastMessage: 'Welcome to the team!', timestamp: '2w ago', online: false, messages: [{ id: 1001, role: Role.MODEL, content: 'Welcome to the team!'}] },
];

const mockMeetingTranscript = `
Patrick: "Okay team, let's kick off the Q3 planning meeting. First on the agenda is the 'Odyssey' project launch. Yulia, can you give us an update from the design side?"
Yulia: "Sure. We've finalized the V2 mockups for the main dashboard and user profile pages. They're now ready for frontend development. The main challenge was incorporating the new branding without disrupting the user flow."
Amanda: "Great, I'll take a look at those today. My main concern is the API integration for the new analytics module. Anatoly, have the new endpoints been deployed to staging yet?"
Anatoly: "Not yet. We hit a snag with the database migration. We're expecting a 2-day delay. The endpoints should be available by Thursday EOD."
Patrick: "That's a critical path dependency. Amanda, can you work on anything else in the meantime? We can't afford a slip."
Amanda: "I can start scaffolding the components and work with mock data. It's not ideal, but it's better than being blocked."
Patrick: "Good. Let's do that. Let's circle back on Friday to check the status. Thanks, everyone."
`;

interface MessagesViewProps {
    user: User | null;
    onReact: (messageId: number, emoji: string) => void;
    searchQuery: string;
    onStartCall: (channelId: string, callType: 'audio' | 'video') => void;
}

const MessagesView: React.FC<MessagesViewProps> = ({ user, onReact, searchQuery, onStartCall }) => {
    const [conversations, setConversations] = useState<DirectConversation[]>(dummyConversations);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>('dm1');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = (message: string, file?: File) => {
        if (!selectedConversationId) return;
        setIsLoading(true);
        // Dummy implementation for sending messages
        setTimeout(() => setIsLoading(false), 1000);
    };

    const handleMarkAllAsRead = () => {
        setConversations(prev =>
            prev.map(c => ({ ...c, unreadCount: 0 }))
        );
    };

    const hasUnreadMessages = conversations.some(c => c.unreadCount && c.unreadCount > 0);

    const handleGenerateSummary = async () => {
        if (!selectedConversationId) return;
        
        setIsGeneratingSummary(true);
        
        const loadingMessage: Message = {
            id: Date.now(),
            role: Role.MODEL,
            content: "Generating meeting summary with local AI...",
            type: 'summary'
        };

        setConversations(prev => prev.map(c => 
            c.id === selectedConversationId 
            ? { ...c, messages: [...c.messages, loadingMessage] } 
            : c
        ));

        try {
            const data = await apiGenerateSummary(mockMeetingTranscript);
            const summaryMessage: Message = {
                id: Date.now() + 1,
                role: Role.MODEL,
                content: data.summary,
                type: 'summary'
            };

            setConversations(prev => prev.map(c => {
                if (c.id === selectedConversationId) {
                    const newMessages = c.messages.slice(0, -1); // Remove loading message
                    return { 
                        ...c, 
                        messages: [...newMessages, summaryMessage],
                        lastMessage: 'Meeting Summary',
                        timestamp: 'now',
                    };
                }
                return c;
            }));

        } catch (error) {
            console.error("Error generating summary:", error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                role: Role.MODEL,
                content: "Sorry, I couldn't generate a summary from the local AI engine.",
                type: 'text' // Render as a normal error text
            };
             setConversations(prev => prev.map(c => {
                if (c.id === selectedConversationId) {
                    const newMessages = c.messages.slice(0, -1); // Remove loading message
                    return { ...c, messages: [...newMessages, errorMessage] };
                }
                return c;
            }));
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    return (
        <div className="flex-1 flex min-w-0 h-full">
            <aside className={`bg-background-panel flex flex-col border-r border-border-color transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-96'}`}>
                <header className="p-4 border-b border-border-color shadow-sm h-[61px] flex items-center justify-between shrink-0">
                    {!isCollapsed && (
                        <div className="overflow-hidden flex-1">
                            <h1 className="text-xl font-bold text-text-primary truncate">Direct Messages</h1>
                            <p className="text-xs text-text-secondary truncate">All your conversations</p>
                        </div>
                    )}
                    {!isCollapsed && hasUnreadMessages && (
                        <button 
                            onClick={handleMarkAllAsRead}
                            className="text-xs font-semibold text-accent hover:underline ml-2 shrink-0"
                            title="Mark all as read"
                        >
                            Mark all as read
                        </button>
                    )}
                     <button 
                        onClick={() => setIsCollapsed(!isCollapsed)} 
                        className="text-text-secondary hover:text-text-primary p-1 ml-2 shrink-0"
                        aria-label={isCollapsed ? 'Expand messages list' : 'Collapse messages list'}
                    >
                        {isCollapsed ? <DoubleArrowRightIcon className="w-5 h-5" /> : <DoubleArrowLeftIcon className="w-5 h-5" />}
                    </button>
                </header>
                
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredConversations.length > 0 ? (
                        <div className="space-y-1">
                            {filteredConversations.map(dm => (
                                <MessageListItem 
                                    key={dm.id} 
                                    message={dm} 
                                    isActive={dm.id === selectedConversationId}
                                    isCollapsed={isCollapsed}
                                    onClick={() => setSelectedConversationId(dm.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-text-secondary p-4">
                            No conversations found.
                        </div>
                    )}
                </div>
            </aside>
            <main className="flex-1 flex flex-col bg-background-main min-w-0">
                {selectedConversation ? (
                    <ConversationView 
                        conversation={selectedConversation} 
                        onSendMessage={handleSendMessage} 
                        isLoading={isLoading || isGeneratingSummary}
                        onGenerateSummary={handleGenerateSummary}
                        user={user}
                        typingUserName={null}
                        onTypingStart={() => {}}
                        onTypingStop={() => {}}
                        onMarkAsRead={() => {
                            if (selectedConversationId) {
                                setConversations(prev =>
                                    prev.map(c =>
                                        c.id === selectedConversationId
                                            ? { ...c, unreadCount: 0 }
                                            : c
                                    )
                                );
                            }
                        }}
                        onReact={onReact}
                        onStartCall={(type) => onStartCall(selectedConversation.id, type)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-text-secondary">Select a conversation to start messaging.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MessagesView;