import React, { useState, useMemo } from 'react';
import { Project, ProjectTask, ProjectComment, ProjectFile, User, Subtask, TaskPriority } from '../types';
import { ChevronLeftIcon, PencilIcon, ShareIcon, ClipboardListIcon, ChatBubbleBottomCenterTextIcon, PaperClipIcon, UsersIcon, CheckCircleIcon, DocumentTextIcon, ArrowDownTrayIcon, PlusIcon, ArrowUturnLeftIcon, ClockIcon } from './icons';
import { availableUsers, projectComments as initialProjectComments, projectFiles } from '../data/mock';
import NewTaskModal from './NewTaskModal';

// --- SUB-COMPONENTS ---

const DetailCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }> = ({ title, icon, children, action }) => (
    <div className="bg-background-panel p-5 rounded-xl border border-border-color/70">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                {icon}
                <h3 className="font-bold text-text-primary">{title}</h3>
            </div>
            {action}
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const TaskListItem: React.FC<{ task: ProjectTask; onEdit: (task: ProjectTask) => void; }> = ({ task, onEdit }) => {
    const getDueDateInfo = (dueDateString?: string) => {
        if (!dueDateString) return null;

        const now = new Date();
        // Get today's date at midnight UTC to avoid timezone issues.
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        
        // The input is 'YYYY-MM-DD'. Creating a date from it might be timezone-dependent.
        // To be safe, parse it manually and create a UTC date.
        const [year, month, day] = dueDateString.split('-').map(Number);
        const due = new Date(Date.UTC(year, month - 1, day));

        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        const formattedDate = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

        if (diffDays < 0) {
          return { text: `Due ${formattedDate}`, color: 'text-status-red' };
        } else if (diffDays === 0) {
          return { text: 'Due today', color: 'text-yellow-500' };
        } else {
          return { text: `Due ${formattedDate}`, color: 'text-text-secondary' };
        }
    };

    const dueDateInfo = getDueDateInfo(task.dueDate);

    return (
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-background-main group/taskitem">
            <div>
                 {task.completed ? <CheckCircleIcon className="w-5 h-5 text-accent" /> : <div className="w-5 h-5 rounded-full border-2 border-border-color bg-input-field" />}
            </div>
            <div className="flex-1">
                <p className={`text-text-primary ${task.completed ? 'line-through text-text-secondary' : ''}`}>{task.title}</p>
            </div>
            {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-text-secondary shrink-0">
                    <PaperClipIcon className="w-4 h-4" />
                    <span>{task.attachments.length}</span>
                </div>
            )}
            {dueDateInfo && (
                <div className={`flex items-center gap-1.5 text-xs font-medium shrink-0 ${dueDateInfo.color}`}>
                    <ClockIcon className="w-4 h-4" />
                    <span>{dueDateInfo.text}</span>
                </div>
            )}
            {task.assignee && (
                 <img src={task.assignee.avatar} alt={task.assignee.name} className="w-6 h-6 rounded-full object-cover shrink-0" title={`Assigned to ${task.assignee.name}`} />
            )}
            <button onClick={() => onEdit(task)} className="opacity-0 group-hover/taskitem:opacity-100 text-text-secondary hover:text-text-primary transition-opacity p-1">
                <PencilIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

const FileListItem: React.FC<{ file: ProjectFile }> = ({ file }) => {
    const getFileIcon = (type: ProjectFile['type']) => {
        switch (type) {
            case 'PDF': return <DocumentTextIcon className="w-6 h-6 text-status-red" />;
            case 'Image': return <DocumentTextIcon className="w-6 h-6 text-accent" />;
            case 'Word': return <DocumentTextIcon className="w-6 h-6 text-blue-500" />;
            default: return <DocumentTextIcon className="w-6 h-6 text-text-secondary" />;
        }
    }
    return (
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-background-main">
            <div className="w-10 h-10 bg-input-field rounded-lg flex items-center justify-center shrink-0">
                {getFileIcon(file.type)}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-text-primary truncate text-sm">{file.name}</p>
                <p className="text-xs text-text-secondary">{file.size}</p>
            </div>
            <a href={file.url} download className="text-text-secondary hover:text-text-primary p-2 rounded-md" aria-label={`Download ${file.name}`}>
                <ArrowDownTrayIcon className="w-5 h-5" />
            </a>
        </div>
    );
}

// --- MAIN VIEW COMPONENT ---

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onBack }) => {
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<ProjectTask | null>(null);
    const [tasks, setTasks] = useState<ProjectTask[]>(project.tasks || []);
    const [comments, setComments] = useState<ProjectComment[]>(initialProjectComments);
    const [replyingTo, setReplyingTo] = useState<ProjectComment | null>(null);
    const [newCommentText, setNewCommentText] = useState('');

    const [statusFilter, setStatusFilter] = useState('All');
    const [assigneeFilter, setAssigneeFilter] = useState('All');

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => {
                if (statusFilter === 'All') return true;
                if (statusFilter === 'Completed') return task.completed;
                if (statusFilter === 'Pending') return !task.completed;
                return true;
            })
            .filter(task => {
                if (assigneeFilter === 'All') return true;
                if (assigneeFilter === 'Unassigned') return !task.assignee;
                // If a specific assignee is selected, unassigned tasks should be filtered out.
                if (!task.assignee) return false; 
                return task.assignee.id === parseInt(assigneeFilter);
            });
    }, [tasks, statusFilter, assigneeFilter]);

    const handleOpenCreateModal = () => {
        setTaskToEdit(null);
        setIsTaskModalOpen(true);
    };

    const handleOpenEditModal = (task: ProjectTask) => {
        setTaskToEdit(task);
        setIsTaskModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsTaskModalOpen(false);
        setTaskToEdit(null);
    };

    const handleSaveTask = (taskData: {
        id?: string;
        title: string;
        description: string;
        assigneeId: number | null;
        dueDate: string | null;
        subtasks: Subtask[];
        priority: TaskPriority;
        labels: string[];
        attachments: ProjectFile[];
    }) => {
        const assignee = taskData.assigneeId ? availableUsers.find(u => u.id === taskData.assigneeId) : undefined;

        const fullTaskData = {
            title: taskData.title,
            description: taskData.description,
            assignee: assignee,
            dueDate: taskData.dueDate || undefined,
            subtasks: taskData.subtasks,
            priority: taskData.priority,
            labels: taskData.labels,
            attachments: taskData.attachments,
        };

        if (taskData.id) { // Edit mode
            setTasks(prevTasks => prevTasks.map(t =>
                t.id === taskData.id
                ? { ...t, ...fullTaskData }
                : t
            ));
        } else { // Create mode
            const newTask: ProjectTask = {
                id: `t${Date.now()}`,
                completed: false,
                ...fullTaskData,
            };
            setTasks(prevTasks => [newTask, ...prevTasks]);
        }
        handleCloseModal();
    };

    const addReplyToComment = (
        comments: ProjectComment[], 
        parentId: string, 
        reply: ProjectComment
    ): ProjectComment[] => {
        return comments.map(comment => {
            if (comment.id === parentId) {
                return {
                    ...comment,
                    replies: [...(comment.replies || []), reply]
                };
            }
            if (comment.replies) {
                return {
                    ...comment,
                    replies: addReplyToComment(comment.replies, parentId, reply)
                };
            }
            return comment;
        });
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCommentText.trim()) return;

        const newComment: ProjectComment = {
            id: `c${Date.now()}`,
            user: availableUsers[4], // Assuming current user is Esther Howard
            content: newCommentText,
            timestamp: 'just now',
            replies: []
        };

        if (replyingTo) {
            setComments(prevComments => addReplyToComment(prevComments, replyingTo.id, newComment));
        } else {
            setComments(prevComments => [...prevComments, newComment]);
        }

        setNewCommentText('');
        setReplyingTo(null);
    };

    const CommentItem: React.FC<{ comment: ProjectComment; onReply: (comment: ProjectComment) => void; }> = ({ comment, onReply }) => {
        return (
            <div>
                <div className="flex items-start gap-3">
                    <img src={comment.user.avatar} alt={comment.user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="flex-1 bg-background-main p-3 rounded-lg">
                        <div className="flex justify-between items-baseline">
                            <p className="font-semibold text-text-primary text-sm">{comment.user.name}</p>
                            <p className="text-xs text-text-secondary">{comment.timestamp}</p>
                        </div>
                        <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{comment.content}</p>
                        <button onClick={() => onReply(comment)} className="text-xs font-semibold text-accent hover:underline mt-2">Reply</button>
                    </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                    <div className="pt-4 pl-8 border-l-2 border-border-color/50 ml-4 space-y-4">
                        {comment.replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} onReply={onReply} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const themeClasses = {
        blue: { bg: 'bg-accent-soft', text: 'text-accent', progress: 'bg-accent' },
        orange: { bg: 'bg-tag-orange-soft', text: 'text-tag-orange', progress: 'bg-tag-orange' },
        pink: { bg: 'bg-tag-pink-soft', text: 'text-tag-pink', progress: 'bg-tag-pink' },
        purple: { bg: 'bg-accent-purple-soft', text: 'text-accent-purple', progress: 'bg-accent-purple' },
        sky: { bg: 'bg-tag-sky-soft', text: 'text-tag-sky', progress: 'bg-tag-sky' },
    };
    const theme = themeClasses[project.categoryTheme];

  return (
    <>
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto p-6 animate-fade-in">
        {/* Header */}
        <header className="flex-shrink-0 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-md hover:bg-background-panel text-text-secondary hover:text-text-primary">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-text-primary">{project.title}</h1>
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg ${theme.bg} ${theme.text}`}>{project.category}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">Track progress, tasks, and files all in one place.</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-background-panel flex items-center gap-2 text-sm font-semibold border border-border-color">
                    <ShareIcon className="w-4 h-4" />
                    <span>Share</span>
                </button>
                <button className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-hover transition-opacity flex items-center gap-2">
                    <PencilIcon className="w-4 h-4"/>
                    <span>Edit Project</span>
                </button>
            </div>
        </header>
        
        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div className="bg-background-panel p-5 rounded-xl border border-border-color/70">
                    <h3 className="font-bold text-text-primary mb-2">Description</h3>
                    <p className="text-text-secondary text-sm/relaxed">{project.description}</p>
                </div>
                {/* Tasks */}
                <DetailCard title="Tasks" icon={<ClipboardListIcon className="w-5 h-5 text-text-secondary" />} action={
                    <div className="flex items-center gap-2">
                        <div>
                            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-sm bg-input-field border border-border-color rounded-md px-2 py-1.5 focus:ring-accent focus:border-accent transition"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="assignee-filter" className="sr-only">Filter by assignee</label>
                            <select
                                id="assignee-filter"
                                value={assigneeFilter}
                                onChange={(e) => setAssigneeFilter(e.target.value)}
                                className="text-sm bg-input-field border border-border-color rounded-md px-2 py-1.5 focus:ring-accent focus:border-accent transition"
                            >
                                <option value="All">All Assignees</option>
                                <option value="Unassigned">Unassigned</option>
                                {project.members.map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleOpenCreateModal}
                            className="flex items-center gap-1.5 text-sm font-semibold bg-accent-soft text-accent px-3 py-1.5 rounded-md hover:bg-accent/30 border border-transparent transition-all"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span>Add Task</span>
                        </button>
                    </div>
                }>
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => <TaskListItem key={task.id} task={task} onEdit={handleOpenEditModal} />)
                    ) : (
                        <div className="text-center py-4 text-text-secondary">
                            <p>No tasks match the current filters.</p>
                        </div>
                    )}
                </DetailCard>
                {/* Discussion */}
                <DetailCard title="Discussion" icon={<ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-text-secondary" />}>
                    <div className="space-y-4">
                        {comments.map(comment => <CommentItem key={comment.id} comment={comment} onReply={setReplyingTo} />)}
                    </div>
                    <form onSubmit={handleCommentSubmit} className="mt-4 flex items-start gap-3">
                        <img src={availableUsers[4].avatar} alt={availableUsers[4].name} className="w-8 h-8 rounded-full object-cover shrink-0 mt-1.5" />
                        <div className={`w-full bg-input-field border border-border-color rounded-lg transition-all duration-300 ${replyingTo ? 'border-accent ring-1 ring-accent' : ''}`}>
                            {replyingTo && (
                                <div className="text-sm text-text-secondary px-3 pt-2 flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                        <ArrowUturnLeftIcon className="w-4 h-4" />
                                        <span>Replying to <strong>{replyingTo.user.name}</strong></span>
                                    </div>
                                    <button type="button" onClick={() => setReplyingTo(null)} className="font-bold hover:text-text-primary text-lg leading-none px-1 rounded-sm" aria-label="Cancel reply">&times;</button>
                                </div>
                            )}
                            <textarea
                                placeholder={replyingTo ? `Reply to ${replyingTo.user.name}...` : "Write a comment..."}
                                value={newCommentText}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleCommentSubmit(e);
                                    }
                                }}
                                onChange={e => setNewCommentText(e.target.value)}
                                rows={1}
                                className="w-full bg-transparent px-4 py-2 focus:outline-none transition text-sm resize-none overflow-hidden placeholder:text-text-secondary/70"
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = `${target.scrollHeight}px`;
                                }}
                            />
                        </div>
                    </form>
                </DetailCard>
                {/* Files */}
                <DetailCard title="Files" icon={<PaperClipIcon className="w-5 h-5 text-text-secondary" />} action={<button className="text-sm font-semibold text-accent hover:underline flex items-center gap-1"><PlusIcon className="w-4 h-4" /> Add File</button>}>
                    {projectFiles.map(file => <FileListItem key={file.id} file={file} />)}
                </DetailCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <DetailCard title="Project Progress" icon={<div />}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-text-primary">Progress</span>
                        <span className="text-sm font-bold text-text-primary">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-border-color rounded-full h-2">
                        <div className={`h-2 rounded-full ${theme.progress}`} style={{ width: `${project.progress}%` }}></div>
                    </div>
                    <p className="text-xs text-text-secondary text-center mt-2">3 of 5 milestones completed.</p>
                </DetailCard>
                <DetailCard title="Members" icon={<UsersIcon className="w-5 h-5 text-text-secondary" />}>
                    {project.members.map(member => (
                        <div key={member.id} className="flex items-center gap-3">
                            <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                                <p className="font-semibold text-text-primary text-sm">{member.name}</p>
                                <p className="text-xs text-text-secondary">{member.email}</p>
                            </div>
                        </div>
                    ))}
                </DetailCard>
            </div>
        </div>
        </div>
        {isTaskModalOpen && (
            <NewTaskModal
                onClose={handleCloseModal}
                onSaveTask={handleSaveTask}
                users={availableUsers}
                taskToEdit={taskToEdit}
            />
        )}
    </>
  );
};

export default ProjectDetailView;