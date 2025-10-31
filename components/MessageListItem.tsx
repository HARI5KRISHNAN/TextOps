import React from 'react';
import { DirectMessage } from '../types';

interface MessageListItemProps {
  message: DirectMessage;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const MessageListItem: React.FC<MessageListItemProps> = ({ message, isActive, isCollapsed, onClick }) => {
    // An item is considered "unread" if it has an unread count and is not the currently active chat.
    const isUnread = !!message.unreadCount && message.unreadCount > 0 && !isActive;

    if (isCollapsed) {
        return (
             <button 
                onClick={onClick} 
                className={`w-full flex justify-center p-3 rounded-md transition-colors relative group ${isActive ? 'bg-background-main' : 'hover:bg-background-main'}`}
                aria-label={message.name}
            >
                <div className="relative shrink-0">
                    <img src={message.avatar} alt={message.name} className="w-10 h-10 rounded-full object-cover" />
                    {message.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-status-green ring-2 ring-background-panel"></span>}
                </div>
                {isUnread && (
                    <span className="absolute top-1 right-1 text-xs font-bold bg-accent text-white rounded-full h-4 w-4 flex items-center justify-center shrink-0 text-[10px]">
                        {message.unreadCount! > 9 ? '9+' : message.unreadCount}
                    </span>
                )}
                <div className="absolute left-full ml-4 px-2 py-1 bg-background-panel border border-border-color text-text-primary text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {message.name}
                </div>
            </button>
        );
    }
    
  return (
    <button onClick={onClick} className={`w-full text-left p-3 flex items-center gap-4 rounded-md transition-colors ${isActive ? 'bg-background-main' : isUnread ? 'bg-accent-soft hover:bg-background-main' : 'hover:bg-background-main'}`}>
        <div className="relative shrink-0">
            <img src={message.avatar} alt={message.name} className="w-10 h-10 rounded-full object-cover" />
            {message.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-status-green ring-2 ring-background-panel"></span>}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
                <p className={`font-semibold truncate ${isUnread ? 'text-text-primary' : 'text-text-primary/80'}`}>{message.name}</p>
                <p className="text-xs text-text-secondary shrink-0 ml-2">{message.timestamp}</p>
            </div>
            <div className="flex justify-between items-center mt-1">
                <p className={`text-sm truncate ${isUnread ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>{message.lastMessage}</p>
                {isUnread && (
                    <span className="text-xs font-bold bg-accent text-white rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                        {message.unreadCount}
                    </span>
                )}
            </div>
        </div>
    </button>
  );
};

export default MessageListItem;