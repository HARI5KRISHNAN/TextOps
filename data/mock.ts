import { User, Project, ProjectTask, ProjectComment, ProjectFile } from '../types';

export const availableUsers: User[] = [
    { id: 1, name: 'Patrick Newman', email: 'patrick@example.com', avatar: 'https://i.pravatar.cc/40?u=1' },
    { id: 2, name: 'Yulia Polischuk', email: 'yulia@example.com', avatar: 'https://i.pravatar.cc/40?u=2' },
    { id: 3, name: 'Amanda Freeze', email: 'amanda@example.com', avatar: 'https://i.pravatar.cc/40?u=3' },
    { id: 4, name: 'Anatoly Belik', email: 'anatoly@example.com', avatar: 'https://i.pravatar.cc/40?u=4' },
    { id: 5, name: 'Esther Howard', email: 'esther@example.com', avatar: 'https://i.pravatar.cc/40?u=esther' },
];

// --- MOCK DATA FOR PROJECT DETAIL VIEW ---
const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);

export const projectFiles: ProjectFile[] = [
    { id: 'f1', name: 'Project_Brief_v2.pdf', size: '2.3 MB', type: 'PDF', url: '#' },
    { id: 'f2', name: 'Homepage_Mockups.jpg', size: '5.1 MB', type: 'Image', url: '#' },
    { id: 'f3', name: 'User_Flow_Diagram.pdf', size: '1.2 MB', type: 'PDF', url: '#' },
    { id: 'f4', name: 'Marketing_Copy.docx', size: '128 KB', type: 'Word', url: '#' },
];

export const projectTasks: ProjectTask[] = [
    { id: 't1', title: 'Finalize homepage mockup', completed: true, assignee: availableUsers[1], dueDate: yesterday.toISOString().split('T')[0] },
    { id: 't2', title: 'Develop user authentication flow', completed: true, assignee: availableUsers[3], dueDate: today.toISOString().split('T')[0] },
    { id: 't3', title: 'Set up database schema', completed: false, assignee: availableUsers[4], dueDate: tomorrow.toISOString().split('T')[0], attachments: [projectFiles[2]] },
    { id: 't4', title: 'Integrate payment gateway API', completed: false, dueDate: nextWeek.toISOString().split('T')[0], attachments: [projectFiles[0], projectFiles[3]] },
    { id: 't5', title: 'User testing for the new dashboard', completed: false, assignee: availableUsers[2] },
    { id: 't6', title: 'Create wireframes for mobile view', completed: true, assignee: availableUsers[0], dueDate: yesterday.toISOString().split('T')[0] },
    { id: 't7', title: 'Write API documentation', completed: false, assignee: availableUsers[3], dueDate: nextWeek.toISOString().split('T')[0] },
    { id: 't8', title: 'Deploy to staging server', completed: false },
    { id: 't9', title: 'Fix login page CSS bug', completed: true, assignee: availableUsers[1] },
    { id: 't10', title: 'Client presentation preparation', completed: false, assignee: availableUsers[0], dueDate: tomorrow.toISOString().split('T')[0] },
];

export const projectComments: ProjectComment[] = [
    { 
        id: 'c1', 
        user: availableUsers[1], 
        content: 'The V2 mockups look great! I\'m starting the component implementation now.', 
        timestamp: '2 hours ago',
        replies: [
            {
                id: 'c1-r1',
                user: availableUsers[0],
                content: 'Awesome, let me know if you need any assets.',
                timestamp: '1 hour 55 mins ago'
            }
        ]
    },
    { id: 'c2', user: availableUsers[0], content: '@Yulia Polischuk Can you also provide the mobile screen versions?', timestamp: '1 hour ago' },
    { id: 'c3', user: availableUsers[4], content: 'Database migration is complete. The staging environment is updated with the new schema.', timestamp: '30 minutes ago' },
];

export const initialProjects: Project[] = [
    { id: 'p1', title: 'Web Design', category: 'Web Design', categoryTheme: 'blue', description: 'Wireframing, mockups, clients collaboration', progress: 50, members: [availableUsers[0], availableUsers[1], availableUsers[2], availableUsers[4]], comments: 6, attachments: 4, status: 'Started', tasks: [projectTasks[0], projectTasks[5]] },
    { id: 'p2', title: 'Mobile App', category: 'Mobile App', categoryTheme: 'orange', description: 'Wireframing, mockups, clients collaboration', progress: 30, members: [availableUsers[1], availableUsers[3], availableUsers[0]], comments: 6, attachments: 4, status: 'On Going', tasks: [projectTasks[6]] },
    { id: 'p3', title: 'Dashboard', category: 'Dashboard', categoryTheme: 'purple', description: 'Wireframing, mockups, clients collaboration', progress: 90, members: [availableUsers[3], availableUsers[0]], comments: 6, attachments: 4, status: 'Completed', tasks: [projectTasks[1], projectTasks[8]] },
    { id: 'p4', title: 'App Development', category: 'App Development', categoryTheme: 'pink', description: 'Wireframing, mockups, clients collaboration', progress: 60, members: [availableUsers[0], availableUsers[1], availableUsers[3]], comments: 6, attachments: 4, status: 'Started', tasks: [projectTasks[2], projectTasks[3], projectTasks[4]] },
    { id: 'p5', title: 'Dashboard', category: 'Dashboard', categoryTheme: 'purple', description: 'Wireframing, mockups, clients collaboration', progress: 40, members: [availableUsers[1], availableUsers[2], availableUsers[4]], comments: 6, attachments: 4, status: 'On Going', highlighted: true, tasks: [projectTasks[4], projectTasks[9]] },
    { id: 'p6', title: 'Landing Page', category: 'Landing Page', categoryTheme: 'sky', description: 'Wireframing, mockups, clients collaboration', progress: 70, members: [availableUsers[2], availableUsers[3], availableUsers[0]], comments: 6, attachments: 4, status: 'Completed', tasks: [] },
    { id: 'p7', title: 'Mobile App', category: 'Mobile App', categoryTheme: 'orange', description: 'Wireframing, mockups, clients collaboration', progress: 65, members: [availableUsers[0], availableUsers[1], availableUsers[2]], comments: 6, attachments: 4, status: 'Started', tasks: [projectTasks[7]] },
    { id: 'p8', title: 'Web Development', category: 'Web Development', categoryTheme: 'blue', description: 'Wireframing, mockups, clients collaboration', progress: 50, members: [availableUsers[4], availableUsers[1]], comments: 6, attachments: 4, status: 'On Going', tasks: [projectTasks[2]] },
    { id: 'p9', title: 'App Development', category: 'App Development', categoryTheme: 'pink', description: 'Wireframing, mockups, clients collaboration', progress: 80, members: [availableUsers[0], availableUsers[1], availableUsers[2], availableUsers[3]], comments: 6, attachments: 4, status: 'Completed', tasks: [projectTasks[1], projectTasks[6]] },
];