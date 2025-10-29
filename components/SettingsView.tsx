import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface SettingsViewProps {
    user: User;
    onUpdateUser: (updatedUser: User) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email || '');
    const [avatar, setAvatar] = useState(user.avatar);
    
    useEffect(() => {
        setName(user.name);
        setEmail(user.email || '');
        setAvatar(user.avatar);
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser({
            ...user,
            name,
            email,
            avatar,
        });
    };

    return (
        <div className="flex-1 flex flex-col p-6 bg-background-main overflow-y-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">Profile Settings</h1>
                <p className="text-text-secondary">Update your name, email, and avatar.</p>
            </header>

            <div className="bg-background-panel p-6 rounded-lg border border-border-color max-w-2xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <img src={avatar} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover" />
                        <div className="flex-1">
                            <label htmlFor="avatar" className="block text-sm font-medium text-text-secondary mb-1">Avatar URL</label>
                            <input
                                type="text"
                                id="avatar"
                                value={avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                                placeholder="https://example.com/avatar.png"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Display Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsView;
