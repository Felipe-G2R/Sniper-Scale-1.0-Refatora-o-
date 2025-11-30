import React, { useState } from 'react';
import { useAnalysisManager } from '../../hooks/useAnalysisManager';
import { ShieldCheckIcon, KeyIcon, DevicePhoneMobileIcon, ClockIcon } from '../icons';

const SecuritySettingsTab: React.FC = () => {
    const { state, updateSettings } = useAnalysisManager();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const handlePasswordChange = () => {
        setPasswordError('');

        if (newPassword.length < 8) {
            setPasswordError('A senha deve ter pelo menos 8 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('As senhas nao coincidem');
            return;
        }

        // Simula alteracao de senha
        updateSettings({
            security: {
                lastPasswordChange: new Date().toISOString(),
            },
        } as any);

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
    };

    const toggleTwoFactor = () => {
        setTwoFactorEnabled(!twoFactorEnabled);
        updateSettings({
            security: {
                twoFactorEnabled: !twoFactorEnabled,
            },
        } as any);
    };

    const activeSessions = [
        {
            id: 1,
            device: 'Chrome - Windows',
            location: 'Sao Paulo, Brasil',
            lastActive: 'Agora',
            current: true,
        },
        {
            id: 2,
            device: 'Safari - iPhone',
            location: 'Sao Paulo, Brasil',
            lastActive: 'Ha 2 horas',
            current: false,
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Seguranca da Conta</h3>
                <p className="text-gray-400 text-sm mb-6">
                    Gerencie a seguranca da sua conta e sessoes ativas.
                </p>
            </div>

            {/* Alterar Senha */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                            <KeyIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium">Senha</h4>
                            <p className="text-gray-400 text-sm">Ultima alteracao ha 30 dias</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg transition-colors"
                    >
                        {showPasswordForm ? 'Cancelar' : 'Alterar Senha'}
                    </button>
                </div>

                {showPasswordForm && (
                    <div className="p-4 bg-gray-800/30 rounded-lg space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Senha Atual
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                            />
                            <p className="text-gray-500 text-xs mt-1">Minimo de 8 caracteres</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Confirmar Nova Senha
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                            />
                        </div>
                        {passwordError && (
                            <p className="text-red-400 text-sm">{passwordError}</p>
                        )}
                        <button
                            onClick={handlePasswordChange}
                            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                        >
                            Salvar Nova Senha
                        </button>
                    </div>
                )}
            </div>

            {/* Autenticacao de Dois Fatores */}
            <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium">Autenticacao de Dois Fatores (2FA)</h4>
                            <p className="text-gray-400 text-sm">
                                {twoFactorEnabled
                                    ? 'Sua conta esta protegida com 2FA'
                                    : 'Adicione uma camada extra de seguranca'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTwoFactor}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            twoFactorEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Sessoes Ativas */}
            <div className="pt-4 border-t border-gray-800 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <DevicePhoneMobileIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium">Sessoes Ativas</h4>
                        <p className="text-gray-400 text-sm">Dispositivos conectados a sua conta</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {activeSessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-700/50 rounded-lg">
                                    <ClockIcon className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">{session.device}</span>
                                        {session.current && (
                                            <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded-full">
                                                Atual
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        {session.location} - {session.lastActive}
                                    </p>
                                </div>
                            </div>
                            {!session.current && (
                                <button className="text-sm text-red-400 hover:text-red-300">
                                    Encerrar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Zona de Perigo */}
            <div className="pt-4 border-t border-gray-800 space-y-4">
                <h4 className="text-red-400 font-medium">Zona de Perigo</h4>
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h5 className="text-white font-medium">Excluir Conta</h5>
                            <p className="text-gray-400 text-sm">
                                Esta acao e irreversivel. Todos os seus dados serao perdidos.
                            </p>
                        </div>
                        <button className="px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-colors">
                            Excluir Conta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettingsTab;
