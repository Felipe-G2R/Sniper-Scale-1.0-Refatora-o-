import React from 'react';
import type { RelatorioSegundaCallData, Ato1Briefing, Ato2PlanoDeAcao, Ato3ProtocolosAvancados, EtapaPlanoDeAcao } from '../types';
import { useAnalysisManager } from '../hooks/useAnalysisManager';
import { 
    ChevronLeftIcon, UserIcon, MapIcon, BookOpenIcon, StarIcon, CheckCircleIcon,
    ShieldCheckIcon, LightbulbIcon, ExclamationTriangleIcon, FlagIcon
} from './icons';

interface ReportProps {
  reportData: RelatorioSegundaCallData;
}

const Section: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6 animate-fade-in-up">
        <h2 className="flex items-center text-xl font-bold text-white mb-4">
            {icon}
            <span className="ml-3">{title}</span>
        </h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const InfoCard: React.FC<{ title: string, content: string | string[], titleColor?: string }> = ({ title, content, titleColor="text-gray-300" }) => (
    <div className="bg-gray-800/50 p-3 rounded-lg">
        <h4 className={`font-semibold text-sm ${titleColor}`}>{title}</h4>
        {Array.isArray(content) ? (
            <ul className="list-disc list-inside text-sm text-gray-400 mt-1">
                {content.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        ) : (
            <p className="text-sm text-gray-400 mt-1">{content}</p>
        )}
    </div>
);

const Ato1Component: React.FC<{data: Ato1Briefing}> = ({ data }) => (
    <>
        <h3 className="font-bold text-lg text-gray-300 mb-2">1. Resumo Executivo da Missão</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard title="Contexto (Cenário)" content={data?.resumoExecutivo?.contexto ?? 'N/A'} />
            <InfoCard title="Dores Declaradas (Problemas)" content={`"${data?.resumoExecutivo?.doresDeclaradas ?? 'N/A'}"`} titleColor="text-red-400" />
            <InfoCard title="Impacto Real (Implicações)" content={`"${data?.resumoExecutivo?.impactoReal ?? 'N/A'}"`} />
            <InfoCard title="Desejo Central (Visão de Sucesso)" content={`"${data?.resumoExecutivo?.desejoCentral ?? 'N/A'}"`} titleColor="text-green-400"/>
            <InfoCard title="Ponto de Maior Interesse" content={data?.resumoExecutivo?.pontoDeMaiorInteresse ?? 'N/A'} />
            <InfoCard title="O Real Motivo da Compra (Gatilho Profundo)" content={data?.resumoExecutivo?.realMotivoDaCompra ?? 'N/A'} titleColor="text-yellow-400"/>
        </div>
        <h3 className="font-bold text-lg text-gray-300 mb-2 mt-6">2. Análise Psicológica e de Comunicação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard title="Perfil Comportamental" content={data?.analisePsicologica?.perfilComportamental ?? 'N/A'} titleColor="text-cyan-400"/>
            <InfoCard title="Como se Comunicar com este Perfil" content={data?.analisePsicologica?.comoSeComunicar ?? 'N/A'}/>
        </div>
         <div className="mt-4">
            <InfoCard title="Palavras e Frases que Geram Conexão (A serem usadas na Call 2)" content={data?.palavrasEFrasesDeConexao ?? []} />
        </div>
    </>
);

const Ato2Component: React.FC<{data: Ato2PlanoDeAcao}> = ({ data }) => (
    <div className="space-y-4">
        {(data?.etapas ?? []).map((etapa: EtapaPlanoDeAcao, index: number) => (
            <details key={index} className="bg-gray-800/50 p-4 rounded-lg group">
                <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                    {etapa.titulo}
                    <ChevronLeftIcon className="w-5 h-5 transition-transform duration-300 group-open:rotate-[-90deg]" />
                </summary>
                <div className="mt-3 text-sm text-gray-400 space-y-4 border-t border-gray-700/50 pt-4">
                    <div>
                        <h4 className="font-semibold text-gray-300">Objetivo</h4>
                        <p className="mt-1">{etapa.objetivo}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300">Referência para Estudo</h4>
                        <p className="mt-1">{etapa.referenciaParaEstudo}</p>
                    </div>
                    <div>
                         <h4 className="font-semibold text-cyan-400">Script Personalizado</h4>
                         <p className="mt-1 p-3 bg-black/30 rounded-md border-l-2 border-cyan-500/50 italic">"{etapa.script}"</p>
                    </div>
                </div>
            </details>
        ))}
    </div>
);

const Ato3Component: React.FC<{data: Ato3ProtocolosAvancados}> = ({ data }) => (
    <>
        <h3 className="font-bold text-lg text-gray-300 mb-2">15. Plano de Contenção de Objeções</h3>
        <InfoCard title="Objeção Antecipada" content={data?.planoDeContencaoDeObjecoes?.objecaoAntecipada ?? 'N/A'} titleColor="text-red-400" />
        <InfoCard title="Protocolo de Resposta" content={`"${data?.planoDeContencaoDeObjecoes?.protocoloDeResposta ?? 'N/A'}"`} />
        
        <h3 className="font-bold text-lg text-gray-300 mb-2 mt-6">16. Tática Psicológica Recomendada</h3>
        <InfoCard title="Arma Sugerida" content={data?.taticaPsicologicaRecomendada?.armaSugerida ?? 'N/A'} titleColor="text-yellow-400" />
        <InfoCard title="Gatilho para Uso" content={data?.taticaPsicologicaRecomendada?.gatilhoParaUso ?? 'N/A'} />

        <h3 className="font-bold text-lg text-gray-300 mb-2 mt-6">17. Apêndice: Referências do Arsenal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard title="Técnicas de Fechamento" content={data?.referenciasDoArsenal?.tecnicasDeFechamento ?? 'N/A'} />
            <InfoCard title="Estrutura e Scripts da Call" content={data?.referenciasDoArsenal?.estruturaEScripts ?? 'N/A'} />
            <InfoCard title="Psicologia da Comunicação" content={data?.referenciasDoArsenal?.psicologiaDaComunicacao ?? 'N/A'} />
            <InfoCard title="Validação da Qualidade" content={data?.referenciasDoArsenal?.validacaoDaQualidade ?? 'N/A'} />
        </div>
    </>
);


const RelatorioSegundaCallReport: React.FC<ReportProps> = ({ reportData }) => {
    const { navigate } = useAnalysisManager();

    if (!reportData) {
        return <div className="text-center text-gray-400">Carregando dados do relatório...</div>;
    }

    const { cliente, closerName, dataDaAnalise, ato1_briefing, ato2_planoDeAcao, ato3_protocolosAvancados } = reportData;

    return (
        <div className="space-y-6 animate-fade-in">
             <header className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <button onClick={() => navigate('dashboard')} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                        <ChevronLeftIcon className="h-5 w-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Dossiê Estratégico de Fechamento</h1>
                        <p className="text-gray-400 text-sm">O Guia da Venda Inevitável para {closerName}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-white">{cliente}</p>
                    <p className="text-xs text-gray-400">Análise de {dataDaAnalise}</p>
                </div>
            </header>
            
            <Section icon={<BookOpenIcon className="w-6 h-6 text-yellow-400" />} title="ATO I: O BRIEFING - OVERVIEW COMPLETO DA CALL 1">
                <Ato1Component data={ato1_briefing} />
            </Section>

            <Section icon={<MapIcon className="w-6 h-6 text-cyan-400" />} title="ATO II: O PLANO DE AÇÃO - ROTEIRO TÁTICO PARA A CALL 2">
                <Ato2Component data={ato2_planoDeAcao} />
            </Section>

            <Section icon={<ShieldCheckIcon className="w-6 h-6 text-purple-400" />} title="ATO III: PROTOCOLOS AVANÇADOS E REFERÊNCIAS">
                <Ato3Component data={ato3_protocolosAvancados} />
            </Section>
        </div>
    );
};

export default RelatorioSegundaCallReport;