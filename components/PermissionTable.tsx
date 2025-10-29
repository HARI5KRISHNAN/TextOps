import React from 'react';
import { PermissionMember, AccessLevel } from '../types';
// FIX: Changed PencilIcon to PencilAltIcon as it is the available icon.
import { PencilAltIcon, TrashIcon } from './icons';

interface PermissionTableProps {
  members: PermissionMember[];
  onAccessLevelChange: (memberId: string, newLevel: AccessLevel) => void;
  onDeleteMember: (memberId: string) => void;
}

const StatusBadge: React.FC<{ status: 'Active' | 'Inactive' }> = ({ status }) => (
  <span
    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
      status === 'Active' ? 'bg-status-green-soft text-status-green' : 'bg-status-red-soft text-status-red'
    }`}
  >
    {status}
  </span>
);

const PermissionTable: React.FC<PermissionTableProps> = ({ members, onAccessLevelChange, onDeleteMember }) => {
  const accessLevels: AccessLevel[] = ['Admin', 'Editor', 'Viewer'];

  return (
    <table className="w-full min-w-[800px] text-left text-sm">
      <thead>
        <tr className="border-b border-border-color text-text-secondary">
          <th className="font-semibold p-3">Member</th>
          <th className="font-semibold p-3">Email</th>
          <th className="font-semibold p-3">Status</th>
          <th className="font-semibold p-3">Access Level</th>
          <th className="font-semibold p-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr key={member.id} className="border-b border-border-color hover:bg-background-main">
            <td className="p-3">
              <div className="flex items-center gap-3">
                <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="font-medium text-text-primary">{member.name}</span>
              </div>
            </td>
            <td className="p-3 text-text-secondary">{member.email}</td>
            <td className="p-3">
              <StatusBadge status={member.status} />
            </td>
            <td className="p-3">
              <select
                value={member.accessLevel}
                onChange={(e) => onAccessLevelChange(member.id, e.target.value as AccessLevel)}
                className="bg-input-field border border-border-color rounded-md px-2 py-1 focus:ring-2 focus:ring-accent focus:outline-none"
              >
                {accessLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </td>
            <td className="p-3 text-right">
              <div className="flex items-center justify-end gap-3">
                 <button className="text-text-secondary hover:text-accent" aria-label="Edit member">
                    <PencilAltIcon className="w-4 h-4" />
                </button>
                 <button onClick={() => onDeleteMember(member.id)} className="text-text-secondary hover:text-status-red" aria-label="Delete member">
                    <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PermissionTable;