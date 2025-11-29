import React from 'react';
// FIX: Added missing report data types to the import statement.
import type { AnalysisStep, BehavioralIndicator, AnalysisModel, SuccessfulCallReportData, LostCallReportData, VendaRealizadaReportData, RelatorioSegundaCallData } from './types';

export const ANALYSIS_MODELS: AnalysisModel[] = [
  { id: 'next-level', title: 'Next Level - 25 Etapas', description: 'Análise completa de 25 etapas para vendas de alto valor, baseada no guia Next Level.', tags: ['Venda Realizada', '25 Etapas', 'Next Level'] },
  { id: 'call-perdida', title: 'Call Perdida - 25 Etapas', description: 'Framework completo de 25 etapas para diagnóstico profundo e plano de ação.', tags: ['Venda Perdida', 'Diagnóstico', '25 Etapas'] },
  { id: 'venda-realizada', title: 'Venda Realizada', description: 'Relatório estruturado em 3 blocos de performance.', tags: ['Venda Realizada', 'Relatório'] },
  { id: 'relatorio-cirurgico', title: 'Relatório Cirúrgico - 1ª Call', description: 'Preparação estratégica para fechamento na segunda call.', tags: ['Estratégia', 'Pré-Call', 'Cirúrgico'] },
  { id: 'relatorio-segunda-call', title: 'GPS Segunda Call', description: 'Dossiê Estratégico de Fechamento: O Guia da Venda Inevitável.', tags: ['Dossiê', 'Estratégia', 'Fechamento'] },
  { id: 'baseline-indicacao', title: 'Baseline para Indicação', description: 'Ficha para mapear o estado do cliente e preparar para indicações futuras.', tags: ['Indicação', 'Baseline', 'CS'] },
  { id: 'universal', title: 'Universal', description: 'Modelo adaptável para qualquer tipo de call.', tags: ['Universal'] },
];

const MOCK_ANALYSIS_STEPS: AnalysisStep[] = Array.from({ length: 25 }, (_, i) => {
    const score = Math.floor(Math.random() * 4) + 7; // Score between 7 and 10
    return {
        id: i + 1,
        name: `ETAPA ${i + 1}`,
        score,
        maxScore: 10,
        status: score >= 9 ? 'Excelente' : 'Bom',
        description: `Descrição da Etapa ${i + 1}`,
        specificAnalysis: 'Sessão estratégica perfeita. Contrastou brilhantemente a situação atual (conversão 15%, follow-up manual, RS-COV >7 dias) com o futuro (conversão 35% previsões automatizadas, RS-COV >7min), apresentando a metodologia como a ponte necessária.',
        justification: 'Pontuação máxima por ter criado contraste claro, usado linguagem visual impactante e posicionado a solução como ponte lógica entre o problema e o resultado desejado.',
        strengths: ['Excelente uso de storytelling.', 'Conexão clara com a dor do cliente.'],
        opportunities: ['Explorar mais o impacto financeiro do problema.'],
        benchmark: {
            average: Math.round((Math.random() * 2 + 6.5) * 10) / 10, // avg between 6.5 and 8.5
            top: Math.round((Math.random() * 0.5 + 9.5) * 10) / 10, // top between 9.5 and 10
        }
    };
});
MOCK_ANALYSIS_STEPS[0].name = 'RAPPORT';
MOCK_ANALYSIS_STEPS[1].name = 'PACTO QUESTIONÁRIO';
MOCK_ANALYSIS_STEPS[2].name = 'SPIN SITUAÇÃO';
MOCK_ANALYSIS_STEPS[3].name = 'SPIN PROBLEMA + IMPLICAÇÃO';
MOCK_ANALYSIS_STEPS[5].name = 'SPIN NECESSIDADE';
MOCK_ANALYSIS_STEPS[8].name = 'APRESENTAÇÃO DO CÉU PERSONALIZADO';


const MOCK_BEHAVIORAL_INDICATORS: BehavioralIndicator[] = [
  { name: 'Perguntas emocionais e racionais', description: 'Equilíbrio perfeito - 60% emocional, 40% racional', score: 75, status: 'Bom' },
  { name: 'Uso de frases de suporte', description: 'Excelente uso de frases de suporte e acolhimento.', score: 95, status: 'Excelente' },
  { name: 'Controle da call', description: 'Closer manteve controle 80% do tempo.', score: 80, status: 'Excelente' },
  { name: 'Postura', description: 'Consultor estratégico - autoridade estabelecida.', score: 90, status: 'Consultivo' },
];

export const MOCK_SUCCESSFUL_CALL_DATA: SuccessfulCallReportData = {
    id: 1,
    type: 'successful',
    fileName: 'mock_call_success.txt',
    model: ANALYSIS_MODELS[0],
    closerName: "João Silva",
    totalScore: MOCK_ANALYSIS_STEPS.reduce((sum, step) => sum + step.score, 0),
    totalMaxScore: MOCK_ANALYSIS_STEPS.length * 10,
    performanceSummary: "Execução de rapport inicial! Você demonstrou maestria ao estabelecer conexão genuína com o prospect, criando uma atmosfera de confiança que foi fundamental para o sucesso da call. Suas abordagens consultivas e o controle assertivo da conversa foram exemplares.",
    criticalMoment: "MOMENTO CRÍTICO na ETAPA 19 (Ancoragem Inicial): Houve uma resistência significativa quando o valor foi apresentado. O prospect demonstrou hesitação e solicitou maior desconto. Foi contornado com maestria.",
    finalResult: "Parabéns pela conversão! Sua capacidade de contornar objeções e manter a postura assumptions foi determinante. Continue aplicando essa metodologia estruturada - ela está gerando resultados consistentes. Podemos passar replicar essa performance e buscar indicações de qualidade.",
    steps: MOCK_ANALYSIS_STEPS,
    behavioralIndicators: MOCK_BEHAVIORAL_INDICATORS,
}

export const MOCK_LOST_CALL_DATA: LostCallReportData = {
    id: 2,
    type: 'lost',
    fileName: 'venda_perdida_completa_gabriel.txt',
    model: ANALYSIS_MODELS[1],
    closerName: "Gabriel",
    nomeCloser: "Gabriel",
    totalScore: 135,
    totalMaxScore: 250,
    pontuacaoPorEtapa: Array.from({ length: 25 }, (_, i) => ({
        etapa: i + 1,
        nome: `ETAPA ${i + 1}`,
        nota: Math.floor(Math.random() * 6) + 3 // scores between 3 and 8
    })),
    justificativaDetalhada: [
        {
            nomeEtapa: "ETAPA 13 - PACTO PRÉ-APRESENTAÇÃO",
            nota: "2/10",
            porqueDaTecnica: "Eliminar a ambiguidade do fechamento, comprometendo o lead com uma decisão.",
            explicacaoEtapa: "Esta etapa existe para evitar a objeção 'vou pensar' e criar um ambiente sério para a decisão.",
            oQueFezBem: "Tentou estabelecer uma expectativa de decisão.",
            pontosDeMelhoria: "Não obteve um compromisso explícito de SIM ou NÃO, a pergunta foi vaga e permitiu uma saída fácil para o prospect.",
            comoEstevaoFaria: "'Ao final da nossa conversa, a única coisa que preciso de você é um 'sim, vamos fazer isso' ou um 'não, isso não é para mim'. Podemos combinar assim?'",
            cenarioSugerido: "Após construir o 'inferno' e antes de apresentar a solução, pausar e dizer: 'Antes de eu te mostrar como resolvemos isso, preciso de um combinado. Vou te mostrar tudo, e no final, você me dá um sim ou um não. Justo?'"
        }
    ],
    perfilComportamental: {
        perfilDoCliente: ['ANALÍTICO'],
        medosIdentificados: ["Cometer erros", "Não ter informações suficientes", "Cenários imprevisíveis"],
        frasesQueFuncionam: {
            dominante: "'A decisão é sua'",
            influente: "'Gostei do seu perfil'",
            estavel: "'Passo a passo seguro'",
            analitico: "'Vai minimizar suas falhas', 'A melhor escola', 'Fazer do jeito certo'"
        },
        estrategiaDeAbordagem: {
            dominante: "Desafie + Resultados + Rapidez",
            influente: "Elogie + Emoção + Reconhecimento",
            estavel: "Segurança + Método + Paciência",
            analitico: "Informação + Lógica + Qualidade"
        }
    },
    acertosIdentificados: [
        { nomeEtapa: "ETAPA 1 - RAPPORT" },
        { nomeEtapa: "ETAPA 3 - SPIN SITUAÇÃO" }
    ],
    errosParaCorrecao: [
        {
            nomeEtapa: "ETAPA 19 - ANCORAGEM INICIAL (VALOR X PREÇO)",
            porqueFoiErro: "Apresentou o preço sem antes fazer o prospect verbalizar o valor da solução, tornando o investimento um choque.",
            oQueEleFalou: "'Então, o programa completo fica em R$ 80.000.'",
            buscarNaBase: "Call 'Estevão - Venda Analítico', onde ele passa 10 minutos quantificando o 'dinheiro na mesa' antes de mencionar o preço.",
            comoEstevaoFaria: "'Considerando que você está deixando de faturar R$ 200k por ano, quanto você acredita que VALE um sistema que te entrega esse resultado?'",
            porqueEhImportante: "Sem ancoragem de valor, o preço não tem referência e sempre parecerá caro, levando a uma objeção de preço quase garantida."
        }
    ],
    indicadoresComportamentais: {
        perguntasEmocionaisRacionais: "Desequilibrado. Foco de 80% em perguntas racionais (dados, fatos) e apenas 20% em emocionais.",
        usoFrasesSuporte: "Baixo. Usou poucas frases como 'entendo você' ou 'faz sentido', o que deixou a conversa com um tom de interrogatório.",
        controleCall: "Lead perguntou mais (60% do tempo). O closer perdeu o controle após a etapa de SPIN.",
        postura: "Entrevistador. Atuou como um coletor de informações em vez de um consultor estratégico que guia o processo."
    },
    analiseFinal: {
        diagnostico8020: {
            padraoDosErros: {
                excelente: "0 etapas",
                bom: "5 etapas",
                deficiente: "12 etapas",
                critico: "8 etapas"
            },
            errosCriticos: [
                { etapa: "ETAPA 19", nota: "1/10", oQueAconteceu: "Falha completa na ancoragem de valor antes do preço.", porqueFoiFatal: "Tornou a objeção de preço inevitável e invalidou toda a construção de problema feita anteriormente.", timestamp: "38:15", comoEstevaoFaria: "'Considerando que você está deixando de faturar R$ 200k por ano, quanto você acredita que VALE um sistema que te entrega esse resultado?'" }
            ]
        },
        efeitoDomino: "[ERRO 13 - Pacto Fraco] -> [CONSEQUÊNCIA - Lead não se sente comprometido] -> [ERRO 19 - Ancoragem inexistente] -> [CONSEQUÊNCIA - Objeção de preço forte] -> VENDA PERDIDA",
        momentoExatoDaPerda: {
            timestamp: "45:30",
            oQueAconteceu: "Closer aceitou o 'preciso pensar' sem nenhum contorno, finalizando a chamada e perdendo o controle."
        },
        causaRaizDoErro: ['Falha técnica', 'Falta de treinamento específico'],
        estrategiaDeCorrecao: {
            focoImediato: "Treinar exaustivamente a Etapa 19 - Ancoragem Inicial (Valor x Preço).",
            proximaCall: "Não avançar para a apresentação do preço sem antes ter um SIM claro na pergunta de ancoragem de valor.",
            scriptSalvaVidas: "'Antes de falar de preço, me diz uma coisa... Quanto vale pra você resolver [problema principal]?'"
        }
    }
};

export const GENERIC_AVATAR_URL = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3e%3cpath fill-rule='evenodd' d='M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' clip-rule='evenodd' /%3e%3c/svg%3e";