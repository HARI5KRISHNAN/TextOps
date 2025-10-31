import React, { useState, useEffect } from 'react';
import { XCircleIcon } from './icons';
import { User, Project } from '../types';

interface NewProjectModalProps {
  onClose: () => void;
  onSaveProject: (projectData: {
    id?: string;
    title: string;
    description: string;
    category: string;
    categoryTheme: Project['categoryTheme'];
    progress: number;
    members: User[];
  }) => void;
  users: User[];
  projectToEdit?: Project | null;
}

const categoryOptions: { value: string, theme: Project['categoryTheme'] }[] = [
    { value: 'Web Design', theme: 'blue' },
    { value: 'Mobile App', theme: 'orange' },
    { value: 'Dashboard', theme: 'purple' },
    { value: 'App Development', theme: 'pink' },
    { value: 'Landing Page', theme: 'sky' },
    { value: 'Web Development', theme: 'blue' },
];

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onSaveProject, users, projectToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categoryOptions[0].value);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  
  const isEditMode = !!projectToEdit;

  useEffect(() => {
    if (isEditMode && projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setCategory(projectToEdit.category);
      setProgress(projectToEdit.progress);
      setSelectedUserIds(projectToEdit.members.map(m => m.id));
    }
  }, [projectToEdit, isEditMode]);


  const handleMemberToggle = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const selectedCategory = categoryOptions.find(c => c.value === category)!;
      onSaveProject({
        id: projectToEdit?.id,
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory.value,
        categoryTheme: selectedCategory.theme,
        progress: progress,
        members: users.filter(u => selectedUserIds.includes(u.id)),
      });
    }
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
          <h2 className="text-xl font-bold text-text-primary">{isEditMode ? 'Edit Project' : 'Create New Project'}</h2>
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
              <label htmlFor="project-title" className="block text-sm font-medium text-text-secondary mb-1">Project Title</label>
              <input
                type="text"
                id="project-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                placeholder="e.g., New Marketing Website"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="project-description" className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                placeholder="Add a brief description of the project..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="project-category" className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                    <select
                        id="project-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                    >
                        {categoryOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.value}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="project-progress" className="block text-sm font-medium text-text-secondary mb-1">Progress (%)</label>
                    <input
                        type="number"
                        id="project-progress"
                        value={progress}
                        onChange={(e) => setProgress(Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)))}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                    />
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Assign Members</label>
              <div className="max-h-40 overflow-y-auto bg-input-field border border-border-color rounded-lg p-2 space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-background-main">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-medium text-text-primary">{user.name}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleMemberToggle(user.id)}
                      className="w-5 h-5 text-accent bg-background-panel border-border-color rounded focus:ring-accent focus:ring-offset-2 focus:ring-offset-background-panel"
                    />
                  </div>
                ))}
              </div>
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
              className="px-4 py-2 bg-accent-purple text-white font-semibold rounded-lg hover:opacity-90 transition-colors disabled:bg-gray-400"
              disabled={!title.trim()}
            >
              {isEditMode ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;