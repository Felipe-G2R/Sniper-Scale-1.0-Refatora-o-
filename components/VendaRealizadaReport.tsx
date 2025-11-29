import React, { useState } from 'react';
import CircularScore from './CircularScore';
import { ChevronLeftIcon, ThumbsUpIcon, ThumbsDownIcon, StarIcon, LoaderIcon, UserIcon, CheckCircleIcon, LightbulbIcon } from './icons';
// FIX: Import all necessary report data types to resolve module export errors.
import type { VendaRealizadaReportData, PositivePointDetail, ConstructiveCriticismDetail, FinalElogioDetail, BehavioralProfile, AnalysisStep } from '../types';
import { useAnalysisManager } from '../hooks/useAnalysisManager';
import { exportReportAsPDF } from '../lib/pdfExporter';


interface VendaRealizadaReportProps {
  reportData: VendaRealizadaReportData;
}

const BlockCard: React.FC<{ icon: React.ReactNode, title: string, description: string, children: React.ReactNode }> = ({ icon, title, description, children }) => (
    <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
        <div className="flex items-center mb-3">
            {icon}
            <h3 className="text-xl font-bold text-white ml-3">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{description}</p>
        <div className="space-y-4">
           {children}
        </div>
    </div>
);

const BehavioralProfileSection: React.FC<{ profile: BehavioralProfile }> = ({ profile }) => (
    <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
        <h2 className="flex items-center text-xl font-bold text-white mb-4">
            <UserIcon className="w-6 h-6 text-cyan-400" />
            <span className="ml-3">Análise de Perfil Comportamental</span>
        </h2>
        <div className="space-y-3 text-sm">
            <p><span className="font-semibold text-gray-300">Perfil Identificado:</span> {profile.identifiedProfile}</p>
            <p><span className="font-semibold text-gray-300">Análise de Adaptação:</span> {profile.adaptationAnalysis}</p>
            <p><span className="font-semibold text-gray-300">Recomendações:</span> {profile.personalizedRecommendations}</p>
            {profile.recommendedPhrases && (
                <div>
                    <p className="font-semibold text-gray-300">Frases Recomendadas:</p>
                    <ul className="list-disc list-inside text-gray-400">
                        {profile.recommendedPhrases.map((phrase, i) => <li key={i}>{phrase}</li>)}
                    </ul>
                </div>
            )}
        </div>
    </div>
);

const getStatusColorClasses = (status: AnalysisStep['status']) => {
    switch (status) {
        case 'Excelente': return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' };
        case 'Bom': return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' };
        case 'Revisar': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' };
        default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' };
    }
};

const StaticStepDetailCard: React.FC<{ step: AnalysisStep }> = ({ step }) => {
    const statusColors = getStatusColorClasses(step.status);

    return (
        <div className={`bg-[#0D1117] border ${statusColors.border} rounded-lg p-4 flex flex-col h-full`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                    <span className={`flex items-center justify-center w-8 h-8 text-sm font-bold ${statusColors.bg} ${statusColors.text} rounded-full flex-shrink-0`}>{step.id}</span>
                    <div>
                        <h3 className="text-md font-bold text-white">{step.name}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text}`}>{step.status}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`text-2xl font-bold ${statusColors.text}`}>{step.score}</p>
                    <p className="text-sm text-gray-400 -mt-1">/10</p>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3 text-sm flex-grow">
                <div>
                    <h4 className="font-semibold text-gray-300">Análise Específica:</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{step.specificAnalysis}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-300">Justificativa da Pontuação:</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{step.justification}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                        <h4 className="flex items-center text-xs font-semibold text-green-400 mb-1"><CheckCircleIcon className="w-4 h-4 mr-1" />Pontos Fortes</h4>
                        <ul className="space-y-1 list-inside">
                            {(step.strengths ?? []).map((item, i) => <li key={i} className="text-gray-400 text-xs">- {item}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="flex items-center text-xs font-semibold text-yellow-400 mb-1"><LightbulbIcon className="w-4 h-4 mr-1" />Oportunidades</h4>
                        <ul className="space-y-1 list-inside">
                            {(step.opportunities ?? []).map((item, i) => <li key={i} className="text-gray-400 text-xs">- {item}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};


const VendaRealizadaReport: React.FC<VendaRealizadaReportProps> = ({ reportData }) => {
    const { navigate, newAnalysisRequest } = useAnalysisManager();
    const [isExporting, setIsExporting] = useState(false);


    if (!reportData) {
        return <div className="text-center text-gray-400">Carregando dados do relatório...</div>;
    }

    const handleExport = () => {
        if (isExporting) return;
    
        setIsExporting(true);
        try {
            exportReportAsPDF(reportData, `Relatorio_Venda_Realizada_${reportData.closerName.replace(/\s/g, '_')}.pdf`);
        } catch (error) {
            console.error("Failed to export PDF:", error);
        } finally {
            setTimeout(() => setIsExporting(false), 500);
        }
    };
    
    const { closerName, totalScore, totalMaxScore, pontosPositivos, criticaConstrutiva, elogioFinal, steps, behavioralProfile } = reportData;

    const percentage = (totalScore / totalMaxScore) * 100;
    let classification = "Excelente";
    if (percentage < 55) classification = "Crítica";
    else if (percentage < 70) classification = "Regular";
    else if (percentage < 85) classification = "Boa";


  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('dashboard')} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
            <ChevronLeftIcon className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Relatório de Venda Realizada</h1>
            <p className="text-gray-400 text-sm">{closerName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
            <button onClick={handleExport} disabled={isExporting} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-wait flex items-center">
                {isExporting && <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />}
                {isExporting ? 'Exportando...' : 'Exportar PDF'}
            </button>
            <span className="px-4 py-2 text-sm font-bold text-green-900 bg-green-400 rounded-lg">VENDA REALIZADA</span>
        </div>
      </header>
      
      <div className="space-y-6">
        <div className="flex justify-center bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
                <CircularScore score={totalScore} maxScore={totalMaxScore} classification={`Performance ${classification}`} />
        </div>

        <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Análise das 25 Etapas - Metodologia Next Level</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(steps ?? []).map(step => (
                    <StaticStepDetailCard key={step.id} step={step} />
                ))}
            </div>
        </div>

        {behavioralProfile && (
            <BehavioralProfileSection profile={behavioralProfile} />
        )}

        <BlockCard icon={<ThumbsUpIcon className="w-6 h-6 text-green-400" />} title="Primeiro Bloco – Pontos Positivos" description={pontosPositivos?.descricao ?? 'Nenhuma descrição fornecida.'}>
            {(pontosPositivos?.detalhes ?? []).map((item, index) => (
                <div key={index} className="bg-gray-800/50 p-4 rounded-lg text-sm">
                    <h4 className="font-bold text-green-400 mb-2">{item.etapa}</h4>
                    <p><span className="font-semibold text-gray-300">O que ele falou:</span> <span className="italic">"{item.oQueEleFalou}"</span></p>
                    <p><span className="font-semibold text-gray-300">Como o lead reagiu:</span> {item.comoLeadReagiu}</p>
                    <p><span className="font-semibold text-gray-300">Por que isso funcionou:</span> {item.porqueFuncionou}</p>
                    <p><span className="font-semibold text-gray-300">Referência Estevão:</span> {item.referenciaEstevao}</p>
                </div>
            ))}
        </BlockCard>

        <BlockCard icon={<ThumbsDownIcon className="w-6 h-6 text-yellow-400" />} title="Segundo Bloco – Onde Quase Perdeu (crítica construtiva)" description={criticaConstrutiva?.descricao ?? 'Nenhuma descrição fornecida.'}>
            {(criticaConstrutiva?.detalhes ?? []).map((item, index) => (
                <div key={index} className="bg-gray-800/50 p-4 rounded-lg text-sm border-l-4 border-yellow-500/50">
                    <p><span className="font-semibold text-gray-300">Trecho do closer:</span> <span className="italic">"{item.trechoCloser}"</span></p>
                    <p><span className="font-semibold text-gray-300">Resposta do lead:</span> <span className="italic">"{item.respostaLead}"</span></p>
                    <p><span className="font-semibold text-gray-300">Erro:</span> {item.erro}</p>
                    <p><span className="font-semibold text-gray-300">Como Estevão faria:</span> {item.comoEstevaoFaria}</p>
                    <p><span className="font-semibold text-gray-300">Impacto:</span> {item.impacto}</p>
                </div>
            ))}
        </BlockCard>

        <BlockCard icon={<StarIcon className="w-6 h-6 text-cyan-400" />} title="Terceiro Bloco – Elogio Final + Direcionamento" description={elogioFinal?.descricao ?? 'Nenhuma descrição fornecida.'}>
            <div className="bg-gray-800/50 p-4 rounded-lg text-sm space-y-2">
                <p><span className="font-semibold text-gray-300">Reforçar os pontos que ele acertou:</span> {elogioFinal?.detalhes?.reforcarPontos ?? 'N/A'}</p>
                <p><span className="font-semibold text-gray-300">Mostrar que, mesmo com erros, ele venceu porque acertou o 80/20 da call:</span> {elogioFinal?.detalhes?.mostrar8020 ?? 'N/A'}</p>
                <p><span className="font-semibold text-gray-300">Passar 1 a 2 focos de estudo/treino para próxima call:</span> {elogioFinal?.detalhes?.focosDeTreino ?? 'N/A'}</p>
                <p><span className="font-semibold text-gray-300">Finalizar com elogio pesado para motivar:</span> {elogioFinal?.detalhes?.elogioPesado ?? 'N/A'}</p>
            </div>
        </BlockCard>
      </div>


      <div className="flex justify-center space-x-4 mt-6">
        <button onClick={() => navigate('dashboard')} className="px-6 py-3 text-sm font-semibold text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700">Voltar ao Dashboard</button>
        <button onClick={newAnalysisRequest} className="px-6 py-3 text-sm font-semibold text-black bg-[#22d3ee] rounded-lg hover:bg-cyan-400">Nova Análise</button>
      </div>

    </div>
  );
};

export default VendaRealizadaReport;