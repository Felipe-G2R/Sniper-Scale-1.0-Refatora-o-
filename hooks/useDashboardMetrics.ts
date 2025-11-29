import React, { useMemo } from 'react';
import { useAnalysisManager } from './useAnalysisManager';
import { PhoneIcon, ChartPieIcon, ClipboardCheckIcon, ExclamationTriangleIcon } from '../components/icons';
// FIX: Correctly import all necessary types.
import type { DashboardMetrics, AnalysisResult, RelatorioCirurgicoData, RelatorioSegundaCallData } from '../types';

export const useDashboardMetrics = (): DashboardMetrics => {
  const { state } = useAnalysisManager();
  const { analysisHistory, startDate, endDate } = state;

  return useMemo(() => {
    const filteredHistory = analysisHistory.filter(item => {
        if (!startDate && !endDate) return true;
        
        // Ensure the dates are valid before creating Date objects
        const itemDate = new Date(item.id);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        // Adjust dates to cover the entire day
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);

        if (start && itemDate < start) return false;
        if (end && itemDate > end) return false;
        return true;
    });

    const totalCalls = filteredHistory.length;
    
    // --- Existing Metrics ---
    const relevantCalls = filteredHistory.filter(r => r.type === 'venda-realizada' || r.type === 'lost' || r.type === 'successful');
    const successfulCalls = relevantCalls.filter(r => r.type === 'venda-realizada' || r.type === 'successful').length;
    const lostCalls = relevantCalls.length - successfulCalls;
    const conversionRate = relevantCalls.length > 0 ? (successfulCalls / relevantCalls.length) * 100 : 0;

    // --- New Metric 1: Taxa de Execução Estratégica ---
    const relatoriosCirurgicosComAnalise = filteredHistory.filter(
        (r): r is RelatorioCirurgicoData => 
            r.type === 'relatorio-cirurgico' && r.analiseSegundaCall !== undefined
    );

    let taxaExecucaoEstrategica = 0;
    if (relatoriosCirurgicosComAnalise.length > 0) {
        const totalAderencia = relatoriosCirurgicosComAnalise.reduce(
            (sum, r) => sum + (r.analiseSegundaCall?.pontuacaoAderencia || 0), 0
        );
        taxaExecucaoEstrategica = totalAderencia / relatoriosCirurgicosComAnalise.length;
    }

    // --- New Metric 2: Objeções Mais Antecipadas ---
    const allObjections: string[] = [];
    filteredHistory.forEach(report => {
        if (report.type === 'relatorio-cirurgico') {
            allObjections.push(...(report.objecoesAntecipadas?.financeirasProvaveis?.objecoes || []));
            allObjections.push(...(report.objecoesAntecipadas?.credibilidadeProvaveis?.objecoes || []));
        } else if (report.type === 'relatorio-segunda-call') {
            if (report.ato3_protocolosAvancados?.planoDeContencaoDeObjecoes?.objecaoAntecipada) {
                allObjections.push(report.ato3_protocolosAvancados.planoDeContencaoDeObjecoes.objecaoAntecipada);
            }
        }
    });

    let topObjection = 'Nenhuma';
    if (allObjections.length > 0) {
        const objectionCounts = allObjections.reduce((acc, objection) => {
            const trimmedObjection = objection.trim();
            if (trimmedObjection) { // Ignore empty strings
                 acc[trimmedObjection] = (acc[trimmedObjection] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const sortedObjections = Object.entries(objectionCounts).sort((a, b) => b[1] - a[1]);
        if (sortedObjections.length > 0) {
            topObjection = sortedObjections[0][0];
        }
    }


    const stats = [
      { title: "Calls Analisadas", value: totalCalls.toString(), subtitle: "No período selecionado", icon: React.createElement(PhoneIcon, { className: "w-6 h-6 text-gray-500" }) },
      { title: "Taxa de Conversão", value: `${conversionRate.toFixed(1)}%`, subtitle: "Apenas Vendas Realizadas/Perdidas", icon: React.createElement(ChartPieIcon, { className: "w-6 h-6 text-gray-500" }) },
      { title: "Execução Estratégica", value: relatoriosCirurgicosComAnalise.length > 0 ? `${taxaExecucaoEstrategica.toFixed(1)}%` : 'N/A', subtitle: "Aderência ao plano da 1ª call", icon: React.createElement(ClipboardCheckIcon, { className: "w-6 h-6 text-gray-500" }) },
      { title: "Objeção Mais Comum", value: topObjection, subtitle: "Objeção mais antecipada nos relatórios", icon: React.createElement(ExclamationTriangleIcon, { className: "w-6 h-6 text-gray-500" }) },
    ];
    
    const resultsDistribution = [
        { name: 'Fechadas', value: successfulCalls, color: '#22d3ee' },
        { name: 'Perdidas', value: lostCalls, color: '#ef4444' }, // Using a red color for 'Perdidas'
    ];

    const conversionHistory = filteredHistory.map((_, index) => {
        const historySlice = filteredHistory.slice(0, index + 1);
        const relevantSlice = historySlice.filter(r => r.type === 'venda-realizada' || r.type === 'lost' || r.type === 'successful');
        const successfulInSlice = relevantSlice.filter(r => r.type === 'venda-realizada' || r.type === 'successful').length;
        const rate = relevantSlice.length > 0 ? (successfulInSlice / relevantSlice.length) * 100 : 0;
        return { name: `Call ${index + 1}`, conversao: parseFloat(rate.toFixed(1)) };
    });

    const recentCallsData = filteredHistory.slice(-6).map((r, index, arr) => {
        const callNumber = totalCalls - arr.length + 1 + index;
        let score = 0;
        if(r.type === 'successful' || r.type === 'venda-realizada' || r.type === 'lost') {
           score = r.totalScore && r.totalMaxScore ? (r.totalScore / r.totalMaxScore) * 10 : 0
        }
        return { name: `Call ${callNumber}`, score: parseFloat(score.toFixed(1)) };
    });


    return { stats, resultsDistribution, conversionHistory, recentCallsData, totalCalls };
  }, [analysisHistory, startDate, endDate]);
};