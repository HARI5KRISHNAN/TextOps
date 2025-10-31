import React, { useState } from 'react';
import { Message, Role } from '../types';
import { UserIcon, ModelIcon, CopyIcon, SparklesIcon, CheckCircleIcon, EmojiHappyIcon } from './icons';
import CodeBlock from './CodeBlock';
import UserProfilePopover from './UserProfilePopover';

interface ChatMessageProps {
  message: Message;
  currentUserId: number | null;
  onReact: (messageId: number, emoji: string) => void;
  isSelected: boolean;
  onSelectMessage: (messageId: number) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUserId, onReact, isSelected, onSelectMessage }) => {
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
  
  const handleMessageClick = () => {
    // FIX: The type check is redundant because summary messages return early and don't have this onClick handler.
    if (message.id) {
      onSelectMessage(message.id);
    }
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
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    
    // Check if it's today
    if (now.toDateString() === messageDate.toDateString()) {
        return messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    
    // Check if it was yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === messageDate.toDateString()) {
        return `Yesterday`;
    }

    // For older dates, show month and day
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };


  if (message.type === 'summary') {
    const renderSummaryContent = (content: string) => {
        return content.split('\n').map((line, index) => {
            // Check for **Action Item:** pattern
            const actionItemMatch = line.match(/\*\*(.*?):\*\* (.*)/);
            if (actionItemMatch) {
                return (
                    <p key={index} className="mt-1">
                        <span className="font-bold text-text-primary">{actionItemMatch[1]}:</span>
                        <span> {actionItemMatch[2]}</span>
                    </p>
                );
            }
            // Check for bullet points
            if (line.trim().startsWith('* ')) {
                return (
                    <p key={index} className="pl-4 relative">
                        <span className="absolute left-0 top-0.5 text-accent">•</span>
                        {line.substring(line.indexOf('* ') + 2)}
                    </p>
                );
            }
            return <p key={index}>{line}</p>;
        });
    };

    return (
        <div className="my-2 py-2 animate-fade-in">
            <div className="mx-auto max-w-3xl border-l-4 border-accent bg-background-panel rounded-r-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="w-5 h-5 text-accent"/>
                    <h3 className="font-bold text-accent">Meeting Summary</h3>
                </div>
                <div className="text-sm/relaxed text-text-secondary space-y-1">
                    {renderSummaryContent(message.content)}
                </div>
            </div>
        </div>
    );
  }

  return (
    <div 
        // FIX: Removed redundant condition. Any message rendered here is not a summary and should be interactive.
        // This resolves a TypeScript error about comparing non-overlapping types.
        className={`group/message flex items-start gap-3 p-1 animate-fade-in rounded-lg transition-colors ${isUser ? 'flex-row-reverse' : ''} ${isSelected ? 'bg-accent-soft/50' : ''} cursor-pointer hover:bg-background-panel/50`}
        onClick={handleMessageClick}
    >
      <div className="relative group flex-shrink-0 mt-1">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center`}>
            {message.sender?.avatar ? (
              <img src={message.sender.avatar} alt={message.sender.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-text-primary" />
            )}
        </div>
        {message.sender && <UserProfilePopover user={message.sender} position="top" />}
      </div>

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`relative min-w-0 max-w-md lg:max-w-lg rounded-xl px-3.5 py-2.5 ${isUser ? 'bg-accent text-white' : 'bg-background-panel text-text-primary'}`}>
            <div className="flex items-baseline gap-2">
              <p className="font-bold text-sm">{isUser ? 'You' : message.sender?.name || 'User'}</p>
            </div>
            
            <div className="absolute top-2.5 right-3.5">
              <time className={`text-xs shrink-0 transition-opacity duration-300 opacity-0 group-hover/message:opacity-100 ${isUser ? 'text-white/70' : 'text-text-secondary/60'}`}>
                {formatTimestamp(message.timestamp)}
              </time>
            </div>

            <div className="leading-relaxed whitespace-pre-wrap mt-1 text-sm">
              {message.file && (
                <div className="mb-2">
                  {message.file.type.startsWith('image/') ? (
                    <img 
                      src={message.file.url} 
                      alt={message.file.name || "attachment"} 
                      className="max-w-xs rounded-lg border border-border-color" 
                    />
                  ) : message.file.type.startsWith('audio/') ? (
                    <audio 
                      src={message.file.url} 
                      controls 
                      className="max-w-xs rounded-md"
                    />
                  ) : null}
                </div>
              )}
              {renderContent(message.content)}
              {message.content.length === 0 && !message.file && <div className="w-3 h-5 bg-gray-600 animate-pulse rounded"></div>}
            </div>
          </div>
          
          {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div className={`mt-2 flex flex-wrap gap-2 ${isUser ? 'justify-end' : ''}`}>
                  {Object.entries(message.reactions).map(([emoji, userIdsValue]) => {
                      const userIds = userIdsValue as number[];
                      if (userIds.length === 0) return null;
                      const currentUserReacted = currentUserId !== null && userIds.includes(currentUserId);
                      return (
                          <button
                              key={emoji}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReaction(emoji);
                              }}
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs transition-colors border ${
                                  currentUserReacted 
                                  ? (isUser ? 'bg-white/25 border-white/30 text-white' : 'bg-accent-soft border-accent text-accent')
                                  : (isUser ? 'bg-white/10 border-transparent hover:bg-white/20' : 'bg-background-main border-border-color hover:border-accent')
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
              <div className="mt-1 flex items-center justify-end gap-1 text-xs">
                  <span className="text-text-secondary">Read</span>
                  <CheckCircleIcon className="w-3.5 h-3.5 text-accent"/>
              </div>
          )}
      </div>


      <div className={`relative self-center flex items-center gap-1 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 ${isUser ? '-order-1 mr-1' : ''}`}>
          <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowReactionPicker(!showReactionPicker);
              }}
              className="text-text-secondary/60 hover:text-text-primary p-1.5 rounded-full hover:bg-background-panel" 
              aria-label="Add reaction"
          >
              <EmojiHappyIcon className="w-5 h-5" />
          </button>
          <button onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }} className="text-text-secondary/60 hover:text-text-primary p-1.5 rounded-full hover:bg-background-panel" aria-label="Copy message">
              <CopyIcon className="w-4 h-4" />
          </button>
          {showReactionPicker && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className={`absolute z-10 bottom-full mb-1 bg-background-panel border border-border-color rounded-full shadow-lg p-1 flex gap-1 animate-fade-in ${isUser ? 'right-0' : 'left-0'}`}>
                  {availableReactions.map(emoji => (
                      <button 
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReaction(emoji);
                          }}
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
  );
};

export default ChatMessage;