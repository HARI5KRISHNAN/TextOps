import React from 'react';
import { Task, Column, TaskPriority } from '../types';
import UserProfilePopover from './UserProfilePopover';
import { PencilAltIcon, ClockIcon, TrashIcon, ClipboardListIcon, FlagIcon } from './icons';

interface KanbanCardProps {
  task: Task;
  columnId: Column['id'];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task, columnId: Column['id']) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnd: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, columnId, onDragStart, onDragEnter, onDragEnd, onEdit, onDelete }) => {
  const getDueDateInfo = (dueDateString?: string) => {
    if (!dueDateString) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dueDate = new Date(dueDateString);
    const due = new Date(Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate()));

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

    if (diffDays < 0) {
      return { text: `Overdue`, color: 'text-status-red' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-status-red' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-500' };
    } else {
      return { text: `Due ${formattedDate}`, color: 'text-text-secondary' };
    }
  };
  
  const getPriorityInfo = (priority?: TaskPriority) => {
    if (!priority || priority === 'None') return null;
    
    const infoMap: Record<TaskPriority, { color: string; label: string }> = {
      'None': { color: '', label: ''}, // Should not be rendered
      'Low': { color: 'text-status-green', label: 'Low Priority' },
      'Medium': { color: 'text-yellow-500', label: 'Medium Priority' },
      'High': { color: 'text-status-red', label: 'High Priority' },
    };
    return infoMap[priority];
  };

  const dueDateInfo = getDueDateInfo(task.dueDate);
  const priorityInfo = getPriorityInfo(task.priority);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = hasSubtasks ? task.subtasks!.filter(st => st.completed).length : 0;
  const totalSubtasks = hasSubtasks ? task.subtasks!.length : 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task, columnId)}
      onDragEnter={(e) => onDragEnter(e, task.id)}
      onDragEnd={onDragEnd}
      className="group bg-background-panel p-4 rounded-lg border border-border-color cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow relative"
    >
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-md text-text-secondary hover:bg-background-main hover:text-text-primary"
          aria-label="Edit task"
        >
          <PencilAltIcon className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(task)}
          className="p-1.5 rounded-md text-text-secondary hover:bg-background-main hover:text-status-red"
          aria-label="Delete task"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      <h3 className="font-semibold text-text-primary mb-1 pr-12">{task.title}</h3>
      <p className="text-sm text-text-secondary">{task.description}</p>
      
      {task.labels && task.labels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
              {task.labels.map(label => (
                  <span key={label} className="px-2.5 py-1 bg-accent-soft text-accent text-xs font-bold rounded-full">
                      {label}
                  </span>
              ))}
          </div>
      )}

      <div className="mt-4 flex items-end justify-between">
        <div className="space-y-2">
            {dueDateInfo && (
                <div className={`flex items-center gap-1.5 text-xs font-medium ${dueDateInfo.color}`}>
                  <ClockIcon className="w-4 h-4" />
                  <span>{dueDateInfo.text}</span>
                </div>
              )
            }
            {(priorityInfo || hasSubtasks) && (
                <div className="flex items-center gap-3">
                    {priorityInfo && (
                        <div className="relative group/tooltip">
                            <FlagIcon className={`w-5 h-5 ${priorityInfo.color}`} />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-background-panel border border-border-color text-text-primary text-xs rounded-md shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {priorityInfo.label}
                            </div>
                        </div>
                    )}
                    {hasSubtasks && (
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${completedSubtasks === totalSubtasks ? 'text-status-green' : 'text-text-secondary'}`}>
                            <ClipboardListIcon className="w-5 h-5" />
                            <span className="font-semibold">{completedSubtasks}/{totalSubtasks}</span>
                        </div>
                    )}
                </div>
            )}
        </div>

        {task.assignee && (
          <div className="relative group shrink-0">
            <img src={task.assignee.avatar} alt={task.assignee.name} className="w-9 h-9 rounded-full object-cover" />
            <UserProfilePopover user={task.assignee} position="top" />
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;