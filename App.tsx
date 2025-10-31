import React, { useState, useEffect, useRef } from 'react';
import { View, User, Project, Pod } from './types';
import NavigationSidebar from './components/NavigationSidebar';
import SettingsView from './components/SettingsView';
import PodStatusView from './components/PodStatusView';
import KanbanBoard from './components/KanbanBoard';
import MessagesView, { dummyConversations } from './components/MessagesView';
import PermissionManager from './components/PermissionManager';
import StatusBar from './components/StatusBar';
import ProjectDetailView from './components/ProjectDetailView';
import { initialProjects, availableUsers } from './data/mock';
import VideoCallView from './components/VideoCallView';
import NewProjectModal from './components/NewProjectModal';
import { useRealTimeK8s } from './hooks/useRealTimeK8s';

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
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('theme') as Theme) || 'dark'
  );
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [activeCallContact, setActiveCallContact] = useState<{ name: string; avatar: string; } | null>(null);
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video' | null>(null);
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  
  const { pods, connectionStatus } = useRealTimeK8s();


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

  const handleStartCall = (channelId: string, type: 'audio' | 'video') => {
    const contact = dummyConversations.find(c => c.id === channelId);
    if (contact) {
        setActiveCallContact({ name: contact.name, avatar: contact.avatar });
        setActiveCallType(type);
        setIsCallActive(true);
    } else {
        alert('Contact not found for call.');
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setActiveCallContact(null);
    setActiveCallType(null);
  };

  const handleOpenCreateProject = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsProjectModalOpen(true);
  };
  
  const handleSaveProject = (projectData: { id?: string; title: string; description: string; category: string; categoryTheme: Project['categoryTheme']; progress: number; members: User[] }) => {
    if (projectData.id) {
        // Edit existing project
        setProjects(prevProjects =>
            prevProjects.map(p =>
                p.id === projectData.id
                    ? { ...p, ...projectData }
                    : p
            )
        );
    } else {
        // Create new project
        const newProject: Project = {
            ...projectData,
            id: `p${Date.now()}`,
            status: 'Started',
            comments: Math.floor(Math.random() * 10),
            attachments: Math.floor(Math.random() * 5),
            tasks: [],
        };
        setProjects(prevProjects => [newProject, ...prevProjects]);
    }
    setIsProjectModalOpen(false);
    setProjectToEdit(null);
  };

  const handleOpenPodStatusView = () => {
    setActiveView('status');
  };

  const renderView = () => {
    if (activeView === 'home' && selectedProjectId) {
        const selectedProject = projects.find(p => p.id === selectedProjectId);
        if (selectedProject) {
            return <ProjectDetailView project={selectedProject} onBack={handleBackToProjects} onEditProject={() => handleOpenEditProject(selectedProject)} />;
        }
    }

    switch (activeView) {
      case 'home':
        return <KanbanBoard projects={projects} onSelectProject={handleSelectProject} onAddProject={handleOpenCreateProject} />;
      case 'messages':
        return (
          <MessagesView 
            user={user}
            searchQuery={userSearchQuery}
            onStartCall={handleStartCall}
          />
        );
      case 'permission':
        return <PermissionManager />;
      case 'status':
        return <PodStatusView pods={pods} connectionStatus={connectionStatus} />;
      case 'settings':
        return user ? <SettingsView user={user} onUpdateUser={handleUpdateUser} /> : null;
      default:
        return <KanbanBoard projects={projects} onSelectProject={handleSelectProject} onAddProject={handleOpenCreateProject} />;
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
        <main className="flex-1 flex min-w-0 overflow-y-auto no-scrollbar">
          {renderView()}
        </main>
        <StatusBar pods={pods} onOpenPodStatusView={handleOpenPodStatusView} />
      </div>
      {isCallActive && activeCallContact && activeCallType && (
        <VideoCallView 
          onEndCall={handleEndCall}
          contact={activeCallContact}
          callType={activeCallType}
        />
      )}
      {isProjectModalOpen && (
        <NewProjectModal
            onClose={() => { setIsProjectModalOpen(false); setProjectToEdit(null); }}
            onSaveProject={handleSaveProject}
            users={availableUsers}
            projectToEdit={projectToEdit}
        />
      )}
    </div>
  );
};

export default App;
