import React, { useState, useEffect } from 'react';
import { useAnalysisManager } from '../../hooks/useAnalysisManager';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '../icons';
import type { Settings } from '../../types';

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onToggle: () => void; }> = ({ label, enabled, onToggle }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-cyan-500' : 'bg-gray-600'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const Dropdown: React.FC<{ label: string, options: MediaDeviceInfo[], defaultLabel: string }> = ({ label, options, defaultLabel }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5">
            {options.length > 0 ? (
                options.map(device => <option key={device.deviceId} value={device.deviceId}>{device.label || `${label} - ${device.deviceId.substring(0, 8)}`}</option>)
            ) : (
                <option>{defaultLabel}</option>
            )}
        </select>
    </div>
);

const ThemeButton: React.FC<{ 
    onClick: () => void; 
    isActive: boolean; 
    icon: React.ReactNode; 
    label: string; 
}> = ({ onClick, isActive, icon, label }) => (
     <button 
        onClick={onClick}
        className={`flex-1 p-2 rounded-md flex items-center justify-center transition-colors
                   ${isActive ? 'bg-gray-700 border-2 border-cyan-500 text-white' : 'bg-gray-800 border-2 border-transparent text-gray-400 hover:border-gray-600'}`}>
        {icon}
        <span className="ml-2 text-sm">{label}</span>
    </button>
);


const SystemSettingsTab: React.FC = () => {
    const { state, updateSettings } = useAnalysisManager();
    const { settings } = state;
    const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        const getDevices = async () => {
            try {
                // Request permission to get device labels
                await navigator.mediaDevices.getUserMedia({ audio: true });
                const devices = await navigator.mediaDevices.enumerateDevices();
                setAudioInputDevices(devices.filter(d => d.kind === 'audioinput'));
                setAudioOutputDevices(devices.filter(d => d.kind === 'audiooutput'));
            } catch (err) {
                console.error("Error enumerating audio devices:", err);
            }
        };
        getDevices();
    }, []);

    const handleToggle = (key: keyof Settings) => {
        updateSettings({ [key]: !settings[key] });
    };

    const handleThemeChange = (theme: Settings['theme']) => {
        updateSettings({ theme });
    };

    return (
        <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                     <h3 className="font-semibold text-white">Áudio</h3>
                     <Dropdown label="Dispositivo de Entrada" options={audioInputDevices} defaultLabel="Nenhum microfone encontrado" />
                     <Dropdown label="Dispositivo de Saída" options={audioOutputDevices} defaultLabel="Nenhum alto-falante encontrado" />
                 </div>
                 <div className="space-y-4">
                     <h3 className="font-semibold text-white">Aparência</h3>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tema da Interface</label>
                         <div className="flex space-x-2">
                            <ThemeButton onClick={() => handleThemeChange('dark')} isActive={settings.theme === 'dark'} icon={<MoonIcon className="w-5 h-5"/>} label="Escuro" />
                            <ThemeButton onClick={() => handleThemeChange('light')} isActive={settings.theme === 'light'} icon={<SunIcon className="w-5 h-5"/>} label="Claro" />
                            <ThemeButton onClick={() => handleThemeChange('system')} isActive={settings.theme === 'system'} icon={<ComputerDesktopIcon className="w-5 h-5"/>} label="Sistema" />
                         </div>
                     </div>
                 </div>
            </div>
            <div className="border-t border-gray-700/50"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                     <ToggleSwitch label="Controle Automático de Ganho" enabled={settings.autoGainControl} onToggle={() => handleToggle('autoGainControl')} />
                     <ToggleSwitch label="Supressão de Ruído" enabled={settings.noiseSuppression} onToggle={() => handleToggle('noiseSuppression')} />
                </div>
                <div className="space-y-4">
                     <ToggleSwitch label="Animações Reduzidas" enabled={settings.reducedAnimations} onToggle={() => handleToggle('reducedAnimations')} />
                     <ToggleSwitch label="Sidebar Compacta" enabled={settings.compactSidebar} onToggle={() => handleToggle('compactSidebar')} />
                </div>
            </div>
        </div>
    );
};

export default SystemSettingsTab;