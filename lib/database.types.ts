/**
 * Tipos gerados para o banco de dados Supabase
 * Sniper Scale Analytics
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type AnalysisType =
    | 'successful'
    | 'lost'
    | 'venda-realizada'
    | 'relatorio-cirurgico'
    | 'relatorio-segunda-call'
    | 'baseline-indicacao';

export type AnalysisModelId =
    | 'next-level'
    | 'call-perdida'
    | 'venda-realizada'
    | 'universal'
    | 'relatorio-cirurgico'
    | 'relatorio-segunda-call'
    | 'baseline-indicacao';

export type StepStatus = 'Excelente' | 'Bom' | 'Revisar';

export type BehavioralProfileType =
    | 'DOMINANTE'
    | 'INFLUENTE'
    | 'ESTÁVEL'
    | 'ANALÍTICO'
    | 'Híbrido';

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    firebase_uid: string | null;
                    email: string;
                    name: string | null;
                    avatar_url: string | null;
                    phone: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    firebase_uid?: string | null;
                    email: string;
                    name?: string | null;
                    avatar_url?: string | null;
                    phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    firebase_uid?: string | null;
                    email?: string;
                    name?: string | null;
                    avatar_url?: string | null;
                    phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            user_settings: {
                Row: {
                    id: string;
                    user_id: string;
                    theme: 'dark' | 'light' | 'system';
                    reduced_animations: boolean;
                    compact_sidebar: boolean;
                    auto_gain_control: boolean;
                    noise_suppression: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    theme?: 'dark' | 'light' | 'system';
                    reduced_animations?: boolean;
                    compact_sidebar?: boolean;
                    auto_gain_control?: boolean;
                    noise_suppression?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    theme?: 'dark' | 'light' | 'system';
                    reduced_animations?: boolean;
                    compact_sidebar?: boolean;
                    auto_gain_control?: boolean;
                    noise_suppression?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            analyses: {
                Row: {
                    id: string;
                    legacy_id: number;
                    user_id: string | null;
                    type: AnalysisType;
                    model_id: AnalysisModelId;
                    model_title: string;
                    model_description: string | null;
                    model_tags: string[];
                    file_name: string;
                    closer_name: string | null;
                    total_score: number | null;
                    total_max_score: number | null;
                    raw_data: Json;
                    behavioral_profile: Json | null;
                    cs_feedback: Json | null;
                    referrals: Json;
                    second_call_analysis: Json | null;
                    is_deleted: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    legacy_id?: number;
                    user_id?: string | null;
                    type: AnalysisType;
                    model_id: AnalysisModelId;
                    model_title: string;
                    model_description?: string | null;
                    model_tags?: string[];
                    file_name: string;
                    closer_name?: string | null;
                    total_score?: number | null;
                    total_max_score?: number | null;
                    raw_data: Json;
                    behavioral_profile?: Json | null;
                    cs_feedback?: Json | null;
                    referrals?: Json;
                    second_call_analysis?: Json | null;
                    is_deleted?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    legacy_id?: number;
                    user_id?: string | null;
                    type?: AnalysisType;
                    model_id?: AnalysisModelId;
                    model_title?: string;
                    model_description?: string | null;
                    model_tags?: string[];
                    file_name?: string;
                    closer_name?: string | null;
                    total_score?: number | null;
                    total_max_score?: number | null;
                    raw_data?: Json;
                    behavioral_profile?: Json | null;
                    cs_feedback?: Json | null;
                    referrals?: Json;
                    second_call_analysis?: Json | null;
                    is_deleted?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            analysis_steps: {
                Row: {
                    id: string;
                    analysis_id: string;
                    step_number: number;
                    name: string;
                    score: number;
                    max_score: number;
                    status: StepStatus | null;
                    description: string | null;
                    specific_analysis: string | null;
                    justification: string | null;
                    strengths: string[];
                    opportunities: string[];
                    benchmark_average: number | null;
                    benchmark_top: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    analysis_id: string;
                    step_number: number;
                    name: string;
                    score: number;
                    max_score?: number;
                    status?: StepStatus | null;
                    description?: string | null;
                    specific_analysis?: string | null;
                    justification?: string | null;
                    strengths?: string[];
                    opportunities?: string[];
                    benchmark_average?: number | null;
                    benchmark_top?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    analysis_id?: string;
                    step_number?: number;
                    name?: string;
                    score?: number;
                    max_score?: number;
                    status?: StepStatus | null;
                    description?: string | null;
                    specific_analysis?: string | null;
                    justification?: string | null;
                    strengths?: string[];
                    opportunities?: string[];
                    benchmark_average?: number | null;
                    benchmark_top?: number | null;
                    created_at?: string;
                };
            };
            behavioral_indicators: {
                Row: {
                    id: string;
                    analysis_id: string;
                    name: string;
                    description: string | null;
                    score: number | null;
                    status: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    analysis_id: string;
                    name: string;
                    description?: string | null;
                    score?: number | null;
                    status?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    analysis_id?: string;
                    name?: string;
                    description?: string | null;
                    score?: number | null;
                    status?: string | null;
                    created_at?: string;
                };
            };
            analysis_referrals: {
                Row: {
                    id: string;
                    analysis_id: string;
                    name: string;
                    contact: string | null;
                    context: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    analysis_id: string;
                    name: string;
                    contact?: string | null;
                    context?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    analysis_id?: string;
                    name?: string;
                    contact?: string | null;
                    context?: string | null;
                    created_at?: string;
                };
            };
            lost_call_details: {
                Row: {
                    id: string;
                    analysis_id: string;
                    pontuacao_por_etapa: Json;
                    justificativa_detalhada: Json;
                    perfil_comportamental: Json | null;
                    acertos_identificados: Json;
                    erros_para_correcao: Json;
                    indicadores_comportamentais: Json | null;
                    analise_final: Json | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    analysis_id: string;
                    pontuacao_por_etapa?: Json;
                    justificativa_detalhada?: Json;
                    perfil_comportamental?: Json | null;
                    acertos_identificados?: Json;
                    erros_para_correcao?: Json;
                    indicadores_comportamentais?: Json | null;
                    analise_final?: Json | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    analysis_id?: string;
                    pontuacao_por_etapa?: Json;
                    justificativa_detalhada?: Json;
                    perfil_comportamental?: Json | null;
                    acertos_identificados?: Json;
                    erros_para_correcao?: Json;
                    indicadores_comportamentais?: Json | null;
                    analise_final?: Json | null;
                    created_at?: string;
                };
            };
            venda_realizada_details: {
                Row: {
                    id: string;
                    analysis_id: string;
                    pontos_positivos: Json | null;
                    critica_construtiva: Json | null;
                    elogio_final: Json | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    analysis_id: string;
                    pontos_positivos?: Json | null;
                    critica_construtiva?: Json | null;
                    elogio_final?: Json | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    analysis_id?: string;
                    pontos_positivos?: Json | null;
                    critica_construtiva?: Json | null;
                    elogio_final?: Json | null;
                    created_at?: string;
                };
            };
            relatorio_cirurgico_details: {
                Row: {
                    id: string;
                    analysis_id: string;
                    data_da_call: string | null;
                    lead_name: string | null;
                    duracao: string | null;
                    status: string | null;
                    identificacao_primaria: BehavioralProfileType | null;
                    sinais_identificados: Json | null;
                    perfil_hibrido: string | null;
                    frases_conexao_recomendadas: string[];
                    foco_entregaveis: string[];
                    estrategia_por_perfil: Json | null;
                    diagnostico_spin: Json | null;
                    narrativas_pessoais: Json | null;
                    gatilhos_emocionais: Json | null;
                    mapeamento_financeiro: Json | null;
                    objecoes_antecipadas: Json | null;
                    estrategia_fechamento: Json | null;
                    plano_segunda_call: Json | null;
                    checklist_pre_call: string[];
                    lembrete_final: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    analysis_id: string;
                    data_da_call?: string | null;
                    lead_name?: string | null;
                    duracao?: string | null;
                    status?: string | null;
                    identificacao_primaria?: BehavioralProfileType | null;
                    sinais_identificados?: Json | null;
                    perfil_hibrido?: string | null;
                    frases_conexao_recomendadas?: string[];
                    foco_entregaveis?: string[];
                    estrategia_por_perfil?: Json | null;
                    diagnostico_spin?: Json | null;
                    narrativas_pessoais?: Json | null;
                    gatilhos_emocionais?: Json | null;
                    mapeamento_financeiro?: Json | null;
                    objecoes_antecipadas?: Json | null;
                    estrategia_fechamento?: Json | null;
                    plano_segunda_call?: Json | null;
                    checklist_pre_call?: string[];
                    lembrete_final?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    analysis_id?: string;
                    data_da_call?: string | null;
                    lead_name?: string | null;
                    duracao?: string | null;
                    status?: string | null;
                    identificacao_primaria?: BehavioralProfileType | null;
                    sinais_identificados?: Json | null;
                    perfil_hibrido?: string | null;
                    frases_conexao_recomendadas?: string[];
                    foco_entregaveis?: string[];
                    estrategia_por_perfil?: Json | null;
                    diagnostico_spin?: Json | null;
                    narrativas_pessoais?: Json | null;
                    gatilhos_emocionais?: Json | null;
                    mapeamento_financeiro?: Json | null;
                    objecoes_antecipadas?: Json | null;
                    estrategia_fechamento?: Json | null;
                    plano_segunda_call?: Json | null;
                    checklist_pre_call?: string[];
                    lembrete_final?: string | null;
                    created_at?: string;
                };
            };
            relatorio_segunda_call_details: {
                Row: {
                    id: string;
                    analysis_id: string;
                    cliente: string | null;
                    data_da_analise: string | null;
                    ato1_briefing: Json | null;
                    ato2_plano_de_acao: Json | null;
                    ato3_protocolos_avancados: Json | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    analysis_id: string;
                    cliente?: string | null;
                    data_da_analise?: string | null;
                    ato1_briefing?: Json | null;
                    ato2_plano_de_acao?: Json | null;
                    ato3_protocolos_avancados?: Json | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    analysis_id?: string;
                    cliente?: string | null;
                    data_da_analise?: string | null;
                    ato1_briefing?: Json | null;
                    ato2_plano_de_acao?: Json | null;
                    ato3_protocolos_avancados?: Json | null;
                    created_at?: string;
                };
            };
            baseline_indicacao_details: {
                Row: {
                    id: string;
                    analysis_id: string;
                    informacoes_cliente: Json | null;
                    dores_quantificadas: Json | null;
                    situacao_atual: Json | null;
                    expectativas_desejos: Json | null;
                    contexto_emocional: Json | null;
                    tentativas_anteriores: Json | null;
                    promessa_compromisso: Json | null;
                    perfil_para_indicacao: Json | null;
                    observacoes_estrategicas: Json | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    analysis_id: string;
                    informacoes_cliente?: Json | null;
                    dores_quantificadas?: Json | null;
                    situacao_atual?: Json | null;
                    expectativas_desejos?: Json | null;
                    contexto_emocional?: Json | null;
                    tentativas_anteriores?: Json | null;
                    promessa_compromisso?: Json | null;
                    perfil_para_indicacao?: Json | null;
                    observacoes_estrategicas?: Json | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    analysis_id?: string;
                    informacoes_cliente?: Json | null;
                    dores_quantificadas?: Json | null;
                    situacao_atual?: Json | null;
                    expectativas_desejos?: Json | null;
                    contexto_emocional?: Json | null;
                    tentativas_anteriores?: Json | null;
                    promessa_compromisso?: Json | null;
                    perfil_para_indicacao?: Json | null;
                    observacoes_estrategicas?: Json | null;
                    created_at?: string;
                };
            };
        };
        Views: {
            v_analyses_summary: {
                Row: {
                    id: string;
                    legacy_id: number;
                    user_id: string | null;
                    type: AnalysisType;
                    model_id: AnalysisModelId;
                    model_title: string;
                    file_name: string;
                    closer_name: string | null;
                    total_score: number | null;
                    total_max_score: number | null;
                    score_percentage: number;
                    created_at: string;
                    is_deleted: boolean;
                    result_category: string;
                };
            };
            v_conversion_metrics: {
                Row: {
                    user_id: string | null;
                    date: string;
                    total_calls: number;
                    successful_calls: number;
                    lost_calls: number;
                    conversion_rate: number;
                };
            };
        };
        Functions: {
            soft_delete_analysis: {
                Args: { analysis_uuid: string };
                Returns: boolean;
            };
            restore_analysis: {
                Args: { analysis_uuid: string };
                Returns: boolean;
            };
            insert_analysis: {
                Args: {
                    p_user_id: string | null;
                    p_type: AnalysisType;
                    p_model_id: AnalysisModelId;
                    p_model_title: string;
                    p_model_description: string | null;
                    p_model_tags: string[];
                    p_file_name: string;
                    p_closer_name: string | null;
                    p_total_score: number | null;
                    p_total_max_score: number | null;
                    p_raw_data: Json;
                    p_behavioral_profile?: Json | null;
                    p_cs_feedback?: Json | null;
                    p_referrals?: Json;
                };
                Returns: string;
            };
            get_analyses_filtered: {
                Args: {
                    p_user_id?: string | null;
                    p_type?: AnalysisType | null;
                    p_start_date?: string | null;
                    p_end_date?: string | null;
                    p_closer_name?: string | null;
                    p_limit?: number;
                    p_offset?: number;
                };
                Returns: {
                    id: string;
                    legacy_id: number;
                    type: AnalysisType;
                    model_id: AnalysisModelId;
                    model_title: string;
                    file_name: string;
                    closer_name: string | null;
                    total_score: number | null;
                    total_max_score: number | null;
                    score_percentage: number;
                    created_at: string;
                    raw_data: Json;
                }[];
            };
            update_second_call_analysis: {
                Args: {
                    p_analysis_id: string;
                    p_second_call_data: Json;
                };
                Returns: boolean;
            };
        };
        Enums: {
            analysis_type: AnalysisType;
            analysis_model_id: AnalysisModelId;
            step_status: StepStatus;
            behavioral_profile_type: BehavioralProfileType;
        };
    };
}
