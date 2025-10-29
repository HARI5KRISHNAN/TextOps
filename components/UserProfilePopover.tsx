import React from 'react';
import { UserIcon } from './icons';

interface UserLike {
    name: string;
    email?: string;
    avatar: string;
}

interface UserProfilePopoverProps {
  user: UserLike;
  position?: 'top' | 'bottom';
}

const UserProfilePopover: React.FC<UserProfilePopoverProps> = ({ user, position = 'top' }) => {
  const positionClasses = position === 'top'
    ? 'bottom-full left-1/2 -translate-x-1/2 mb-3'
    : 'top-full left-1/2 -translate-x-1/2 mt-3';

  return (
    <div
      className={`absolute z-20 w-64 p-4 bg-background-panel border border-border-color rounded-lg shadow-xl 
                 opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto
                 ${positionClasses}`}
      role="tooltip"
    >
      <div className="flex items-start gap-4 mb-4">
        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
        <div className="overflow-hidden">
          <p className="font-bold text-text-primary truncate">{user.name}</p>
          {user.email ? (
            <p className="text-sm text-text-secondary truncate">{user.email}</p>
          ) : (
            <p className="text-sm text-text-secondary italic">No email available</p>
          )}
        </div>
      </div>
      <button className="w-full text-center bg-accent text-white text-sm font-semibold py-2 rounded-md hover:bg-accent-hover transition-colors flex items-center justify-center gap-2">
        <UserIcon className="w-4 h-4" />
        View Profile
      </button>
      {/* Popover arrow */}
      <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-background-panel border-border-color transform rotate-45 
        ${position === 'top' ? '-bottom-1.5 border-b border-r' : '-top-1.5 border-t border-l'}`}>
      </div>
    </div>
  );
};

export default UserProfilePopover;