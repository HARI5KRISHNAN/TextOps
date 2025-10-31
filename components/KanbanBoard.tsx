import React, { useState, useMemo } from 'react';
import { Project, User } from '../types';
import { PlusIcon, EllipsisHorizontalIcon, PaperClipIcon, ChatBubbleLeftIcon, UsersIcon, ClockIcon, PencilIcon, EnvelopeIcon, ChevronDownIcon, ChartPieIcon, CheckCircleIcon } from './icons';
import NewProjectModal from './NewProjectModal';
import { availableUsers } from '../data/mock';

// --- SUB-COMPONENTS ---

const CircularProgress: React.FC<{ percentage: number, size?: number, strokeWidth?: number }> = ({ percentage, size = 160, strokeWidth = 14 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                <circle className="text-gray-200 dark:text-border-color" stroke="currentColor" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} fill="transparent" />
                <circle 
                    className="text-accent-purple"
                    stroke="currentColor"
                    cx={size/2} 
                    cy={size/2} 
                    r={radius} 
                    strokeWidth={strokeWidth} 
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-text-primary">{percentage}%</span>
            </div>
        </div>
    );
};

const ProjectCard: React.FC<{ project: Project; onSelectProject: (projectId: string) => void; }> = ({ project, onSelectProject }) => {
    const themeClasses = {
        blue: { bg: 'bg-accent-soft', text: 'text-accent', progress: 'bg-accent' },
        orange: { bg: 'bg-tag-orange-soft', text: 'text-tag-orange', progress: 'bg-tag-orange' },
        pink: { bg: 'bg-tag-pink-soft', text: 'text-tag-pink', progress: 'bg-tag-pink' },
        purple: { bg: 'bg-accent-purple-soft', text: 'text-accent-purple', progress: 'bg-accent-purple' },
        sky: { bg: 'bg-tag-sky-soft', text: 'text-tag-sky', progress: 'bg-tag-sky' },
    };
    const theme = themeClasses[project.categoryTheme];

    return (
        <div 
            onClick={() => onSelectProject(project.id)}
            className={`bg-background-panel p-4 rounded-2xl border border-border-color/50 space-y-3 transition-all duration-300 cursor-pointer hover:border-accent-purple hover:shadow-lg ${project.highlighted ? 'highlighted-card' : ''}`}
        >
            <div className="flex justify-between items-center">
                <span className={`px-3 py-1 text-xs font-bold rounded-lg ${theme.bg} ${theme.text}`}>{project.category}</span>
                <button className="text-text-secondary hover:text-text-primary" onClick={(e) => e.stopPropagation()}>
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>
            </div>
            <h3 className="font-bold text-text-primary">{project.title}</h3>
            <p className="text-xs text-text-secondary">{project.description}</p>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-text-secondary">Progress</span>
                    <span className="text-xs font-bold text-text-primary">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-border-color rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${theme.progress}`} style={{ width: `${project.progress}%` }}></div>
                </div>
            </div>

            {/* TASKS PREVIEW */}
            {project.tasks && project.tasks.length > 0 && (
                <div className="border-t border-border-color/50 pt-3 space-y-2">
                    {project.tasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center justify-between text-xs group/task">
                            <div className="flex items-center gap-2 overflow-hidden">
                                {task.completed ? 
                                    <CheckCircleIcon className="w-4 h-4 text-accent shrink-0" /> : 
                                    <div className="w-3.5 h-3.5 border-2 border-border-color rounded-full shrink-0" />
                                }
                                <span className={`truncate ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{task.title}</span>
                            </div>
                            {task.assignee && (
                                <img src={task.assignee.avatar} alt={task.assignee.name} className="w-5 h-5 rounded-full object-cover shrink-0 ml-2" title={`Assigned to ${task.assignee.name}`} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map(member => (
                        <img key={member.id} src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full ring-2 ring-background-panel object-cover" />
                    ))}
                    {project.members.length > 4 && (
                        <div className="w-6 h-6 rounded-full ring-2 ring-background-panel bg-background-main flex items-center justify-center text-text-secondary text-[10px] font-bold">
                            +{project.members.length - 4}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-text-secondary font-medium">
                    <div className="flex items-center gap-1">
                        <PaperClipIcon className="w-4 h-4" />
                        <span>{project.attachments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                        <span>{project.comments}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProjectColumn: React.FC<{ title: string, projects: Project[], onSelectProject: (projectId: string) => void; }> = ({ title, projects, onSelectProject }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg text-text-primary">{title}</h2>
                <button className="text-text-secondary hover:text-text-primary bg-background-panel p-1 rounded-md">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-4">
                {projects.map(p => <ProjectCard key={p.id} project={p} onSelectProject={onSelectProject} />)}
            </div>
        </div>
    );
};

const ProjectsSidebar: React.FC = () => {
    return (
        <aside className="w-[340px] flex-shrink-0 p-6 space-y-6 overflow-y-auto no-scrollbar hidden lg:block">
            <div className="bg-background-panel p-4 rounded-2xl border border-border-color/50">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-text-secondary">SELECTED</p>
                        <p className="font-bold text-text-primary">Design Team</p>
                    </div>
                    <div className="w-10 h-10 bg-tag-orange-soft rounded-lg flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-tag-orange" />
                    </div>
                </div>
                <div className="flex justify-center my-4">
                    <CircularProgress percentage={72} />
                </div>
            </div>

            <div className="bg-background-panel p-4 rounded-2xl border border-border-color/50">
                <h3 className="font-bold text-text-primary mb-4">Projects</h3>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard title="Total" value="144" color="border-accent-purple" />
                    <StatCard title="Completed" value="56" color="border-tag-orange" />
                    <StatCard title="In Progress" value="72" color="border-tag-pink" />
                    <StatCard title="Waiting" value="24" color="border-tag-sky" />
                </div>
            </div>
            
            <div className="bg-background-panel p-4 rounded-2xl border border-border-color/50">
                <div className="flex justify-between items-center">
                    <div>
                         <p className="text-sm font-semibold text-text-primary">Sunday, 20 December</p>
                         <p className="text-xs text-text-secondary">08:00-11:00 AM</p>
                    </div>
                    <button className="text-text-secondary hover:text-text-primary"><PencilIcon className="w-4 h-4"/></button>
                </div>
                 <div className="mt-3 flex items-start gap-3">
                    <div className="w-8 h-8 bg-accent-purple-soft rounded-lg flex items-center justify-center shrink-0">
                        <ClockIcon className="w-5 h-5 text-accent-purple" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">Meeting with client</p>
                        <p className="text-xs text-text-secondary">Final brief and project onboarding</p>
                    </div>
                </div>
            </div>

            <div className="bg-background-panel p-4 rounded-2xl border border-border-color/50">
                 <div className="flex justify-between items-center">
                    <div>
                         <p className="text-sm font-semibold text-text-primary">Declaration centre</p>
                         <p className="text-xs text-text-secondary">Internal Messages</p>
                    </div>
                    <button className="text-text-secondary hover:text-text-primary"><ChevronDownIcon className="w-5 h-5"/></button>
                </div>
                 <div className="mt-3 flex items-start gap-3">
                    <div className="w-8 h-8 bg-accent-soft rounded-lg flex items-center justify-center shrink-0">
                        <EnvelopeIcon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">Project submission</p>
                        <p className="text-xs text-text-secondary">You have 2 new submissions</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const StatCard: React.FC<{title: string, value: string, color: string}> = ({title, value, color}) => (
    <div className={`p-3 bg-background-main rounded-lg border-l-4 ${color}`}>
        <p className="text-xs text-text-secondary">{title}</p>
        <p className="text-xl font-bold text-text-primary">{value}</p>
    </div>
);


// --- MAIN COMPONENT ---
interface ProjectsDashboardProps {
    projects: Project[];
    onSelectProject: (projectId: string) => void;
    onAddProject: () => void;
}

const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({ projects, onSelectProject, onAddProject }) => {
    const groupedProjects = useMemo(() => {
        return projects.reduce((acc, project) => {
            if (!acc[project.status]) {
                acc[project.status] = [];
            }
            acc[project.status].push(project);
            return acc;
        }, {} as Record<Project['status'], Project[]>);
    }, [projects]);

    return (
        <div className="flex-1 flex min-w-0 h-full overflow-hidden">
            <main className="flex-1 p-6 flex flex-col overflow-y-auto no-scrollbar">
                <header className="flex-shrink-0 mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
                    <div className="flex items-center gap-2">
                        <button className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-background-panel">
                            <ChartPieIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onAddProject}
                            className="bg-accent-purple text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                            <PlusIcon className="w-4 h-4"/>
                            <span>Create Project</span>
                        </button>
                    </div>
                </header>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ProjectColumn title="Started" projects={groupedProjects['Started'] || []} onSelectProject={onSelectProject} />
                    <ProjectColumn title="On Going" projects={groupedProjects['On Going'] || []} onSelectProject={onSelectProject} />
                    <ProjectColumn title="Completed" projects={groupedProjects['Completed'] || []} onSelectProject={onSelectProject} />
                </div>
            </main>
            <ProjectsSidebar />
        </div>
    );
};

export default ProjectsDashboard;