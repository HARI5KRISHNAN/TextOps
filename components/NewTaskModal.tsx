import React, { useState, useEffect, useRef } from 'react';
import { XCircleIcon, PlusIcon, TrashIcon, PaperClipIcon } from './icons';
import { User, Task, Subtask, TaskPriority, ProjectFile } from '../types';

interface NewTaskModalProps {
  onClose: () => void;
  onSaveTask: (taskData: { id?: string; title: string; description: string; assigneeId: number | null, dueDate: string | null, subtasks: Subtask[], priority: TaskPriority, labels: string[], attachments: ProjectFile[] }) => void;
  users: User[];
  taskToEdit?: Task | null;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ onClose, onSaveTask, users, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [priority, setPriority] = useState<TaskPriority>('None');
  const [labels, setLabels] = useState<string[]>([]);
  const [currentLabelInput, setCurrentLabelInput] = useState('');
  const [attachments, setAttachments] = useState<ProjectFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!taskToEdit;

  useEffect(() => {
    if (isEditMode && taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setAssigneeId(taskToEdit.assignee?.id ?? null);
      setDueDate(taskToEdit.dueDate || '');
      setSubtasks(taskToEdit.subtasks || []);
      setPriority(taskToEdit.priority || 'None');
      setLabels(taskToEdit.labels || []);
      setAttachments(taskToEdit.attachments || []);
    }
  }, [taskToEdit, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSaveTask({ 
        id: taskToEdit?.id,
        title: title.trim(), 
        description: description.trim(), 
        assigneeId,
        dueDate: dueDate || null,
        subtasks: subtasks.filter(st => st.title.trim() !== ''),
        priority,
        labels,
        attachments,
      });
    }
  };

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { id: `sub-${Date.now()}`, title: '', completed: false }]);
  };

  const handleSubtaskChange = (id: string, newTitle: string) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, title: newTitle } : st));
  };
  
  const handleToggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };
  
  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentLabelInput.trim()) {
      e.preventDefault();
      const newLabel = currentLabelInput.trim();
      if (!labels.includes(newLabel)) {
        setLabels([...labels, newLabel]);
      }
      setCurrentLabelInput('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // FIX: Explicitly type `file` as `File` and use `as const` for type discrimination.
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type.startsWith('image/') ? 'Image' as const : (file.type === 'application/pdf' ? 'PDF' as const : file.type.includes('word') ? 'Word' as const : 'Generic' as const),
        url: '#', // In a real app, this would be a URL from a file upload service
      }));
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };
  
  const handleRemoveAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-background-panel rounded-lg shadow-xl w-full max-w-lg" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border-color flex justify-between items-center">
            <h2 className="text-xl font-bold text-text-primary">{isEditMode ? 'Edit Task' : 'Create New Task'}</h2>
            <button 
              onClick={onClose} 
              className="text-text-secondary hover:text-text-primary"
              aria-label="Close modal"
            >
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div>
                    <label htmlFor="task-title" className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                    <input
                        type="text"
                        id="task-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                        placeholder="e.g., Implement user authentication"
                        required
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="task-description" className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                    <textarea
                        id="task-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                        placeholder="Add more details about the task..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="task-assignee" className="block text-sm font-medium text-text-secondary mb-1">Assignee</label>
                      <select
                          id="task-assignee"
                          value={assigneeId ?? ''}
                          onChange={(e) => setAssigneeId(e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                      >
                          <option value="">Unassigned</option>
                          {users.map(user => (
                              <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label htmlFor="task-due-date" className="block text-sm font-medium text-text-secondary mb-1">Due Date</label>
                      <input
                          type="date"
                          id="task-due-date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                      />
                  </div>
                </div>
                <div>
                    <label htmlFor="task-priority" className="block text-sm font-medium text-text-secondary mb-1">Priority</label>
                    <select
                        id="task-priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TaskPriority)}
                        className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                    >
                        <option value="None">None</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="task-labels" className="block text-sm font-medium text-text-secondary mb-1">Labels / Tags</label>
                    <div className="flex flex-wrap items-center gap-2 bg-input-field border border-border-color rounded-lg p-2">
                        {labels.map(label => (
                            <span key={label} className="flex items-center gap-1 bg-accent-soft text-accent text-xs font-semibold px-2 py-1 rounded-full">
                                {label}
                                <button type="button" onClick={() => handleRemoveLabel(label)} className="text-accent hover:text-accent-hover font-bold">
                                    &times;
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            id="task-labels"
                            value={currentLabelInput}
                            onChange={(e) => setCurrentLabelInput(e.target.value)}
                            onKeyDown={handleLabelKeyDown}
                            className="flex-grow bg-transparent focus:outline-none text-sm p-1"
                            placeholder={labels.length > 0 ? '' : 'Type and press Enter...'}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Subtasks</label>
                    <div className="space-y-2">
                      {subtasks.map((subtask) => (
                        <div key={subtask.id} className="flex items-center gap-2 group">
                          <input 
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={() => handleToggleSubtask(subtask.id)}
                            className="w-4 h-4 text-accent bg-input-field border-border-color rounded focus:ring-accent"
                          />
                          <input
                            type="text"
                            value={subtask.title}
                            onChange={(e) => handleSubtaskChange(subtask.id, e.target.value)}
                            className={`w-full px-3 py-1.5 bg-input-field border border-border-color rounded-md focus:ring-accent focus:border-accent transition text-sm ${subtask.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}
                            placeholder="Describe subtask..."
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteSubtask(subtask.id)}
                            className="text-text-secondary hover:text-status-red opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete subtask"
                          >
                            <TrashIcon className="w-4 h-4"/>
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSubtask}
                      className="mt-2 flex items-center gap-2 text-sm text-accent font-semibold hover:text-accent-hover"
                    >
                      <PlusIcon className="w-4 h-4"/>
                      Add Subtask
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Attachments</label>
                    <div className="space-y-2">
                        {attachments.map(file => (
                            <div key={file.id} className="flex items-center gap-2 p-2 bg-input-field rounded-md border border-border-color">
                                <PaperClipIcon className="w-4 h-4 text-text-secondary shrink-0"/>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm text-text-primary truncate">{file.name}</p>
                                    <p className="text-xs text-text-secondary">{file.size}</p>
                                </div>
                                <button type="button" onClick={() => handleRemoveAttachment(file.id)} className="text-text-secondary hover:text-status-red">
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 flex items-center gap-2 text-sm text-accent font-semibold hover:text-accent-hover"
                    >
                        <PlusIcon className="w-4 h-4"/>
                        Add Files
                    </button>
                </div>
            </div>
            <div className="p-4 bg-background-main rounded-b-lg border-t border-border-color flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-4 py-2 bg-background-panel border border-border-color text-text-primary font-semibold rounded-lg hover:bg-background-main transition-colors"
                >
                    Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:bg-gray-400"
                  disabled={!title.trim()}
                >
                    {isEditMode ? 'Save Changes' : 'Create Task'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;