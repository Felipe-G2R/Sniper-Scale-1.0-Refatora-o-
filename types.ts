// FIX: Added React import to resolve namespace error.
import React from 'react';

// FIX: Added 'relatorio-cirurgico-report' and 'baseline-indicacao-report' to the View union type and removed 'preparacao-fechamento-report'.
export type View = 'dashboard' | 'successful-call-report' | 'lost-call-report' | 'settings' | 'performance' | 'venda-realizada-report' | 'relatorio-cirurgico-report' | 'relatorio-segunda-call-report' | 'baseline-indicacao-report';
export type SettingsTab = 'empresa' | 'notificacoes' | 'sistema' | 'seguranca';
export type AuthView = 'login' | 'signup';

// User and Settings Types
export interface User {
  uid: string;
  name: string | null;
  email: string | null;
  avatarUrl: string;
  phone: string;
  // Dados da empresa
  company?: string;
  cnpj?: string;
  segment?: string;
  teamSize?: string;
  website?: string;
}

export interface Settings {
  theme: 'dark' | 'light' | 'system';
  reducedAnimations: boolean;
  compactSidebar: boolean;
  autoGainControl: boolean;
  noiseSuppression: boolean;
}

// FIX: Added missing 'Referral' type definition.
export interface Referral {
    name: string;
    contact?: string;
    context: string;
}

// CS Feedback type
export interface CSFeedback {
    summary: string;
    referralOpportunities: string;
}

interface BaseReportData {
  id: number;
  closerName: string;
  fileName: string;
  model: AnalysisModel;
}

export interface AnalysisStep {
  id: number;
  name: string;
  score: number;
  maxScore: number;
  status: 'Excelente' | 'Bom' | 'Revisar';
  description: string;
  specificAnalysis: string;
  justification: string;
  strengths: string[];
  opportunities: string[];
  benchmark: {
    average: number;
    top: number;
  }
}

export interface BehavioralProfile {
    identifiedProfile: string;
    adaptationAnalysis: string;
    personalizedRecommendations: string;
    recommendedPhrases?: string[];
}

export interface SuccessfulCallReportData extends BaseReportData {
  type: 'successful';
  totalScore: number;
  totalMaxScore: number;
  performanceSummary: string;
  criticalMoment: string;
  finalResult: string;
  steps: AnalysisStep[];
  behavioralIndicators: BehavioralIndicator[];
  behavioralProfile?: BehavioralProfile;
  csFeedback?: CSFeedback;
  referrals?: Referral[];
}

export interface BehavioralIndicator {
  name: string;
  description: string;
  score: number;
  status: 'Excelente' | 'Bom' | 'Consultivo' | 'Revisar' | 'Crítico' | 'Péssimo';
}

export interface ConversionDataPoint {
  name: string;
  conversao: number;
  meta: number;
}

export interface ResultsDistribution {
    name: string;
    value: number;
    color: string;
}

export interface DashboardStat {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    comparison?: string;
}

export interface CallsByDay {
    day: string;
    calls: number;
}

export interface AnalysisModel {
  // FIX: Added 'relatorio-cirurgico', 'baseline-indicacao' and removed 'preparacao-fechamento'.
  id: 'next-level' | 'call-perdida' | 'venda-realizada' | 'universal' | 'relatorio-cirurgico' | 'relatorio-segunda-call' | 'baseline-indicacao';
  title: string;
  description: string;
  tags: string[];
}

export interface AnaliseEstrategica {
    diagnosticoGeral: string;
    principaisTecnicasUtilizadas: string[];
    sinaisDeAlertaIdentificados: string[];
}


// --- START: New detailed types for the comprehensive Lost Call Report ---

export interface TabelaEtapa {
    etapa: number;
    nome: string;
    nota: number;
}

export interface JustificativaNotaDetalhada {
    nomeEtapa: string;
    nota: string; // "X/10"
    porqueDaTecnica: string;
    explicacaoEtapa: string;
    oQueFezBem: string;
    pontosDeMelhoria: string;
    comoEstevaoFaria: string;
    cenarioSugerido: string;
}

export interface PerfilComportamentalRelatorio {
    perfilDoCliente: ('DOMINANTE' | 'INFLUENTE' | 'ESTÁVEL' | 'ANALÍTICO')[];
    medosIdentificados: string[];
    frasesQueFuncionam: {
        dominante: string;
        influente: string;
        estavel: string;
        analitico: string;
    };
    estrategiaDeAbordagem: {
        dominante: string;
        influente: string;
        estavel: string;
        analitico: string;
    };
}

export interface AcertoIdentificado {
    nomeEtapa: string;
}

export interface CorrecaoErroDetalhada {
    nomeEtapa: string;
    porqueFoiErro: string;
    oQueEleFalou: string;
    buscarNaBase: string;
    comoEstevaoFaria: string;
    porqueEhImportante: string;
}

export interface IndicadoresComportamentaisRelatorio {
    perguntasEmocionaisRacionais: string;
    usoFrasesSuporte: string;
    controleCall: string;
    postura: string;
}

export interface ErroCritico8020 {
    etapa: string; // Ex: "ETAPA X"
    nota: string; // Ex: "Nota X/10"
    oQueAconteceu: string;
    porqueFoiFatal: string;
    timestamp: string;
    comoEstevaoFaria: string;
}

export interface AnaliseFinalDiagnostico {
    diagnostico8020: {
        padraoDosErros: {
            excelente: string; // "X etapas"
            bom: string;       // "X etapas"
            deficiente: string; // "X etapas"
            critico: string;   // "X etapas"
        };
        errosCriticos: ErroCritico8020[];
    };
    efeitoDomino: string;
    momentoExatoDaPerda: {
        timestamp: string;
        oQueAconteceu: string;
    };
    causaRaizDoErro: ('Falha técnica' | 'Nervosismo/insegurança' | 'Falta de treinamento específico' | 'Não leu sinais do prospect')[];
    estrategiaDeCorrecao: {
        focoImediato: string;
        proximaCall: string;
        scriptSalvaVidas: string;
    };
}

// --- END: New detailed types ---


// Types for Lost Call Report (REFORMULADO) -> This is the new structure
export interface LostCallReportData extends BaseReportData {
  type: 'lost';
  totalScore: number;
  totalMaxScore: number; // Will be 250
  nomeCloser: string; // From the document header
  
  // New detailed structure based on the document
  pontuacaoPorEtapa: TabelaEtapa[];
  justificativaDetalhada: JustificativaNotaDetalhada[];
  perfilComportamental: PerfilComportamentalRelatorio;
  acertosIdentificados: AcertoIdentificado[];
  errosParaCorrecao: CorrecaoErroDetalhada[];
  indicadoresComportamentais: IndicadoresComportamentaisRelatorio;
  analiseFinal: AnaliseFinalDiagnostico;
  behavioralProfile?: BehavioralProfile;
  csFeedback?: CSFeedback;
  referrals?: Referral[];
}



// Types for Venda Realizada Report (3-Block)
export interface PositivePointDetail {
    etapa: string;
    oQueEleFalou: string;
    // FIX: Corrected typo from comoLeadReagu to comoLeadReagiu to match schema and usage.
    comoLeadReagiu: string;
    porqueFuncionou: string;
    referenciaEstevao: string;
}

export interface ConstructiveCriticismDetail {
    trechoCloser: string;
    respostaLead: string;
    erro: string;
    comoEstevaoFaria: string;
    impacto: string;
}

export interface FinalElogioDetail {
    reforcarPontos: string;
    mostrar8020: string;
    focosDeTreino: string;
    elogioPesado: string;
}

export interface VendaRealizadaReportData extends BaseReportData {
  type: 'venda-realizada';
  totalScore: number;
  totalMaxScore: number;
  pontosPositivos: {
      descricao: string;
      detalhes: PositivePointDetail[];
  };
  criticaConstrutiva: {
      descricao: string;
      detalhes: ConstructiveCriticismDetail[];
  };
  elogioFinal: {
      descricao: string;
      detalhes: FinalElogioDetail;
  };
  steps: AnalysisStep[];
  behavioralProfile?: BehavioralProfile;
}

// --- START: NEW Relatório Cirúrgico Types ---
export interface DadosBasicosCirurgico {
    dataDaCall: string;
    nomeDoCloser: string;
    lead: string;
    duracao: string;
    status: string;
}

export interface PerfilComportamentalCirurgico {
    identificacaoPrimaria: 'DOMINANTE' | 'INFLUENTE' | 'ESTÁVEL' | 'ANALÍTICO' | 'Híbrido';
    sinaisIdentificados: {
        linguagemUsada: {
            palavrasFrequentes: string;
            tomDeVoz: string;
            velocidadeDeResposta: string;
        };
        comportamentosObservados: {
            respostasLongasCurtas: string;
            interrupcoes: string;
            perguntasFeitas: string;
            nivelDeEnergia: string;
        };
    };
    perfilHibrido?: string;
    frasesDeConexaoRecomendadas?: string[];
}

export interface EstrategiaPorPerfil {
    foqueEm: string[];
    eviteEnfatizar: string;
}

export interface DiagnosticoSpinCompleto {
    situacaoAtual: {
        faturamentoAtual: string;
        estruturaClinica: string;
        canaisCaptacao: string;
        margemLucro: string;
    };
    problemasIdentificados: {
        dorPrincipal: string;
        dorSecundaria: string;
        dorTerciaria: string;
        tempoComProblemas: string;
        tentativasAnteriores: string;
    };
    implicacaoEmocional: {
        comoSeSente: string;
        impactosVidaPessoal: string;
        medosReais: string;
        oQuePodeAcontecer: string;
    };
    necessidadeSolucao: {
        objetivoEspecifico: string;
        prazoDesejado: string;
        motivacao: string;
        disposicao: string;
        nivelPrioridade: string;
        acreditaResolver90dias: boolean;
    };
}

export interface NarrativasPessoais {
    trajetoriaProfissional: {
        comoChegouEstetica: string;
        momentosMarcantes: string;
        maiorFrustracao: string;
        maiorConquista: string;
    };
    contextoPessoal: {
        familia: string;
        sonhosAspiracoes: string;
        estiloVidaAtual: string;
        oQueMudaria: string;
    };
}

export interface GatilhosEmocionais {
    motivacoesProfundas: {
        oQueRealmenteQuer: string;
        porQueFaturamento: string;
        comoSeSentiria: string;
        statusReconhecimento: string;
    };
    medosDoresEmocionais: {
        maiorMedoProfissional: string;
        medoContinuarEstagnado: string;
        impactoAutoestima: string;
        comparacaoConcorrentes: string;
    };
    palavrasGatilhoEspecificas: string[];
}

export interface MapeamentoFinanceiro {
    situacaoAtualFinanceira: {
        rendaLiquida: string;
        reservaEmergencia: string;
        investimentosAtuais: string;
    };
    mentalidadeInvestimento: {
        experienciasAnteriores: string;
        maiorInvestimento: string;
        comoEnxergaROI: string;
    };
}

export interface ObjecoesAntecipadas {
    financeirasProvaveis: {
        objecoes: string[];
        estrategiaContorno: string;
    };
    credibilidadeProvaveis: {
        objecoes: string[];
        estrategiaContorno: string;
    };
}

export interface EstrategiaFechamento {
    abordagemInicial: string;
    argumentosPrincipais: string[];
    casesDeSucessoEstrategicos: {
        casePrincipal: string;
        porQueCase: string;
        conexaoSituacao: string;
    };
    ancoragemValorEspecifica: {
        calculoOportunidadePerdida: string;
        roiPersonalizado: string;
    };
    fechamentoPorPerfil: {
        seDominante: string;
        seInfluente: string;
        seEstavel: string;
        seAnalitico: string;
    };
}

export interface PlanoSegundaCall {
    conexao: string[];
    apresentacaoDirecionada: string[];
    ancoragemPersonalizada: string[];
    fechamento: string[];
}

export interface AnaliseSegundaCall {
    pontuacaoAderencia: number; // 0-100
    acertos: string[];
    melhorias: string[];
    feedbackGeral: string;
}

export interface RelatorioCirurgicoData extends BaseReportData {
    type: 'relatorio-cirurgico';
    dadosBasicos: DadosBasicosCirurgico;
    perfilComportamental: PerfilComportamentalCirurgico;
    focoEntregaveis: string[];
    estrategiaPorPerfil: {
        dominante: EstrategiaPorPerfil;
        influente: EstrategiaPorPerfil;
        estavel: EstrategiaPorPerfil;
        analitico: EstrategiaPorPerfil;
    };
    diagnosticoSpin: DiagnosticoSpinCompleto;
    narrativasPessoais: NarrativasPessoais;
    gatilhosEmocionais: GatilhosEmocionais;
    mapeamentoFinanceiro: MapeamentoFinanceiro;
    objecoesAntecipadas: ObjecoesAntecipadas;
    estrategiaFechamento: EstrategiaFechamento;
    planoSegundaCall: PlanoSegundaCall;
    checklistPreCall: string[];
    lembreteFinal: string;
    analiseSegundaCall?: AnaliseSegundaCall;
}
// --- END: NEW Relatório Cirúrgico Types ---


// --- START: NEW Dossiê Estratégico (Segunda Call) Types ---
export interface Ato1Briefing {
    resumoExecutivo: {
        contexto: string;
        doresDeclaradas: string;
        impactoReal: string;
        desejoCentral: string;
        pontoDeMaiorInteresse: string;
        realMotivoDaCompra: string;
    };
    analisePsicologica: {
        perfilComportamental: string;
        comoSeComunicar: string;
    };
    palavrasEFrasesDeConexao: string[];
}

export interface EtapaPlanoDeAcao {
    titulo: string;
    objetivo: string;
    referenciaParaEstudo: string;
    script: string;
}

export interface Ato2PlanoDeAcao {
    etapas: EtapaPlanoDeAcao[];
}

export interface Ato3ProtocolosAvancados {
    planoDeContencaoDeObjecoes: {
        objecaoAntecipada: string;
        protocoloDeResposta: string;
    };
    taticaPsicologicaRecomendada: {
        armaSugerida: string;
        gatilhoParaUso: string;
    };
    referenciasDoArsenal: {
        tecnicasDeFechamento: string;
        estruturaEScripts: string;
        psicologiaDaComunicacao: string;
        validacaoDaQualidade: string;
    };
}

export interface RelatorioSegundaCallData extends BaseReportData {
    type: 'relatorio-segunda-call';
    cliente: string;
    dataDaAnalise: string;
    ato1_briefing: Ato1Briefing;
    ato2_planoDeAcao: Ato2PlanoDeAcao;
    ato3_protocolosAvancados: Ato3ProtocolosAvancados;
}
// --- END: NEW Dossiê Estratégico (Segunda Call) Types ---

// --- START: NEW Baseline para Indicação Types ---
export interface InformacoesCliente {
    nomeCompleto: string;
    dataVenda: string;
    produtoServico: string;
    valorInvestimento: number;
    closerResponsavel: string;
}

export interface DorQuantificada {
    descricao: string;
    nota: number;
}

export interface ImpactosVida {
    trabalhoProdutividade: number;
    relacionamentos: number;
    saudeEnergia: number;
    financeiro: number;
    qualidadeDeVidaGeral: number;
}

export interface Dores {
    principal: DorQuantificada;
    secundario: DorQuantificada;
    terciario: DorQuantificada;
    impactos: ImpactosVida;
    frequencia: 'Diário' | 'Semanal' | 'Mensal' | 'Esporádico';
    tempoEnfrentando: string;
}

export interface SituacaoAtual {
    faturamento: number;
    resultado: string;
    metricaPrincipal: string;
    outrasMetricas: string[];
}

export interface Expectativas {
    principal: string;
    listaDesejos: string[];
    metaNumericaDeclarada: {
        ondeQuerChegar: number;
        emQuantoTempo: string;
        resultadoEsperado: string;
    };
    transformacaoEsperada: string;
}

export interface ContextoEmocional {
    sentimentoDominante: string;
    palavrasChave: string[];
    consequenciaSeNaoResolver: string;
}

export interface TentativaAnterior {
    solucaoMetodo: string;
    investimento: number;
    tempo: string;
    resultado: string;
    porQueNaoFuncionou: string;
}

export interface TentativasAnteriores {
    jaTentou: boolean;
    detalhes?: TentativaAnterior;
    principalObjecaoAtual: string;
}

export interface Promessa {
    promessaEspecifica: string;
    agendamentoRetorno: {
        data: string;
        frameUsado: string;
        clienteAceitou: boolean;
        lembreteProgramado: string;
    };
}

export interface PerfilIndicacao {
    contextoProfissional: {
        profissao: string;
        nicho: string;
        tempoExperiencia: string;
        comunidade: {
            fazParte: boolean;
            qual: string;
        };
    };
    estiloRelacionamento: 'Muito conectado' | 'Seletivo' | 'Influente no nicho' | 'Discreto/reservado' | 'Empreendedor ativo';
    tomadaDecisao: {
        comoDecide: 'Sozinho' | 'Com cônjuge' | 'Com sócios' | 'Com equipe/conselho';
        nomesDecisores: string;
    };
    potencial: 'Alto' | 'Médio' | 'Baixo';
}

export interface ObservacoesEstrategicas {
    insightsCloser: string;
    frasesMarcantes: string[];
    gatilhosEmocionais: string[];
    objecoesVencidas: string[];
}

export interface BaselineIndicacaoReportData extends BaseReportData {
    type: 'baseline-indicacao';
    informacoesCliente: InformacoesCliente;
    doresQuantificadas: Dores;
    situacaoAtual: SituacaoAtual;
    expectativasDesejos: Expectativas;
    contextoEmocional: ContextoEmocional;
    tentativasAnteriores: TentativasAnteriores;
    promessaCompromisso: Promessa;
    perfilParaIndicacao: PerfilIndicacao;
    observacoesEstrategicas: ObservacoesEstrategicas;
}
// --- END: NEW Baseline para Indicação Types ---


// FIX: Added union type for all possible analysis results.
export type AnalysisResult = SuccessfulCallReportData | LostCallReportData | VendaRealizadaReportData | RelatorioSegundaCallData | RelatorioCirurgicoData | BaselineIndicacaoReportData;

// FIX: Added definition for DashboardMetrics.
export interface DashboardMetrics {
  stats: DashboardStat[];
  resultsDistribution: ResultsDistribution[];
  conversionHistory: { name: string; conversao: number; }[];
  recentCallsData: { name: string; score: number; }[];
  totalCalls: number;
}


// FIX: Added definitions for context state management.
// Context related types
export interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error';
}

export interface ConfirmationModalState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
}

export interface AnalysisState {
  user: User | null;
  settings: Settings;
  currentView: View;
  analysisResult: AnalysisResult | null;
  analysisHistory: AnalysisResult[];
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  notification: Notification | null;
  confirmationModal: ConfirmationModalState;
  isAuthenticated: boolean;
  authView: AuthView;
  isAuthLoading: boolean;
  startDate: string | null;
  endDate: string | null;
}

export type AnalysisAction =
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_AUTH_VIEW'; payload: AuthView }
  | { type: 'NAVIGATE'; payload: View }
  | { type: 'SET_IS_MODAL_OPEN'; payload: boolean }
  | { type: 'ACTION_STARTED' }
  | { type: 'ANALYSIS_SUCCESS'; payload: AnalysisResult }
  | { type: 'ACTION_FAILURE'; payload: string }
  | { type: 'SET_NOTIFICATION'; payload: Notification | null }
  | { type: 'REVIEW_ANALYSIS'; payload: number }
  | { type: 'LOAD_HISTORY_SUCCESS'; payload: AnalysisResult[] }
  | { type: 'SHOW_CONFIRMATION'; payload: Omit<ConfirmationModalState, 'isOpen'> }
  | { type: 'HIDE_CONFIRMATION' }
  | { type: 'UPDATE_USER_INFO'; payload: Partial<User> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'ANALYSIS_SECOND_CALL_SUCCESS'; payload: { reportId: number; analysisData: AnaliseSegundaCall } }
  | { type: 'SET_DATE_FILTER'; payload: { startDate: string | null, endDate: string | null } };