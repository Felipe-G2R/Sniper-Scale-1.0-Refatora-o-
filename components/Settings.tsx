import React, { useState } from 'react';
import type { SettingsTab } from '../types';
import {
    BuildingOfficeIcon, BellIcon,
    ComputerDesktopIcon, ShieldCheckIcon
} from './icons';
import ProfileCard from './settings/ProfileCard';
import SystemSettingsTab from './settings/SystemSettingsTab';
import CompanySettingsTab from './settings/CompanySettingsTab';
import NotificationsSettingsTab from './settings/NotificationsSettingsTab';
import SecuritySettingsTab from './settings/SecuritySettingsTab';
import { useAnalysisManager } from '../hooks/useAnalysisManager';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('sistema');
  const { state } = useAnalysisManager();
  const { user } = state;
  
  const TabButton: React.FC<{
    tabId: SettingsTab;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ tabId, icon, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors w-full text-left ${activeTab === tabId ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-400 hover:bg-gray-700/50'}`}
        >
            {icon}
            <span>{children}</span>
        </button>
  );

  const renderTabContent = () => {
      switch(activeTab) {
          case 'empresa':
              return <CompanySettingsTab />;
          case 'notificacoes':
              return <NotificationsSettingsTab />;
          case 'seguranca':
              return <SecuritySettingsTab />;
          case 'sistema':
              return <SystemSettingsTab />;
          default:
              return null;
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <header>
            <h1 className="text-3xl font-bold text-white">Configurações de <span className="text-[#22d3ee]">{user.name}</span></h1>
            <p className="text-gray-400 mt-1">Personalize sua experiência no Sniper Scale.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna do Perfil */}
            <div className="lg:col-span-1 space-y-6">
                 <ProfileCard />
            </div>

            {/* Coluna de Configurações */}
            <div className="lg:col-span-2 bg-[#161b22] border border-gray-800/50 rounded-xl">
                 <nav className="flex items-center p-2 space-x-2 border-b border-gray-800/50">
                    <TabButton tabId="empresa" icon={<BuildingOfficeIcon className="w-5 h-5" />}>Empresa</TabButton>
                    <TabButton tabId="notificacoes" icon={<BellIcon className="w-5 h-5" />}>Notificações</TabButton>
                    <TabButton tabId="sistema" icon={<ComputerDesktopIcon className="w-5 h-5" />}>Sistema</TabButton>
                    <TabButton tabId="seguranca" icon={<ShieldCheckIcon className="w-5 h-5" />}>Segurança</TabButton>
                </nav>
                <div>
                   {renderTabContent()}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Settings;