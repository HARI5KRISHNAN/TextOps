import React, { useState } from 'react';
import { PermissionMember, AccessLevel } from '../types';
import PermissionTable from './PermissionTable';
import { PlusIcon, FilterIcon } from './icons';

const initialMembers: PermissionMember[] = [
  { id: '1', name: 'George Lindelof', email: 'carlsen@armand.no', avatar: 'https://i.pravatar.cc/40?u=1', status: 'Active', accessLevel: 'Admin' },
  { id: '2', name: 'Eric Dyer', email: 'cristofer.ajer@ione.no', avatar: 'https://i.pravatar.cc/40?u=2', status: 'Active', accessLevel: 'Editor' },
  { id: '3', name: 'Haitam Alessami', email: 'haitam@gmail.com', avatar: 'https://i.pravatar.cc/40?u=3', status: 'Active', accessLevel: 'Viewer' },
  { id: '4', name: 'Michael Campbel', email: 'camp@hotmail.com', avatar: 'https://i.pravatar.cc/40?u=4', status: 'Inactive', accessLevel: 'Viewer' },
  { id: '5', name: 'Ashley Williams', email: 'williams.ash@newt.com', avatar: 'https://i.pravatar.cc/40?u=5', status: 'Active', accessLevel: 'Editor' },
  { id: '6', name: 'Vanessa Paradi', email: 'paradi.van@google.com', avatar: 'https://i.pravatar.cc/40?u=6', status: 'Active', accessLevel: 'Viewer' },
];


const PermissionManager: React.FC = () => {
    const [members, setMembers] = useState<PermissionMember[]>(initialMembers);
    const [activeTab, setActiveTab] = useState<'members' | 'admins'>('members');

    const handleAccessLevelChange = (memberId: string, newLevel: AccessLevel) => {
        setMembers(members.map(member => member.id === memberId ? { ...member, accessLevel: newLevel } : member));
    };

    const handleDeleteMember = (memberId: string) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            setMembers(members.filter(member => member.id !== memberId));
        }
    };
    
    const handleAddNew = () => {
        const name = prompt("Enter new member's name:");
        const email = prompt("Enter new member's email:");
        if(name && email) {
            const newMember: PermissionMember = {
                id: `m-${Date.now()}`,
                name,
                email,
                avatar: `https://i.pravatar.cc/40?u=${Date.now()}`,
                status: 'Active',
                accessLevel: 'Viewer',
            };
            setMembers([newMember, ...members]);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 bg-background-main overflow-y-auto">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <div className="flex border-b border-border-color">
                        <button 
                            onClick={() => setActiveTab('members')}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'members' ? 'border-b-2 border-accent text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            Members
                        </button>
                        <button 
                            onClick={() => setActiveTab('admins')}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'admins' ? 'border-b-2 border-accent text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            Admins
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">Total members: {members.length}</span>
                    <button className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-hover flex items-center gap-2">
                        <FilterIcon className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </header>
            
            <div className="bg-background-panel p-6 rounded-lg border border-border-color flex-1">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h1 className="text-xl font-bold text-text-primary">Members</h1>
                    <div className="flex items-center gap-3">
                        <button onClick={handleAddNew} className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-hover">
                            Add new
                        </button>
                        <button className="bg-background-main border border-border-color text-text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-background-panel">
                            Import members
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                     <PermissionTable
                        members={members}
                        onAccessLevelChange={handleAccessLevelChange}
                        onDeleteMember={handleDeleteMember}
                    />
                </div>
            </div>
        </div>
    );
};

export default PermissionManager;