import React from 'react';
import { SearchIcon, ServerIcon, ModelIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon, SunIcon, MoonIcon, SettingsIcon, HomeIcon, MessagesIcon, PermissionIcon } from './icons';
import { View, User } from '../types';

interface NavLinkProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    badge?: number;
    onClick?: () => void;
    isCollapsed: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, active, badge, onClick, isCollapsed }) => (
    <div className="relative group">
        <button 
            onClick={onClick} 
            className={`w-full flex items-center gap-3 rounded-lg text-left transition-colors duration-200
            ${active ? 'bg-accent text-white' : 'text-text-secondary hover:bg-background-panel hover:text-text-primary'}
            ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5'}
            `}
        >
            {icon}
            {!isCollapsed && <span className="font-semibold text-sm whitespace-nowrap">{label}</span>}
            {!isCollapsed && badge && <span className={`ml-auto text-xs font-bold rounded-full px-2 py-0.5 ${active ? 'bg-white/20 text-white' : 'bg-background-main text-text-secondary'}`}>{badge}</span>}
        </button>
        {isCollapsed && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-background-panel border border-border-color text-text-primary text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {label}
            </div>
        )}
    </div>
);

interface NavigationSidebarProps {
    user: User | null;
    activeView: View;
    onNavigate: (view: View) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    userSearchQuery: string;
    onUserSearchChange: (query: string) => void;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ user, activeView, onNavigate, isCollapsed, onToggleCollapse, theme, onToggleTheme, userSearchQuery, onUserSearchChange }) => {
  return (
    <nav className={`bg-background-main p-4 flex flex-col gap-4 border-r border-border-color transition-all duration-300 ease-in-out relative ${isCollapsed ? 'w-20' : 'w-72'}`}>
        
        <button 
            onClick={onToggleCollapse} 
            className="absolute -right-3 top-8 w-6 h-6 bg-background-panel border border-border-color rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent z-20"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
            {isCollapsed ? <DoubleArrowRightIcon className="w-4 h-4" /> : <DoubleArrowLeftIcon className="w-4 h-4" />}
        </button>

        <div className="flex-grow flex flex-col gap-4">
            <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
                <ModelIcon className="w-5 h-5 text-white"/>
              </div>
              {!isCollapsed && <h1 className="text-xl font-bold whitespace-nowrap text-text-primary">Whooper</h1>}
            </div>
          
            {!isCollapsed && (
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full bg-background-panel border border-border-color rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                    value={userSearchQuery}
                    onChange={(e) => onUserSearchChange(e.target.value)}
                 />
              </div>
            )}

            <div className="space-y-2">
                {!isCollapsed && <h2 className="text-xs font-bold text-text-secondary uppercase px-4 mb-2 tracking-wider">Main Menu</h2>}
                <div className="flex flex-col gap-1">
                    <NavLink icon={<HomeIcon className="w-5 h-5" />} label="Home" active={activeView === 'home'} onClick={() => onNavigate('home')} isCollapsed={isCollapsed} />
                    <NavLink icon={<MessagesIcon className="w-5 h-5" />} label="Messages" active={activeView === 'messages'} onClick={() => onNavigate('messages')} isCollapsed={isCollapsed} />
                    <NavLink icon={<PermissionIcon className="w-5 h-5" />} label="Permission" active={activeView === 'permission'} onClick={() => onNavigate('permission')} isCollapsed={isCollapsed} />
                    <NavLink icon={<ServerIcon className="w-5 h-5" />} label="Pod Status" active={activeView === 'status'} onClick={() => onNavigate('status')} isCollapsed={isCollapsed} />
                    <NavLink icon={<SettingsIcon className="w-5 h-5" />} label="Settings" active={activeView === 'settings'} onClick={() => onNavigate('settings')} isCollapsed={isCollapsed} />
                </div>
            </div>
        </div>
        
        <div className={`flex-shrink-0`}>
            <div className="relative group">
                <button
                onClick={onToggleTheme}
                className={`w-full flex items-center gap-3 rounded-lg text-left transition-colors duration-200 text-text-secondary hover:bg-background-panel hover:text-text-primary ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5'}`}
                >
                {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                {!isCollapsed && <span className="font-semibold text-sm whitespace-nowrap">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>
                {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-background-panel border border-border-color text-text-primary text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </div>
                )}
            </div>
        </div>


        {user && (
            <div className="flex-shrink-0 border-t border-border-color pt-4">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold text-sm text-text-primary truncate">{user.name}</p>
                            <p className="text-xs text-text-secondary truncate">{user.email}</p>
                        </div>
                    )}
                </div>
            </div>
        )}
    </nav>
  );
};

export default NavigationSidebar;