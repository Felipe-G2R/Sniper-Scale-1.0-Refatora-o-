import React, { useState } from 'react';
import CircularScore from './CircularScore';
import StepsAnalysis from './StepsAnalysis';
import BehavioralIndicators from './BehavioralIndicators';
import { ChevronLeftIcon, StarIcon, LightbulbIcon, FlagIcon, LoaderIcon, UserIcon } from './icons';
import type { SuccessfulCallReportData, BehavioralProfile } from '../types';
import { useAnalysisManager } from '../hooks/useAnalysisManager';
import { exportReportAsPDF } from '../lib/pdfExporter';
import CSFeedbackSection from './CSFeedbackSection';
import ReferralSection from './ReferralSection';


interface SuccessfulCallReportProps {
  reportData: SuccessfulCallReportData;
}

const ReportInfoCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center mb-3">
            {icon}
            <h3 className="text-lg font-bold text-white ml-3">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{children}</p>
    </div>
);

const BehavioralProfileSection: React.FC<{ profile: BehavioralProfile }> = ({ profile }) => (
    <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
        <h2 className="flex items-center text-xl font-bold text-white mb-4">
            <UserIcon className="w-6 h-6 text-cyan-400" />
            <span className="ml-3">Análise de Perfil Comportamental</span>
        </h2>
        <div className="space-y-3">
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


const SuccessfulCallReport: React.FC<SuccessfulCallReportProps> = ({ reportData }) => {
    const { navigate, newAnalysisRequest } = useAnalysisManager();
    const [isExporting, setIsExporting] = useState(false);
    
    if (!reportData) {
        return <div className="text-center text-gray-400">Carregando dados do relatório...</div>;
    }

    const handleExport = () => {
        if (isExporting) return;
    
        setIsExporting(true);
        try {
            exportReportAsPDF(reportData, `Relatorio_Call_Realizada_${reportData.closerName.replace(/\s/g, '_')}.pdf`);
        } catch (error) {
            console.error("Failed to export PDF:", error);
            // Optionally show a notification to the user
        } finally {
            setTimeout(() => setIsExporting(false), 500);
        }
    };

    const percentage = (reportData.totalScore / reportData.totalMaxScore) * 100;
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
            <h1 className="text-2xl font-bold text-white">Análise de Call Realizada</h1>
            <p className="text-gray-400 text-sm">{reportData.closerName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700">Compartilhar</button>
            <button onClick={handleExport} disabled={isExporting} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-wait flex items-center">
                {isExporting && <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />}
                {isExporting ? 'Exportando...' : 'Exportar PDF'}
            </button>
            <span className="px-4 py-2 text-sm font-bold text-green-900 bg-green-400 rounded-lg">VENDA REALIZADA</span>
        </div>
      </header>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 xl:col-span-3 bg-[#161b22] border border-gray-800/50 rounded-xl p-6 flex items-center justify-center">
                <CircularScore score={reportData.totalScore} maxScore={reportData.totalMaxScore} classification={`Performance ${classification}`} />
            </div>
            <div className="lg:col-span-8 xl:col-span-9 space-y-5">
                <ReportInfoCard icon={<StarIcon className="w-6 h-6 text-yellow-400" />} title={`Performance ${classification}!`}>
                    {reportData.performanceSummary}
                </ReportInfoCard>
                <ReportInfoCard icon={<LightbulbIcon className="w-6 h-6 text-cyan-400" />} title="Momento Crítico">
                    {reportData.criticalMoment}
                </ReportInfoCard>
                <ReportInfoCard icon={<FlagIcon className="w-6 h-6 text-green-400" />} title="Resultado Final">
                    {reportData.finalResult}
                </ReportInfoCard>
            </div>
        </div>

        <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Análise das 25 Etapas - Metodologia Next Level</h2>
            <StepsAnalysis steps={reportData.steps ?? []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Indicadores Comportamentais</h2>
                <BehavioralIndicators indicators={reportData.behavioralIndicators ?? []} />
            </div>
             {reportData.behavioralProfile && (
                <BehavioralProfileSection profile={reportData.behavioralProfile} />
            )}
        </div>
        
        {reportData.csFeedback && <CSFeedbackSection feedback={reportData.csFeedback} />}
        {reportData.referrals && reportData.referrals.length > 0 && <ReferralSection referrals={reportData.referrals} />}
      </div>


      <div className="flex justify-center space-x-4 mt-6">
        <button onClick={() => navigate('dashboard')} className="px-6 py-3 text-sm font-semibold text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700">Voltar ao Dashboard</button>
        <button onClick={newAnalysisRequest} className="px-6 py-3 text-sm font-semibold text-black bg-[#22d3ee] rounded-lg hover:bg-cyan-400">Nova Análise</button>
      </div>

    </div>
  );
};

export default SuccessfulCallReport;