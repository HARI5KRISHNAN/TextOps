import React, { useState } from 'react';
import { Message, Role } from '../types';
import { UserIcon, ModelIcon, CopyIcon, SparklesIcon, CheckCircleIcon, EmojiHappyIcon } from './icons';
import CodeBlock from './CodeBlock';
import UserProfilePopover from './UserProfilePopover';

interface ChatMessageProps {
  message: Message;
  currentUserId: number | null;
  onReact: (messageId: number, emoji: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUserId, onReact }) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const isUser = message.sender?.id === currentUserId;
  const availableReactions = ['👍', '❤️', '😂', '🎉', '🤔'];

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };
  
  const handleReaction = (emoji: string) => {
    if (message.id) {
        onReact(message.id, emoji);
    }
    setShowReactionPicker(false);
  };

  const renderContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\s*([\s\S]+?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const [fullMatch, language, code] = match;
      const preText = content.slice(lastIndex, match.index);
      if (preText) {
        parts.push(<span key={lastIndex}>{preText}</span>);
      }
      parts.push(<CodeBlock key={match.index} code={code.trim()} language={language} />);
      lastIndex = match.index + fullMatch.length;
    }

    const remainingText = content.slice(lastIndex);
    if (remainingText) {
      parts.push(<span key={lastIndex}>{remainingText}</span>);
    }
    
    return parts;
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    if (now.toDateString() === messageDate.toDateString()) {
        return messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === messageDate.toDateString()) {
        return `Yesterday at ${messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }

    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };


  if (message.type === 'summary') {
    return (
      <div className="my-4 animate-fade-in border border-border-color bg-accent-soft rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <SparklesIcon className="w-5 h-5 text-accent"/>
          <h3 className="font-bold text-text-primary">Meeting Summary</h3>
        </div>
        <p className="text-text-secondary text-sm/relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    )
  }

  return (
    <div className={`group/message flex items-start gap-4 py-4 animate-fade-in`}>
      <div className="relative group flex-shrink-0">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-background-panel`}>
            {message.sender?.avatar ? (
              <img src={message.sender.avatar} alt={message.sender.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-text-primary" />
            )}
        </div>
        {message.sender && <UserProfilePopover user={message.sender} position="top" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <p className="font-bold text-text-primary">{isUser ? 'You' : message.sender?.name || 'User'}</p>
              <time className="text-xs text-text-secondary/60">{formatTimestamp(message.timestamp)}</time>
            </div>
            <div className="relative flex items-center gap-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
                <button 
                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                    className="text-text-secondary/50 hover:text-text-primary p-1 rounded-md" 
                    aria-label="Add reaction"
                >
                    <EmojiHappyIcon className="w-5 h-5" />
                </button>
                <button onClick={handleCopy} className="text-text-secondary/50 hover:text-text-primary p-1 rounded-md" aria-label="Copy message">
                    <CopyIcon className="w-4 h-4" />
                </button>
                {showReactionPicker && (
                    <div className="absolute z-10 bottom-full right-0 mb-2 bg-background-panel border border-border-color rounded-full shadow-lg p-1 flex gap-1 animate-fade-in">
                        {availableReactions.map(emoji => (
                            <button 
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className="text-xl p-1 rounded-full hover:bg-accent-soft transition-colors"
                                aria-label={`React with ${emoji}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className={`text-text-primary leading-relaxed whitespace-pre-wrap mt-1`}>
          {message.file && message.file.type.startsWith('image/') && (
            <div className="mb-2">
              <img 
                src={message.file.url} 
                alt={message.file.name || "attachment"} 
                className="max-w-xs rounded-lg border border-border-color" 
              />
            </div>
          )}
          {renderContent(message.content)}
          {message.content.length === 0 && !message.file && <div className="w-3 h-5 bg-gray-600 animate-pulse rounded"></div>}
        </div>
        {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(message.reactions).map(([emoji, userIdsValue]) => {
                    // FIX: Cast userIds from unknown to number[] to resolve type errors.
                    const userIds = userIdsValue as number[];
                    if (userIds.length === 0) return null;
                    const currentUserReacted = currentUserId !== null && userIds.includes(currentUserId);
                    return (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-sm transition-colors border ${
                                currentUserReacted 
                                ? 'bg-accent-soft border-accent text-accent' 
                                : 'bg-background-main border-border-color hover:border-accent'
                            }`}
                        >
                            <span>{emoji}</span>
                            <span className="font-semibold">{userIds.length}</span>
                        </button>
                    );
                })}
            </div>
        )}
         {isUser && message.isRead && (
            <div className="flex justify-end items-center mt-1">
                {/* FIX: Removed invalid "title" prop from CheckCircleIcon. */}
                <CheckCircleIcon className="w-4 h-4 text-accent"/>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;