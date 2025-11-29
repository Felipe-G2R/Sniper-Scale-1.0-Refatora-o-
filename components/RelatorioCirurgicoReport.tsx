import React, { useState, useRef } from 'react';
import type { RelatorioCirurgicoData, AnaliseSegundaCall } from '../types';
import { useAnalysisManager } from '../hooks/useAnalysisManager';
import { 
    ChevronLeftIcon, UserIcon, ClipboardCheckIcon, HeartIcon,
    ExclamationTriangleIcon, BookOpenIcon, StarIcon, CheckCircleIcon,
    MapIcon, PresentationChartLineIcon, ShieldCheckIcon, RocketLaunchIcon,
    LightbulbIcon, UploadCloudIcon, LoaderIcon, TrashIcon
} from './icons';

interface ReportProps {
  reportData: RelatorioCirurgicoData;
}

const Section: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode, className?: string }> = ({ icon, title, children, className }) => (
    <div className={`bg-[#161b22] border border-gray-800/50 rounded-xl p-6 ${className}`}>
        <h2 className="flex items-center text-xl font-bold text-white mb-4">
            {icon}
            <span className="ml-3">{title}</span>
        </h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const InfoCard: React.FC<{ title: string, content?: string | string[] | React.ReactNode, titleColor?: string, contentClassName?: string }> = ({ title, content, titleColor = "text-gray-300", contentClassName = "" }) => (
    <div className="bg-gray-800/50 p-3 rounded-md">
        <h4 className={`font-semibold text-sm ${titleColor}`}>{title}</h4>
        {content && <div className={`text-sm text-gray-400 mt-1 ${contentClassName}`}>{content}</div>}
    </div>
);


const AdherenceScoreMeter: React.FC<{ score: number }> = ({ score }) => {
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getScoreColor = () => {
        if (score >= 85) return '#22d3ee'; // cyan-400
        if (score >= 70) return '#4ade80'; // green-400
        if (score >= 50) return '#facc15'; // yellow-400
        return '#f87171'; // red-400
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle className="stroke-gray-700" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size/2} cy={size/2} />
                <circle
                    stroke={getScoreColor()}
                    className="transition-all duration-1000 ease-out"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size/2}
                    cy={size/2}
                    style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: getScoreColor() }}>{score}</span>
                <span className="text-sm text-gray-400">%</span>
            </div>
        </div>
    );
};


const SecondCallAnalysisSection: React.FC<{ report: RelatorioCirurgicoData }> = ({ report }) => {
    const { startSecondCallAnalysis, deleteSecondCallAnalysis, state } = useAnalysisManager();
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsLoading(true);
            await startSecondCallAnalysis(report.id, file);
            setIsLoading(false);
        }
    };

    return (
        <Section icon={<RocketLaunchIcon className="w-6 h-6 text-purple-400" />} title="Análise da Segunda Call (Plano vs. Executado)">
            {report.analiseSegundaCall ? (
                 <div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">Resultados da Análise Comparativa</h3>
                            <p className="text-sm text-gray-400">Comparação entre o plano e a execução da 2ª call.</p>
                        </div>
                        <button
                            onClick={() => deleteSecondCallAnalysis(report.id)}
                            className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-red-400 bg-red-900/30 border border-red-500/30 rounded-lg hover:bg-red-900/60 transition-colors"
                            title="Excluir Análise da 2ª Call"
                        >
                            <TrashIcon className="w-4 h-4" />
                            <span>Excluir para Reanalisar</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-1 flex flex-col items-center text-center">
                            <AdherenceScoreMeter score={report.analiseSegundaCall.pontuacaoAderencia} />
                            <h3 className="mt-2 text-lg font-bold text-white">Pontuação de Aderência Estratégica</h3>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <InfoCard title="Feedback Geral" content={report.analiseSegundaCall.feedbackGeral} />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <InfoCard title="Acertos (Execução do Plano)" content={<ul className="list-disc list-inside">{report.analiseSegundaCall.acertos.map((a, i) => <li key={i}>{a}</li>)}</ul>} />
                                <InfoCard title="Pontos de Melhoria" content={<ul className="list-disc list-inside">{report.analiseSegundaCall.melhorias.map((m, i) => <li key={i}>{m}</li>)}</ul>} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.txt,.csv" className="hidden" />
                     <div 
                        onClick={() => !isLoading && fileInputRef.current?.click()} 
                        className="p-6 border-2 border-dashed border-gray-700 rounded-lg text-center cursor-pointer hover:border-cyan-400/50 transition-colors"
                    >
                        {isLoading || state.isLoading ? (
                            <div className="flex flex-col items-center justify-center">
                                <LoaderIcon className="w-12 h-12 mx-auto text-cyan-400 animate-spin" />
                                <p className="mt-2 text-sm text-gray-400">Analisando a 2ª call... Isso pode levar um momento.</p>
                            </div>
                        ) : (
                             <>
                                <UploadCloudIcon className="w-12 h-12 mx-auto text-gray-500" />
                                <p className="mt-2 text-sm text-gray-400">Faça o upload da transcrição da 2ª Call para comparar com a estratégia.</p>
                                <p className="font-semibold text-cyan-400">Clique para selecionar o arquivo</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, TXT ou CSV</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </Section>
    );
};


const RelatorioCirurgicoReport: React.FC<ReportProps> = ({ reportData }) => {
    const { navigate } = useAnalysisManager();

    if (!reportData) {
        return <div className="text-center text-gray-400">Carregando dados do relatório...</div>;
    }

    const { 
        closerName, 
        dadosBasicos, 
        perfilComportamental, 
        diagnosticoSpin,
        narrativasPessoais,
        gatilhosEmocionais,
        mapeamentoFinanceiro,
        objecoesAntecipadas,
        estrategiaFechamento,
        planoSegundaCall,
        checklistPreCall,
        lembreteFinal,
     } = reportData;

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex items-center space-x-3">
                <button onClick={() => navigate('dashboard')} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                    <ChevronLeftIcon className="h-5 w-5 text-white" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Relatório Cirúrgico - 1ª Call</h1>
                    <p className="text-gray-400 text-sm">Preparação estratégica para fechamento na segunda call de {closerName}</p>
                </div>
            </header>

            <SecondCallAnalysisSection report={reportData} />
            
            <Section icon={<ClipboardCheckIcon className="w-6 h-6 text-gray-400" />} title="Dados Básicos da Call">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCard title="Data" content={dadosBasicos?.dataDaCall} />
                    <InfoCard title="Lead" content={dadosBasicos?.lead} />
                    <InfoCard title="Duração" content={dadosBasicos?.duracao} />
                    <InfoCard title="Status" content={dadosBasicos?.status} />
                </div>
            </Section>

            <Section icon={<UserIcon className="w-6 h-6 text-cyan-400" />} title="Perfil Comportamental">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <InfoCard title="Identificação Primária" content={perfilComportamental?.identificacaoPrimaria} titleColor="text-cyan-400" />
                        <InfoCard title="Perfil Híbrido (se aplicável)" content={perfilComportamental?.perfilHibrido || 'N/A'} />
                        {perfilComportamental?.frasesDeConexaoRecomendadas && perfilComportamental.frasesDeConexaoRecomendadas.length > 0 && (
                            <InfoCard title="Frases de Conexão Recomendadas" content={
                                <ul className="list-disc list-inside space-y-1">
                                    {perfilComportamental.frasesDeConexaoRecomendadas.map((phrase, i) => <li key={i} className="italic">"{phrase}"</li>)}
                                </ul>
                            } titleColor="text-green-400" />
                        )}
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-gray-300">Sinais Identificados na Transcrição</h4>
                        <p className="text-xs text-gray-400">Linguagem: {perfilComportamental?.sinaisIdentificados?.linguagemUsada?.palavrasFrequentes}</p>
                        <p className="text-xs text-gray-400">Comportamentos: {perfilComportamental?.sinaisIdentificados?.comportamentosObservados?.respostasLongasCurtas}</p>
                     </div>
                </div>
            </Section>

            <Section icon={<PresentationChartLineIcon className="w-6 h-6 text-cyan-400" />} title="Diagnóstico SPIN Completo">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoCard title="Situação Atual" content={diagnosticoSpin?.situacaoAtual?.faturamentoAtual} />
                    <InfoCard title="Problemas Identificados" content={diagnosticoSpin?.problemasIdentificados?.dorPrincipal} titleColor="text-red-400" />
                    <InfoCard title="Implicação Emocional" content={diagnosticoSpin?.implicacaoEmocional?.comoSeSente} />
                    <InfoCard title="Necessidade de Solução" content={diagnosticoSpin?.necessidadeSolucao?.objetivoEspecifico} titleColor="text-green-400" />
                </div>
            </Section>

             <Section icon={<LightbulbIcon className="w-6 h-6 text-yellow-400" />} title="Gatilhos Emocionais Identificados">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-yellow-400 mb-2">Motivações Profundas</h4>
                        <p className="text-sm text-gray-300">{gatilhosEmocionais?.motivacoesProfundas?.oQueRealmenteQuer}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-red-400 mb-2">Medos e Dores Emocionais</h4>
                        <p className="text-sm text-gray-300">{gatilhosEmocionais?.medosDoresEmocionais?.maiorMedoProfissional}</p>
                    </div>
                </div>
                 <InfoCard title="Palavras-Gatilho Específicas" content={(gatilhosEmocionais?.palavrasGatilhoEspecificas ?? []).map(p => `"${p}"`).join(', ')} contentClassName="italic" />
             </Section>

            <Section icon={<ShieldCheckIcon className="w-6 h-6 text-cyan-400" />} title="Estratégia de Fechamento Personalizada">
                 <div className="space-y-4">
                    <InfoCard title="Frase de Abertura para a 2ª Call" content={`"${estrategiaFechamento?.abordagemInicial}"`} titleColor="text-cyan-400" contentClassName="italic"/>
                    <InfoCard title="Argumentos Principais a Usar" content={<ul className="list-disc list-inside">{estrategiaFechamento?.argumentosPrincipais?.map((arg, i) => <li key={i}>{arg}</li>)}</ul>} />
                    <InfoCard title="Case de Sucesso Estratégico" content={
                        <div>
                            <p><strong>Case:</strong> {estrategiaFechamento?.casesDeSucessoEstrategicos?.casePrincipal}</p>
                            <p><strong>Por quê?</strong> {estrategiaFechamento?.casesDeSucessoEstrategicos?.porQueCase}</p>
                        </div>
                    }/>
                    <InfoCard title="Ancoragem de Valor Específica" content={estrategiaFechamento?.ancoragemValorEspecifica?.calculoOportunidadePerdida} />
                 </div>
            </Section>

            <Section icon={<MapIcon className="w-6 h-6 text-gray-400" />} title="Plano da Segunda Call">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <InfoCard title="1. Conexão (2-3 min)" content={<ul className="list-disc list-inside text-xs">{planoSegundaCall?.conexao?.map((item, i) => <li key={i}>{item}</li>)}</ul>} />
                     <InfoCard title="2. Apresentação (15-20 min)" content={<ul className="list-disc list-inside text-xs">{planoSegundaCall?.apresentacaoDirecionada?.map((item, i) => <li key={i}>{item}</li>)}</ul>} />
                     <InfoCard title="3. Ancoragem (5-7 min)" content={<ul className="list-disc list-inside text-xs">{planoSegundaCall?.ancoragemPersonalizada?.map((item, i) => <li key={i}>{item}</li>)}</ul>} />
                     <InfoCard title="4. Fechamento (10-15 min)" content={<ul className="list-disc list-inside text-xs">{planoSegundaCall?.fechamento?.map((item, i) => <li key={i}>{item}</li>)}</ul>} />
                </div>
            </Section>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Section icon={<CheckCircleIcon className="w-6 h-6 text-green-400" />} title="Checklist Pré-Call">
                    <ul className="space-y-2">
                        {(checklistPreCall ?? []).map((item, index) => (
                             <li key={index} className="flex items-center text-sm text-gray-300">
                                <span className="w-4 h-4 mr-3 bg-gray-700 border border-gray-600 rounded"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </Section>
                <Section icon={<ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />} title="Lembrete Final">
                    <p className="text-yellow-300 italic p-4 bg-yellow-900/20 rounded-md border-l-4 border-yellow-500">{lembreteFinal}</p>
                </Section>
            </div>
        </div>
    );
};

export default RelatorioCirurgicoReport;