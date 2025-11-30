import React, { useState } from 'react';
import { useAnalysisManager } from '../../hooks/useAnalysisManager';

interface NotificationSetting {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
}

const NotificationsSettingsTab: React.FC = () => {
    const { updateSettings } = useAnalysisManager();

    const [notifications, setNotifications] = useState<NotificationSetting[]>([
        {
            id: 'analysis_complete',
            title: 'Analise Concluida',
            description: 'Receber notificacao quando uma analise for finalizada',
            enabled: true,
        },
        {
            id: 'low_score_alert',
            title: 'Alerta de Pontuacao Baixa',
            description: 'Ser notificado quando uma call tiver pontuacao abaixo de 60%',
            enabled: true,
        },
        {
            id: 'weekly_report',
            title: 'Relatorio Semanal',
            description: 'Receber um resumo semanal do desempenho das calls',
            enabled: false,
        },
        {
            id: 'tips_insights',
            title: 'Dicas e Insights',
            description: 'Receber dicas personalizadas baseadas nas suas analises',
            enabled: true,
        },
        {
            id: 'system_updates',
            title: 'Atualizacoes do Sistema',
            description: 'Ser informado sobre novas funcionalidades e melhorias',
            enabled: true,
        },
    ]);

    const [emailNotifications, setEmailNotifications] = useState(true);
    const [browserNotifications, setBrowserNotifications] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const toggleNotification = (id: string) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === id ? { ...n, enabled: !n.enabled } : n
            )
        );
    };

    const handleSave = () => {
        updateSettings({
            notifications: {
                items: notifications,
                email: emailNotifications,
                browser: browserNotifications,
                sound: soundEnabled,
            },
        } as any);
    };

    const requestBrowserPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setBrowserNotifications(true);
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Preferencias de Notificacao</h3>
                <p className="text-gray-400 text-sm mb-6">
                    Escolha como e quando deseja ser notificado.
                </p>
            </div>

            {/* Canais de Notificação */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Canais de Notificacao
                </h4>

                <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors">
                        <div>
                            <span className="text-white font-medium">Notificacoes por E-mail</span>
                            <p className="text-gray-400 text-sm">Receba resumos e alertas no seu e-mail</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors">
                        <div>
                            <span className="text-white font-medium">Notificacoes do Navegador</span>
                            <p className="text-gray-400 text-sm">Receba alertas em tempo real no navegador</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {!browserNotifications && (
                                <button
                                    onClick={requestBrowserPermission}
                                    className="text-xs text-cyan-400 hover:text-cyan-300"
                                >
                                    Permitir
                                </button>
                            )}
                            <input
                                type="checkbox"
                                checked={browserNotifications}
                                onChange={(e) => setBrowserNotifications(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900"
                            />
                        </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors">
                        <div>
                            <span className="text-white font-medium">Sons de Notificacao</span>
                            <p className="text-gray-400 text-sm">Reproduzir som ao receber notificacoes</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={soundEnabled}
                            onChange={(e) => setSoundEnabled(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900"
                        />
                    </label>
                </div>
            </div>

            {/* Tipos de Notificação */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
                <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Tipos de Notificacao
                </h4>

                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <label
                            key={notification.id}
                            className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors"
                        >
                            <div>
                                <span className="text-white font-medium">{notification.title}</span>
                                <p className="text-gray-400 text-sm">{notification.description}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={notification.enabled}
                                onChange={() => toggleNotification(notification.id)}
                                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900"
                            />
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
                <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                >
                    Salvar Preferencias
                </button>
            </div>
        </div>
    );
};

export default NotificationsSettingsTab;
