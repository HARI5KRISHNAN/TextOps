import React from 'react';
import { Column, Task, SortOption } from '../types';
import KanbanCard from './KanbanCard';
import { ChevronUpDownIcon } from './icons';

interface KanbanColumnProps {
  columnId: Column['id'];
  column: Column;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task, columnId: Column['id']) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, taskId: string | null) => void;
  onDragEnd: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ columnId, column, sortOption, onSortChange, onDragOver, onDrop, onDragStart, onDragEnter, onDragEnd, onEditTask, onDeleteTask }) => {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={(e) => onDragEnter(e, null)} // Entering the column but not a specific card
      className="bg-background-panel rounded-lg border border-border-color flex flex-col"
    >
      <header className="p-4 border-b border-border-color flex justify-between items-center">
        <h2 className="font-semibold text-text-primary flex items-center gap-2">
          {column.title}
          <span className="text-sm font-normal text-text-secondary bg-background-main px-2 py-0.5 rounded-full">{column.tasks.length}</span>
        </h2>
        <div className="relative group">
            <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="text-xs font-medium text-text-secondary bg-transparent pr-6 focus:outline-none appearance-none cursor-pointer"
            >
                <option value="default">Default</option>
                <option value="priority">Priority</option>
                <option value="dueDateAsc">Due Date (Asc)</option>
                <option value="dueDateDesc">Due Date (Desc)</option>
            </select>
            <ChevronUpDownIcon className="w-4 h-4 text-text-secondary/70 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"/>
        </div>
      </header>
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {column.tasks.map(task => (
          <KanbanCard 
            key={task.id} 
            task={task} 
            columnId={columnId}
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            onEdit={onEditTask} 
            onDelete={onDeleteTask} 
          />
        ))}
        {/* Drop zone for empty columns */}
        {column.tasks.length === 0 && (
          <div 
            onDragEnter={(e) => onDragEnter(e, null)}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;