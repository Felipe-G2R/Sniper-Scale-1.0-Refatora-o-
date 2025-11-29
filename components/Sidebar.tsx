import React from 'react';
import { DashboardIcon, PerformanceIcon, SettingsIcon, LogoutIcon } from './icons';
import { useAnalysisManager } from '../hooks/useAnalysisManager';
import type { User } from '../types';

const NavLink: React.FC<{ icon: React.ReactNode; text: string; active?: boolean; collapsed: boolean; onClick: () => void; }> = ({ icon, text, active, collapsed, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${active ? 'bg-[#22d3ee] text-black' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>
    {icon}
    {!collapsed && <span className="ml-4 font-semibold">{text}</span>}
  </button>
);

interface SidebarProps {
    isCompact: boolean;
    user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ isCompact, user }) => {
    const { state, navigate, logout } = useAnalysisManager();
    const { currentView } = state;

    return (
        <aside className={`flex flex-col bg-[#0A0E13] border-r border-gray-800/50 text-white transition-all duration-300 ${isCompact ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center p-4 border-b border-gray-800/50 h-20 ${isCompact ? 'justify-center' : 'justify-start'}`}>
                 {!isCompact ? (
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-black rounded-md p-1.5 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="overflow-visible">
                                <path d="M0 100L100 0L100 20L20 100z" fill="#22d3ee"></path>
                                <path d="M0 80L80 0L100 0L0 100z" fill="white"></path>
                            </svg>
                        </div>
                        <span className="text-xl font-bold ml-2">SNIPER SCALE</span>
                    </div>
                 ) : (
                    <div className="w-8 h-8 bg-black rounded-md p-1.5 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="overflow-visible">
                           <path d="M0 100L100 0L100 20L20 100z" fill="#22d3ee"></path>
                           <path d="M0 80L80 0L100 0L0 100z" fill="white"></path>
                        </svg>
                    </div>
                 )}
            </div>

            <nav className="flex-1 px-3 py-4">
                <NavLink icon={<DashboardIcon className="w-6 h-6" />} text="Dashboard" active={currentView === 'dashboard'} collapsed={isCompact} onClick={() => navigate('dashboard')} />
                <NavLink icon={<PerformanceIcon className="w-6 h-6" />} text="Performance" active={currentView === 'performance'} collapsed={isCompact} onClick={() => navigate('performance')} />
                <NavLink icon={<SettingsIcon className="w-6 h-6" />} text="Configurações" active={currentView === 'settings'} collapsed={isCompact} onClick={() => navigate('settings')} />
            </nav>
            
            <div className="px-3 pt-4 border-t border-gray-800/50">
                <NavLink icon={<LogoutIcon className="w-6 h-6" />} text="Sair" collapsed={isCompact} onClick={logout} />
            </div>

            <div className="p-4 mt-auto">
                <div className="flex items-center">
                    <img className="w-10 h-10 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                    {!isCompact && (
                        <div className="ml-3">
                            <p className="font-semibold text-sm text-white">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;