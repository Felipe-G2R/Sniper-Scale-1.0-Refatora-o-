import React from 'react';
import type { LostCallReportData, TabelaEtapa, JustificativaNotaDetalhada, CorrecaoErroDetalhada, ErroCritico8020, AcertoIdentificado, BehavioralProfile } from '../types';
import { 
    ChevronLeftIcon, BookOpenIcon, ClipboardCheckIcon, UserIcon, StarIcon, CheckCircleIcon,
    XCircleIcon, LightbulbIcon, ExclamationTriangleIcon, ChatBubbleLeftRightIcon, TargetIcon, TrendingUpIcon, ListBulletIcon
} from './icons';
import { useAnalysisManager } from '../hooks/useAnalysisManager';
import CircularScore from './CircularScore';
import CSFeedbackSection from './CSFeedbackSection';
import ReferralSection from './ReferralSection';

interface LostCallReportProps {
  reportData: LostCallReportData;
}

const Section: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode, className?: string }> = ({ icon, title, children, className = '' }) => (
    <div className={`bg-[#161b22] border border-gray-800/50 rounded-xl p-6 animate-fade-in-up ${className}`}>
        <h2 className="flex items-center text-xl font-bold text-white mb-4">
            {icon}
            <span className="ml-3">{title}</span>
        </h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const BehavioralProfileSection: React.FC<{ profile: BehavioralProfile }> = ({ profile }) => (
    <Section icon={<UserIcon className="w-6 h-6 text-cyan-400" />} title="Análise de Perfil Comportamental">
        <div className="space-y-3 text-sm">
            <p><span className="font-semibold text-gray-300">Perfil Identificado:</span> {profile.identifiedProfile}</p>
            <p><span className="font-semibold text-gray-300">Análise de Adaptação:</span> {profile.adaptationAnalysis}</p>
            <p><span className="font-semibold text-gray-300">Recomendações:</span> {profile.personalizedRecommendations}</p>
            {profile.recommendedPhrases && (
                <div>
                    <p className="font-semibold text-gray-300 mt-2">Frases Recomendadas:</p>
                    <ul className="list-disc list-inside text-gray-400 space-y-1">
                        {profile.recommendedPhrases.map((phrase, i) => <li key={i} className="italic">"{phrase}"</li>)}
                    </ul>
                </div>
            )}
        </div>
    </Section>
);

const AnaliseFinalSection: React.FC<{ data: LostCallReportData['analiseFinal'] }> = ({ data }) => (
    <div className="space-y-4">
        <div>
            <h3 className="font-bold text-lg text-yellow-400 mb-2">Diagnóstico 80/20 - Padrão dos Erros</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-cyan-900/50 p-3 rounded-lg"><p className="font-bold text-white">{data?.diagnostico8020?.padraoDosErros?.excelente}</p><p className="text-xs text-cyan-400">Excelente (9-10)</p></div>
                <div className="bg-green-900/50 p-3 rounded-lg"><p className="font-bold text-white">{data?.diagnostico8020?.padraoDosErros?.bom}</p><p className="text-xs text-green-400">Bom (7-8)</p></div>
                <div className="bg-yellow-900/50 p-3 rounded-lg"><p className="font-bold text-white">{data?.diagnostico8020?.padraoDosErros?.deficiente}</p><p className="text-xs text-yellow-400">Deficiente (4-6)</p></div>
                <div className="bg-red-900/50 p-3 rounded-lg"><p className="font-bold text-white">{data?.diagnostico8020?.padraoDosErros?.critico}</p><p className="text-xs text-red-400">Crítico (0-3)</p></div>
            </div>
        </div>
        <div>
            <h3 className="font-bold text-lg text-red-400 mb-2">Os 20% de Erros que Causaram 80% da Perda</h3>
            {(data?.diagnostico8020?.errosCriticos ?? []).map((erro, i) => (
                <div key={i} className="bg-red-900/30 p-4 rounded-lg mt-2 border-l-4 border-red-500">
                    <h4 className="font-bold text-white">ERRO CRÍTICO #{i + 1} - {erro.etapa} ({erro.nota})</h4>
                    <p className="text-sm text-gray-300"><span className="font-semibold">O que aconteceu:</span> {erro.oQueAconteceu}</p>
                    <p className="text-sm text-yellow-300"><span className="font-semibold">Por que foi fatal:</span> {erro.porqueFoiFatal}</p>
                    <p className="text-sm text-cyan-400 mt-1 italic"><span className="font-semibold not-italic">Como Estevão Faria:</span> "{erro.comoEstevaoFaria}"</p>
                    <p className="text-xs text-gray-400 mt-1">Timestamp: {erro.timestamp}</p>
                </div>
            ))}
        </div>
        <InfoCard title="Efeito Dominó da Perda" content={data?.efeitoDomino} />
        <InfoCard title="Momento Exato que Perdeu a Venda" content={`${data?.momentoExatoDaPerda?.timestamp} - ${data?.momentoExatoDaPerda?.oQueAconteceu}`} />
        <InfoCard title="Causa Raiz do Erro" content={(data?.causaRaizDoErro ?? []).join(', ')} />
    </div>
);

const PerfilComportamentalSection: React.FC<{ data: LostCallReportData['perfilComportamental'] }> = ({ data }) => (
    <div className="space-y-4">
        <p className="text-sm text-center"><span className="font-semibold text-gray-300">Perfil Identificado: </span><span className="font-bold text-cyan-400">{(data?.perfilDoCliente ?? []).join(' / ')}</span></p>
        <div>
            <h4 className="font-semibold text-white mb-1">Medos Identificados</h4>
            <ul className="list-disc list-inside text-sm text-gray-300">
                {(data?.medosIdentificados ?? []).map((m, i) => <li key={i}>{m}</li>)}
            </ul>
        </div>
        <div>
            <h4 className="font-semibold text-white mb-1">Estratégia de Abordagem Recomendada</h4>
            <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md">{data?.estrategiaDeAbordagem.analitico}</p>
        </div>
    </div>
);

const JustificativasSection: React.FC<{ data: JustificativaNotaDetalhada[] }> = ({ data }) => (
    <div className="space-y-4">
        {(data ?? []).map((item, index) => (
            <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-white">{item.nomeEtapa} - <span className="text-yellow-400">{item.nota}</span></h3>
                <p className="text-xs text-gray-400 mt-1">{item.porqueDaTecnica}</p>
                <div className="mt-3 space-y-2 text-sm">
                    <p><span className="font-semibold text-gray-300">O que fez bem:</span> {item.oQueFezBem}</p>
                    <p className="text-yellow-400"><span className="font-semibold text-yellow-300">Pontos de Melhoria:</span> {item.pontosDeMelhoria}</p>
                    <div className="p-3 rounded-md border border-dashed border-cyan-500/50">
                        <p className="font-semibold text-cyan-400 mb-1">Como Estevão Faria:</p>
                        <p className="text-cyan-400 italic">"{item.comoEstevaoFaria}"</p>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const InfoCard: React.FC<{title: string, content: string}> = ({title, content}) => (
     <div className="bg-gray-800/50 p-3 rounded-lg">
        <h4 className="font-semibold text-gray-300 text-sm">{title}</h4>
        <p className="text-sm text-white">{content}</p>
    </div>
);

const LostCallReport: React.FC<LostCallReportProps> = ({ reportData }) => {
    const { navigate, newAnalysisRequest } = useAnalysisManager();

    if (!reportData) {
        return <div className="text-center text-gray-400">Carregando dados do relatório...</div>;
    }

    const { nomeCloser, totalScore, totalMaxScore, analiseFinal, perfilComportamental, pontuacaoPorEtapa, justificativaDetalhada, acertosIdentificados, errosParaCorrecao, indicadoresComportamentais, behavioralProfile, csFeedback, referrals } = reportData;

    const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
    let classification = "Excelente";
    if (percentage < 40) classification = "Crítica";
    else if (percentage < 70) classification = "Deficiente";
    else if (percentage < 90) classification = "Boa";

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                    <button onClick={() => navigate('dashboard')} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                        <ChevronLeftIcon className="h-5 w-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Análise de Call Perdida - {nomeCloser}</h1>
                        <p className="text-gray-400 text-sm">{reportData.fileName}</p>
                    </div>
                </div>
                 <span className="px-4 py-2 text-sm font-bold text-red-900 bg-red-400 rounded-lg">VENDA PERDIDA</span>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 xl:col-span-3 bg-[#161b22] border border-gray-800/50 rounded-xl p-6 flex items-center justify-center">
                    <CircularScore score={totalScore} maxScore={totalMaxScore} classification={`Performance ${classification}`} />
                </div>
                <div className="lg:col-span-8 xl:col-span-9">
                    <Section icon={<TargetIcon className="w-6 h-6 text-red-400"/>} title="Análise Final - Diagnóstico 80/20">
                        <AnaliseFinalSection data={analiseFinal} />
                    </Section>
                </div>
            </div>

            <Section icon={<ClipboardCheckIcon className="w-6 h-6 text-cyan-400"/>} title="Estratégia de Correção">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard title="1. Foco Imediato" content={analiseFinal?.estrategiaDeCorrecao.focoImediato} />
                    <InfoCard title="2. Próxima Call" content={analiseFinal?.estrategiaDeCorrecao.proximaCall} />
                    <InfoCard title="3. Script Salva-Vidas" content={`"${analiseFinal?.estrategiaDeCorrecao.scriptSalvaVidas}"`} />
                </div>
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Section icon={<UserIcon className="w-6 h-6 text-cyan-400"/>} title="Relatório - Perfil Comportamental">
                    <PerfilComportamentalSection data={perfilComportamental} />
                </Section>
                <Section icon={<ChatBubbleLeftRightIcon className="w-6 h-6 text-cyan-400"/>} title="Indicadores Comportamentais">
                    <InfoCard title="Perguntas Emocionais x Racionais" content={indicadoresComportamentais?.perguntasEmocionaisRacionais}/>
                    <InfoCard title="Uso de Frases de Suporte" content={indicadoresComportamentais?.usoFrasesSuporte}/>
                    <InfoCard title="Controle da Call" content={indicadoresComportamentais?.controleCall}/>
                    <InfoCard title="Postura" content={indicadoresComportamentais?.postura}/>
                </Section>
            </div>
            
            {behavioralProfile && (
                <BehavioralProfileSection profile={behavioralProfile} />
            )}
            
            {csFeedback && <CSFeedbackSection feedback={csFeedback} />}
            {referrals && referrals.length > 0 && <ReferralSection referrals={referrals} />}

            <Section icon={<ListBulletIcon className="w-6 h-6 text-gray-400"/>} title="Tabela Completa das Etapas">
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {(pontuacaoPorEtapa ?? []).map(etapa => {
                        const notaCor = etapa.nota >= 9 ? 'text-cyan-400' : etapa.nota >= 7 ? 'text-green-400' : etapa.nota >= 4 ? 'text-yellow-400' : 'text-red-400';
                        return (
                            <div key={etapa.etapa} className="bg-gray-800/50 p-3 rounded-md text-center">
                                <p className="text-xs text-gray-400 truncate">{etapa.nome}</p>
                                <p className={`text-2xl font-bold ${notaCor}`}>{etapa.nota}<span className="text-sm text-gray-500">/10</span></p>
                            </div>
                        )
                    })}
                 </div>
            </Section>

            <Section icon={<ExclamationTriangleIcon className="w-6 h-6 text-yellow-400"/>} title="Justificativa Detalhada das Notas ( < 10/10 )">
                <JustificativasSection data={justificativaDetalhada} />
            </Section>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Section icon={<CheckCircleIcon className="w-6 h-6 text-green-400"/>} title="Acertos Identificados">
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                        {(acertosIdentificados ?? []).map((item, i) => <li key={i}>{item.nomeEtapa}</li>)}
                    </ul>
                </Section>
                 <Section icon={<XCircleIcon className="w-6 h-6 text-red-400"/>} title="Erros para Correção">
                     {(errosParaCorrecao ?? []).map((item, i) => (
                         <div key={i} className="bg-gray-800/50 p-3 rounded-md">
                            <h4 className="font-semibold text-white">{item.nomeEtapa}</h4>
                            <p className="text-xs text-red-400 mt-1">{item.porqueFoiErro}</p>
                            <p className="text-xs text-gray-400 mt-1 italic">O que ele falou: "{item.oQueEleFalou}"</p>
                            <p className="text-xs text-cyan-400 mt-1">Como Estevão Faria: "{item.comoEstevaoFaria}"</p>
                         </div>
                     ))}
                </Section>
            </div>
            
            <div className="flex justify-center space-x-4 mt-6">
                <button onClick={() => navigate('dashboard')} className="px-6 py-3 text-sm font-semibold text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700">Voltar ao Dashboard</button>
                <button onClick={newAnalysisRequest} className="px-6 py-3 text-sm font-semibold text-black bg-[#22d3ee] rounded-lg hover:bg-cyan-400">Nova Análise</button>
            </div>
        </div>
    );
};

export default LostCallReport;