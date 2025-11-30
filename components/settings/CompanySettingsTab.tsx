import React, { useState } from 'react';
import { useAnalysisManager } from '../../hooks/useAnalysisManager';

const CompanySettingsTab: React.FC = () => {
    const { state, updateUserInfo } = useAnalysisManager();
    const { user } = state;

    const [companyName, setCompanyName] = useState(user?.company || '');
    const [cnpj, setCnpj] = useState(user?.cnpj || '');
    const [segment, setSegment] = useState(user?.segment || '');
    const [teamSize, setTeamSize] = useState(user?.teamSize || '');
    const [website, setWebsite] = useState(user?.website || '');

    const handleSave = () => {
        updateUserInfo({
            company: companyName,
            cnpj,
            segment,
            teamSize,
            website,
        });
    };

    const formatCnpj = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        return numbers
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .slice(0, 18);
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Dados da Empresa</h3>
                <p className="text-gray-400 text-sm mb-6">
                    Essas informações aparecem nos relatórios gerados.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nome da Empresa
                    </label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: Next Level Vendas"
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        CNPJ
                    </label>
                    <input
                        type="text"
                        value={cnpj}
                        onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                        placeholder="00.000.000/0000-00"
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Segmento
                    </label>
                    <select
                        value={segment}
                        onChange={(e) => setSegment(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    >
                        <option value="">Selecione o segmento</option>
                        <option value="vendas">Vendas</option>
                        <option value="marketing">Marketing Digital</option>
                        <option value="consultoria">Consultoria</option>
                        <option value="educacao">Educacao / Cursos</option>
                        <option value="saas">SaaS / Tecnologia</option>
                        <option value="servicos">Servicos</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tamanho da Equipe de Vendas
                    </label>
                    <select
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    >
                        <option value="">Selecione o tamanho</option>
                        <option value="1">Apenas eu</option>
                        <option value="2-5">2 a 5 pessoas</option>
                        <option value="6-10">6 a 10 pessoas</option>
                        <option value="11-25">11 a 25 pessoas</option>
                        <option value="26-50">26 a 50 pessoas</option>
                        <option value="50+">Mais de 50 pessoas</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Website
                    </label>
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://www.suaempresa.com.br"
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
                <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                >
                    Salvar Alteracoes
                </button>
            </div>
        </div>
    );
};

export default CompanySettingsTab;
