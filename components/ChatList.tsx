import React from 'react';
import { Group } from '../types';
import { HashIcon, PlusIcon } from './icons';

interface ChatListProps {
  group: Group;
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onCreateChat: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ group, activeChatId, onSelectChat, onCreateChat }) => {
  return (
    <aside className="w-64 bg-background-panel flex flex-col border-r border-border-color">
      <header className="p-4 border-b border-border-color shadow-sm h-[61px] flex items-center">
        <h2 className="text-lg font-bold text-text-primary">{group.name}</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex justify-between items-center px-2 py-1 mb-2">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Text Channels</h3>
            <button onClick={onCreateChat} className="text-text-secondary hover:text-text-primary transition-colors">
                <PlusIcon className="w-5 h-5"/>
            </button>
        </div>
        <ul>
          {group.chats.map((chat) => (
            <li key={chat.id}>
              <button
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors duration-150 group
                    ${activeChatId === chat.id 
                        ? 'bg-accent-soft text-text-primary' 
                        : 'text-text-secondary hover:bg-background-main hover:text-text-primary'
                    }
                `}
              >
                <HashIcon className={`w-5 h-5 ${activeChatId === chat.id ? 'text-text-secondary' : 'text-text-secondary/70 group-hover:text-text-secondary'}`} />
                <span className="font-medium text-sm">{chat.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default ChatList;