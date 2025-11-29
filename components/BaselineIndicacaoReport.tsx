import React from 'react';
import type { BaselineIndicacaoReportData } from '../types';
import { useAnalysisManager } from '../hooks/useAnalysisManager';
import { 
    ChevronLeftIcon, UserIcon, HeartIcon, ChartBarIcon, StarIcon, LightbulbIcon,
    BookOpenIcon, FlagIcon, UserGroupIcon, ClipboardCheckIcon, CheckCircleIcon
} from './icons';

interface ReportProps {
  reportData: BaselineIndicacaoReportData;
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

const InfoCard: React.FC<{ title: string, content: React.ReactNode, titleColor?: string }> = ({ title, content, titleColor = "text-gray-300" }) => (
    <div className="bg-gray-800/50 p-3 rounded-md">
        <h4 className={`font-semibold text-sm ${titleColor}`}>{title}</h4>
        <div className="text-sm text-gray-400 mt-1">{content}</div>
    </div>
);

const Checklist: React.FC<{ items: {label: string, checked: boolean}[] }> = ({ items }) => (
    <ul className="space-y-2">
        {items.map((item, index) => (
             <li key={index} className="flex items-center text-sm text-gray-300">
                <span className={`w-4 h-4 mr-3 rounded flex items-center justify-center ${item.checked ? 'bg-cyan-500' : 'bg-gray-700 border border-gray-600'}`}>
                    {item.checked && <CheckCircleIcon className="w-4 h-4 text-black" />}
                </span>
                {item.label}
            </li>
        ))}
    </ul>
);

const BaselineIndicacaoReport: React.FC<ReportProps> = ({ reportData }) => {
    const { navigate } = useAnalysisManager();

    if (!reportData) {
        return <div className="text-center text-gray-400">Carregando dados do relatório...</div>;
    }
    
    const {
        informacoesCliente,
        doresQuantificadas,
        situacaoAtual,
        expectativasDesejos,
        contextoEmocional,
        tentativasAnteriores,
        promessaCompromisso,
        perfilParaIndicacao,
        observacoesEstrategicas,
    } = reportData;

    const checklistItems = [
        { label: "Mínimo 3 dores quantificadas (0-10)", checked: (doresQuantificadas?.principal?.nota >= 0 && doresQuantificadas?.secundario?.nota >= 0 && doresQuantificadas?.terciario?.nota >= 0) },
        { label: "Top 3 expectativas/desejos", checked: ((expectativasDesejos?.listaDesejos?.length || 0) >= 3) },
        { label: "Meta numérica clara", checked: !!expectativasDesejos?.metaNumericaDeclarada?.ondeQuerChegar },
        { label: "Sentimento emocional dominante", checked: !!contextoEmocional?.sentimentoDominante },
        { label: "Histórico de tentativas anteriores", checked: tentativasAnteriores?.jaTentou === true },
        { label: "Promessa específica registrada", checked: !!promessaCompromisso?.promessaEspecifica },
        { label: "Retorno agendado na hora", checked: promessaCompromisso?.agendamentoRetorno?.clienteAceitou === true },
        { label: "Perfil social mapeado", checked: !!perfilParaIndicacao?.estiloRelacionamento }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <button onClick={() => navigate('dashboard')} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                        <ChevronLeftIcon className="h-5 w-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Baseline para Indicação</h1>
                        <p className="text-gray-400 text-sm">Cliente: {informacoesCliente?.nomeCompleto ?? 'N/A'}</p>
                    </div>
                </div>
                 <div className="text-right">
                    <p className="text-sm font-semibold text-white">Closer: {informacoesCliente?.closerResponsavel ?? 'N/A'}</p>
                    <p className="text-xs text-gray-400">Data da Venda: {informacoesCliente?.dataVenda ?? 'N/A'}</p>
                </div>
            </header>
            
            <Section icon={<UserIcon className="w-6 h-6 text-gray-400" />} title="Informações do Cliente">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCard title="Produto/Serviço" content={informacoesCliente?.produtoServico ?? 'N/A'} />
                    <InfoCard title="Valor do Investimento" content={`R$ ${(informacoesCliente?.valorInvestimento ?? 0).toLocaleString('pt-BR')}`} />
                </div>
            </Section>

            <Section icon={<HeartIcon className="w-6 h-6 text-red-400" />} title="Parte 1: Dores Quantificadas">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard title="DOR PRINCIPAL" content={`${doresQuantificadas?.principal?.descricao ?? 'N/A'} - Nota ${doresQuantificadas?.principal?.nota ?? 'N/A'}/10`} />
                    <InfoCard title="DOR SECUNDÁRIA" content={`${doresQuantificadas?.secundario?.descricao ?? 'N/A'} - Nota ${doresQuantificadas?.secundario?.nota ?? 'N/A'}/10`} />
                    <InfoCard title="DOR TERCIÁRIA" content={`${doresQuantificadas?.terciario?.descricao ?? 'N/A'} - Nota ${doresQuantificadas?.terciario?.nota ?? 'N/A'}/10`} />
                </div>
                <InfoCard title="Impactos na Vida (0-10)" content={
                     <ul className="text-xs grid grid-cols-2 md:grid-cols-3 gap-1">
                        <li>Trabalho: {doresQuantificadas?.impactos?.trabalhoProdutividade ?? 'N/A'}</li>
                        <li>Relacionamentos: {doresQuantificadas?.impactos?.relacionamentos ?? 'N/A'}</li>
                        <li>Saúde: {doresQuantificadas?.impactos?.saudeEnergia ?? 'N/A'}</li>
                        <li>Financeiro: {doresQuantificadas?.impactos?.financeiro ?? 'N/A'}</li>
                        <li>Qualidade de Vida: {doresQuantificadas?.impactos?.qualidadeDeVidaGeral ?? 'N/A'}</li>
                     </ul>
                } />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard title="Frequência do Problema" content={doresQuantificadas?.frequencia ?? 'N/A'} />
                    <InfoCard title="Há quanto tempo enfrenta" content={doresQuantificadas?.tempoEnfrentando ?? 'N/A'} />
                </div>
            </Section>

            <Section icon={<ChartBarIcon className="w-6 h-6 text-cyan-400" />} title="Parte 2: Situação Atual (Números)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard title="Faturamento Atual" content={`R$ ${(situacaoAtual?.faturamento ?? 0).toLocaleString('pt-BR')}`} />
                    <InfoCard title="Resultado Atual" content={situacaoAtual?.resultado ?? 'N/A'} />
                    <InfoCard title="Métrica Principal" content={situacaoAtual?.metricaPrincipal ?? 'N/A'} />
                </div>
            </Section>
            
            <Section icon={<StarIcon className="w-6 h-6 text-yellow-400" />} title="Parte 3: Expectativas e Desejos">
                <InfoCard title="Expectativa Principal (palavras do cliente)" content={<p className="italic">"{expectativasDesejos?.principal ?? 'N/A'}"</p>} />
                <InfoCard title="Lista de Desejos (Top 3)" content={<ol className="list-decimal list-inside">{(expectativasDesejos?.listaDesejos || []).map((d,i) => <li key={i}>{d}</li>)}</ol>} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard title="Meta Numérica" content={`R$ ${(expectativasDesejos?.metaNumericaDeclarada?.ondeQuerChegar ?? 0).toLocaleString('pt-BR')}`} />
                    <InfoCard title="Prazo" content={expectativasDesejos?.metaNumericaDeclarada?.emQuantoTempo ?? 'N/A'} />
                    <InfoCard title="Resultado Esperado" content={expectativasDesejos?.metaNumericaDeclarada?.resultadoEsperado ?? 'N/A'} />
                </div>
                 <InfoCard title="Transformação Esperada" content={<p className="italic">"{expectativasDesejos?.transformacaoEsperada ?? 'N/A'}"</p>} />
            </Section>
            
            <Section icon={<LightbulbIcon className="w-6 h-6 text-yellow-400" />} title="Parte 4: Contexto Emocional">
                <InfoCard title="Sentimento Dominante (palavras do cliente)" content={<p className="italic">"{contextoEmocional?.sentimentoDominante ?? 'N/A'}"</p>} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard title="Palavras-chave Emocionais" content={(contextoEmocional?.palavrasChave || []).join(', ')} />
                    <InfoCard title="Consequência se não resolver" content={contextoEmocional?.consequenciaSeNaoResolver ?? 'N/A'} />
                </div>
            </Section>
            
             <Section icon={<BookOpenIcon className="w-6 h-6 text-gray-400" />} title="Parte 5: Tentativas Anteriores">
                {tentativasAnteriores?.jaTentou ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <InfoCard title="O que tentou" content={tentativasAnteriores.detalhes?.solucaoMetodo ?? 'N/A'} />
                        <InfoCard title="Investimento" content={`R$ ${(tentativasAnteriores.detalhes?.investimento ?? 0).toLocaleString('pt-BR')}`} />
                        <InfoCard title="Tempo" content={tentativasAnteriores.detalhes?.tempo ?? 'N/A'} />
                        <InfoCard title="Resultado Obtido" content={tentativasAnteriores.detalhes?.resultado ?? 'N/A'} />
                        <InfoCard title="Por que não funcionou" content={tentativasAnteriores.detalhes?.porQueNaoFuncionou ?? 'N/A'} />
                        <InfoCard title="Principal Objeção/Dúvida Agora" content={tentativasAnteriores.principalObjecaoAtual ?? 'N/A'} />
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Cliente não tentou resolver o problema antes.</p>
                )}
            </Section>

            <Section icon={<FlagIcon className="w-6 h-6 text-green-400" />} title="Parte 6: Promessa e Compromisso">
                <InfoCard title="Promessa Específica Feita" content={<p className="italic">"{promessaCompromisso?.promessaEspecifica ?? 'N/A'}"</p>} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <InfoCard title="Data do Retorno Agendado" content={promessaCompromisso?.agendamentoRetorno?.data ?? 'N/A'} />
                     <InfoCard title="Frame Usado" content={promessaCompromisso?.agendamentoRetorno?.frameUsado ?? 'N/A'} />
                     <InfoCard title="Cliente Aceitou?" content={promessaCompromisso?.agendamentoRetorno?.clienteAceitou ? "Sim" : "Não"} />
                </div>
            </Section>

             <Section icon={<UserGroupIcon className="w-6 h-6 text-cyan-400" />} title="Parte 7: Perfil para Indicação Futura">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCard title="Profissão/Área" content={perfilParaIndicacao?.contextoProfissional?.profissao ?? 'N/A'} />
                    <InfoCard title="Nicho" content={perfilParaIndicacao?.contextoProfissional?.nicho ?? 'N/A'} />
                    <InfoCard title="Faz parte de comunidade?" content={`${perfilParaIndicacao?.contextoProfissional?.comunidade?.fazParte ? `Sim (${perfilParaIndicacao?.contextoProfissional?.comunidade?.qual})` : 'Não'}`} />
                    <InfoCard title="Estilo de Relacionamento" content={perfilParaIndicacao?.estiloRelacionamento ?? 'N/A'} />
                    <InfoCard title="Tomada de Decisão" content={perfilParaIndicacao?.tomadaDecisao?.comoDecide ?? 'N/A'} />
                    <InfoCard title="Potencial de Indicação" content={perfilParaIndicacao?.potencial ?? 'N/A'} />
                 </div>
            </Section>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Section icon={<ClipboardCheckIcon className="w-6 h-6 text-gray-400" />} title="Parte 8: Observações e Checklist">
                     <InfoCard title="Insights do Closer" content={observacoesEstrategicas?.insightsCloser ?? 'N/A'} />
                     <InfoCard title="Frases Marcantes do Cliente" content={<ul className="list-disc list-inside">{(observacoesEstrategicas?.frasesMarcantes || []).map((f, i) => <li key={i} className="italic">"{f}"</li>)}</ul>} />
                     <InfoCard title="Gatilhos Emocionais" content={(observacoesEstrategicas?.gatilhosEmocionais || []).join(', ')} />
                     <InfoCard title="Objeções Vencidas" content={(observacoesEstrategicas?.objecoesVencidas || []).join(', ')} />
                </Section>
                <Section icon={<CheckCircleIcon className="w-6 h-6 text-green-400" />} title="Checklist de Validação">
                    <Checklist items={checklistItems} />
                </Section>
            </div>
        </div>
    );
};

export default BaselineIndicacaoReport;