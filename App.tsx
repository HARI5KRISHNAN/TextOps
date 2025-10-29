import React, { useState, useEffect, useRef } from 'react';
import { View, User, Project } from './types';
import NavigationSidebar from './components/NavigationSidebar';
import SettingsView from './components/SettingsView';
import PodStatusView from './components/PodStatusView';
import KanbanBoard from './components/KanbanBoard';
import MessagesView from './components/MessagesView';
import PermissionManager from './components/PermissionManager';
import StatusBar from './components/StatusBar';
import ProjectDetailView from './components/ProjectDetailView';
import { initialProjects } from './data/mock';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('whooper_user');
    try {
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            if (!parsedUser.level) {
                parsedUser.level = 'Elementary';
            }
            return parsedUser;
        }
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
    }
    return {
      id: 1,
      name: 'Esther Howard',
      email: 'esther@example.com',
      avatar: 'https://i.pravatar.cc/80?u=esther',
      level: 'Elementary',
    };
  });

  const [activeView, setActiveView] = useState<View>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('theme') as Theme) || 'dark'
  );
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  const handleUserSearchChange = (query: string) => {
    setUserSearchQuery(query);
    if (query && activeView !== 'messages') {
        setActiveView('messages');
    } else if (!query && activeView === 'messages') {
        setActiveView('home');
    }
  };

  useEffect(() => {
    if (user) {
        localStorage.setItem('whooper_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    alert('Profile updated successfully!');
  };
  
  const handleSelectProject = (projectId: string) => {
    setActiveView('home'); // Ensure we are on the 'home' view conceptually
    setSelectedProjectId(projectId);
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  const renderView = () => {
    if (activeView === 'home' && selectedProjectId) {
        const selectedProject = initialProjects.find(p => p.id === selectedProjectId);
        if (selectedProject) {
            return <ProjectDetailView project={selectedProject} onBack={handleBackToProjects} />;
        }
    }

    switch (activeView) {
      case 'home':
        return <KanbanBoard onSelectProject={handleSelectProject} />;
      case 'messages':
        return (
          <MessagesView 
            user={user}
            onReact={(messageId, emoji) => console.log(`Reacted to ${messageId} with ${emoji}`)}
            searchQuery={userSearchQuery}
            onStartCall={(channelId, type) => alert(`Starting ${type} call in ${channelId}...`)}
          />
        );
      case 'permission':
        return <PermissionManager />;
      case 'status':
        return <PodStatusView />;
      case 'settings':
        return user ? <SettingsView user={user} onUpdateUser={handleUpdateUser} /> : null;
      default:
        return <KanbanBoard onSelectProject={handleSelectProject}/>;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background-main font-sans text-sm overflow-hidden">
      <NavigationSidebar 
        user={user}
        activeView={activeView} 
        onNavigate={(view) => {
            setSelectedProjectId(null); // Deselect project when navigating away
            setActiveView(view);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        userSearchQuery={userSearchQuery}
        onUserSearchChange={handleUserSearchChange}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 flex min-w-0 overflow-y-auto">
          {renderView()}
        </main>
        <StatusBar />
      </div>
    </div>
  );
};

export default App;