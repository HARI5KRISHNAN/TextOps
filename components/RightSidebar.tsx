import React from 'react';
import { ModelIcon } from './icons';

interface CommunityProps {
    icon: string | React.ReactNode;
    name: string;
    bgColor: string;
}

const CommunityItem: React.FC<CommunityProps> = ({ icon, name, bgColor }) => (
    <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white ${bgColor}`}>
            {icon}
        </div>
        <span className="font-semibold text-sm text-text-primary truncate">{name}</span>
    </div>
);

interface PersonProps {
    avatar: string;
    name: string;
    handle: string;
}

const PersonItem: React.FC<PersonProps> = ({ avatar, name, handle }) => (
    <div className="flex items-center gap-3">
        <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
        <div>
            <p className="font-semibold text-sm text-text-primary">{name}</p>
            <p className="text-xs text-text-secondary">{handle}</p>
        </div>
    </div>
);


const RightSidebar: React.FC = () => {
    const communities: CommunityProps[] = [
        { icon: 'I', name: 'Introductions', bgColor: 'bg-indigo-600' },
        { icon: 'W', name: "What's New On Sh...", bgColor: 'bg-green-600' },
        { icon: <ModelIcon className="w-5 h-5"/>, name: 'DesignNews', bgColor: 'bg-sky-600' },
        { icon: 'Be', name: 'Behance', bgColor: 'bg-blue-600' },
        { icon: 'Fi', name: 'Figma Community', bgColor: 'bg-red-600' },
    ];

    const people: PersonProps[] = [
        { avatar: 'https://i.pravatar.cc/40?u=1', name: 'Patrick Newman', handle: '@patricknewman' },
        { avatar: 'https://i.pravatar.cc/40?u=2', name: 'Yulia Polischuk', handle: '@thisisjulka' },
        { avatar: 'https://i.pravatar.cc/40?u=3', name: 'Amanda Freeze', handle: '@meow_amanda97' },
        { avatar: 'https://i.pravatar.cc/40?u=4', name: 'Anatoly Belik', handle: '@belik_anatoly' },
    ];

    return (
        <aside className="w-72 bg-background-panel p-4 flex-col gap-6 border-l border-border-color hidden lg:flex">
            <div className="space-y-4">
                 <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Top Communities</h2>
                 <div className="space-y-3">
                    {communities.map(c => <CommunityItem key={c.name} {...c} />)}
                 </div>
            </div>
             <div className="space-y-4">
                 <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Suggested People</h2>
                 <div className="space-y-3">
                    {people.map(p => <PersonItem key={p.name} {...p} />)}
                 </div>
            </div>
        </aside>
    );
};

export default RightSidebar;