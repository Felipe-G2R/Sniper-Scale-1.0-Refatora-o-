import React, { useMemo, useState, useEffect } from 'react';
import type { DashboardStat, AnalysisResult, SuccessfulCallReportData, VendaRealizadaReportData, LostCallReportData } from '../types';
import { CalendarIcon, TrendingUpIcon, TargetIcon, AcademicCapIcon, PerformanceIcon, CheckCircleIcon } from './icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import AnalysisHistoryTable from './AnalysisHistoryTable';
import { useAnalysisManager } from '../hooks/useAnalysisManager';

const StatCard: React.FC<DashboardStat> = ({ title, value, icon, comparison, subtitle }) => (
    <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-5 flex items-start justify-between">
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            {comparison && <p className="text-xs text-gray-500 mt-1 flex items-center">{comparison}</p>}
        </div>
        <div className="bg-gray-800/50 p-3 rounded-lg">
           {icon}
        </div>
    </div>
);

const ChartContainer: React.FC<{ title: string, children: React.ReactNode, hasData: boolean }> = ({ title, children, hasData }) => (
    <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            {hasData ? (
                children
            ) : (
                <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-800 rounded-lg">
                    <p className="text-gray-500 text-sm">Dados insuficientes para exibir o gráfico.</p>
                </div>
            )}
        </div>
    </div>
);


const Performance: React.FC = () => {
    const { state, setDateFilter } = useAnalysisManager();
    const { analysisHistory, startDate, endDate } = state;

    const [localStartDate, setLocalStartDate] = useState(startDate || '');
    const [localEndDate, setLocalEndDate] = useState(endDate || '');
    const [nameFilter, setNameFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        setLocalStartDate(startDate || '');
        setLocalEndDate(endDate || '');
    }, [startDate, endDate]);

    const handleFilter = () => {
        setDateFilter(localStartDate || null, localEndDate || null);
    };

    const handleClear = () => {
        setLocalStartDate('');
        setLocalEndDate('');
        setNameFilter('');
        setTypeFilter('');
        setDateFilter(null, null);
    };

    const filteredHistory = useMemo(() => {
        return analysisHistory.filter(item => {
            const itemDate = new Date(item.id);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);
    
            if (start && itemDate < start) return false;
            if (end && itemDate > end) return false;

            if (nameFilter.trim()) {
                const lowerCaseFilter = nameFilter.trim().toLowerCase();
                if (!item.closerName?.toLowerCase().includes(lowerCaseFilter)) {
                    return false;
                }
            }
            
            if (typeFilter) {
                switch(typeFilter) {
                    case 'venda-realizada':
                        if (item.type !== 'successful' && item.type !== 'venda-realizada') return false;
                        break;
                    case 'call-perdida':
                        if (item.type !== 'lost') return false;
                        break;
                    case 'relatorio-cirurgico':
                        if (item.type !== 'relatorio-cirurgico') return false;
                        break;
                    case 'relatorio-segunda-call':
                        if (item.type !== 'relatorio-segunda-call') return false;
                        break;
                    case 'baseline-indicacao':
                        if (item.type !== 'baseline-indicacao') return false;
                        break;
                    default:
                        break;
                }
            }

            return true;
        });
    }, [analysisHistory, startDate, endDate, nameFilter, typeFilter]);

    const performanceMetrics = useMemo(() => {
        const totalCalls = filteredHistory.length;
        
        const vendaRealizadaReports = filteredHistory.filter(
            (r): r is SuccessfulCallReportData | VendaRealizadaReportData =>
                r.type === 'venda-realizada' || r.type === 'successful'
        );
        const lostCallReports = filteredHistory.filter(
            (r): r is LostCallReportData => r.type === 'lost'
        );

        const relevantCallsForConversion = [...vendaRealizadaReports, ...lostCallReports];
        const conversionRate = relevantCallsForConversion.length > 0 ? (vendaRealizadaReports.length / relevantCallsForConversion.length) * 100 : 0;

        const avgVendaRealizada = vendaRealizadaReports.length > 0
            ? (vendaRealizadaReports.reduce((sum, r) => sum + (r.totalScore / r.totalMaxScore), 0) / vendaRealizadaReports.length) * 100
            : 0;

        const avgLostCall = lostCallReports.length > 0
            ? (lostCallReports.reduce((sum, r) => sum + (r.totalScore / r.totalMaxScore), 0) / lostCallReports.length) * 100
            : 0;

        let acertividade = 0;
        if (vendaRealizadaReports.length > 0 && lostCallReports.length > 0) {
            acertividade = (avgVendaRealizada + avgLostCall) / 2;
        } else if (vendaRealizadaReports.length > 0) {
            acertividade = avgVendaRealizada;
        } else if (lostCallReports.length > 0) {
            acertividade = avgLostCall;
        }

        let closerProfile = 'N/A';
        if (relevantCallsForConversion.length > 0) {
            if (acertividade <= 50) closerProfile = 'Junior';
            else if (acertividade <= 75) closerProfile = 'Pleno';
            else closerProfile = 'Sênior';
        }

        const stats: DashboardStat[] = [
            { title: "Total de Calls", value: totalCalls.toString(), subtitle: "Total de calls analisadas", icon: <PerformanceIcon className="w-6 h-6 text-cyan-400" /> },
            { title: "Taxa de Conversão", value: `${conversionRate.toFixed(1)}%`, subtitle: "Vendas Realizadas / (Realizadas + Perdidas)", icon: <TrendingUpIcon className="w-6 h-6 text-cyan-400" /> },
            { title: "Porcentagem de Acerto", value: `${acertividade.toFixed(1)}%`, subtitle: "Média de nota (Realizadas e Perdidas)", icon: <CheckCircleIcon className="w-6 h-6 text-cyan-400" /> },
            { title: "Perfil do Closer", value: closerProfile, subtitle: "Baseado na % de acerto", icon: <AcademicCapIcon className="w-6 h-6 text-cyan-400" /> },
        ];
        
        const conversionEvolutionData = relevantCallsForConversion.map((_, index) => {
            const historySlice = relevantCallsForConversion.slice(0, index + 1);
            const successfulInSlice = historySlice.filter(r => r.type === 'venda-realizada' || r.type === 'successful').length;
            const rate = (successfulInSlice / (index + 1)) * 100;
            return { name: `Call ${index + 1}`, "Taxa de Conversão": parseFloat(rate.toFixed(1)) };
        });

        const callsComparisonData = relevantCallsForConversion.map((_, index) => {
             const historySlice = relevantCallsForConversion.slice(0, index + 1);
             const successfulInSlice = historySlice.filter(r => r.type === 'venda-realizada' || r.type === 'successful').length;
             const lostInSlice = historySlice.length - successfulInSlice;
             return { name: `Call ${index + 1}`, Realizadas: successfulInSlice, Perdidas: lostInSlice };
        });


        return { stats, conversionEvolutionData, callsComparisonData };
    }, [filteredHistory]);

  return (
    <div className="space-y-6 animate-fade-in">
        <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="flex items-center text-3xl font-bold text-white"><PerformanceIcon className="w-8 h-8 mr-3 text-cyan-400"/>Linha de Performance</h1>
                <p className="text-gray-400 mt-1">Análise histórica da sua performance individual com dados comparativos.</p>
            </div>
             <div className="flex flex-wrap items-center gap-4">
                <input 
                    type="text" 
                    placeholder="Filtrar por nome..." 
                    value={nameFilter} 
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2.5 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2.5 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                >
                    <option value="">Todos os Tipos de Análise</option>
                    <option value="venda-realizada">Venda Realizada</option>
                    <option value="call-perdida">Call Perdida</option>
                    <option value="relatorio-cirurgico">Relatório Cirúrgico</option>
                    <option value="relatorio-segunda-call">GPS Segunda Call</option>
                    <option value="baseline-indicacao">Baseline para Indicação</option>
                </select>
                <div className="flex items-center gap-2 text-sm">
                     <label htmlFor="start-date-perf" className="text-gray-400 sr-only">Data de Início</label>
                    <input id="start-date-perf" type="date" value={localStartDate} onChange={(e) => setLocalStartDate(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"/>
                    <span className="text-gray-500">-</span>
                    <label htmlFor="end-date-perf" className="text-gray-400 sr-only">Data de Fim</label>
                    <input id="end-date-perf" type="date" value={localEndDate} onChange={(e) => setLocalEndDate(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
                 <div className="flex items-center gap-2 text-sm">
                    <button onClick={handleFilter} className="px-4 py-2.5 font-semibold text-black bg-[#22d3ee] rounded-lg hover:bg-cyan-400">Filtrar</button>
                    {(startDate || endDate || nameFilter || typeFilter) && <button onClick={handleClear} className="px-4 py-2.5 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Limpar</button>}
                </div>
            </div>
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.stats.map(stat => <StatCard key={stat.title} {...stat} />)}
        </div>

        {analysisHistory.length === 0 ? (
            <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-10 text-center">
                 <h3 className="flex items-center justify-center text-xl font-semibold text-white"><CalendarIcon className="w-6 h-6 mr-3"/>Linha do Tempo - Histórico de Performance</h3>
                 <p className="text-gray-500 mt-4">Nenhum dado de performance disponível ainda.</p>
                 <p className="text-gray-500">Comece registrando suas calls para ver o histórico aqui.</p>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartContainer title="Evolução da Taxa de Conversão" hasData={performanceMetrics.conversionEvolutionData.length > 0}>
                        <ResponsiveContainer>
                            <LineChart data={performanceMetrics.conversionEvolutionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} stroke="#6B7280" />
                                <YAxis tick={{ fill: '#9CA3AF' }} stroke="#6B7280" unit="%" domain={[0, 100]} />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                                <Line type="monotone" dataKey="Taxa de Conversão" stroke="#22d3ee" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                    <ChartContainer title="Calls Realizadas vs Perdidas" hasData={performanceMetrics.callsComparisonData.length > 0}>
                        <ResponsiveContainer>
                            <BarChart data={performanceMetrics.callsComparisonData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} stroke="#6B7280" />
                                <YAxis tick={{ fill: '#9CA3AF' }} stroke="#6B7280" />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} cursor={{fill: 'rgba(34, 211, 238, 0.1)'}}/>
                                <Legend />
                                <Bar dataKey="Realizadas" stackId="a" fill="#22d3ee" />
                                <Bar dataKey="Perdidas" stackId="a" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Histórico de Análises</h3>
                     <AnalysisHistoryTable history={filteredHistory} />
                </div>
            </div>
        )}
    </div>
  );
};

export default Performance;