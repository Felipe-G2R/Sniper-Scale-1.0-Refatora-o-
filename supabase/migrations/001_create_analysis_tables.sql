-- ============================================================================
-- SNIPER SCALE ANALYTICS - ESQUEMA SQL COMPLETO
-- Versão: 1.0.0
-- Descrição: Esquema robusto para persistência de análises de calls
-- Compatível com: Supabase (PostgreSQL 15+)
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca por texto

-- ============================================================================
-- TABELA: users (Usuários do Sistema)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid TEXT UNIQUE, -- Para compatibilidade com Firebase Auth se necessário
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON public.users(firebase_uid);

-- ============================================================================
-- TABELA: user_settings (Configurações do Usuário)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
    reduced_animations BOOLEAN DEFAULT FALSE,
    compact_sidebar BOOLEAN DEFAULT FALSE,
    auto_gain_control BOOLEAN DEFAULT TRUE,
    noise_suppression BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- TIPO ENUM: Tipos de Análise
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE analysis_type AS ENUM (
        'successful',
        'lost',
        'venda-realizada',
        'relatorio-cirurgico',
        'relatorio-segunda-call',
        'baseline-indicacao'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TIPO ENUM: Modelo de Análise
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE analysis_model_id AS ENUM (
        'next-level',
        'call-perdida',
        'venda-realizada',
        'universal',
        'relatorio-cirurgico',
        'relatorio-segunda-call',
        'baseline-indicacao'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TIPO ENUM: Status de Etapa
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE step_status AS ENUM ('Excelente', 'Bom', 'Revisar');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TIPO ENUM: Perfil Comportamental
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE behavioral_profile_type AS ENUM (
        'DOMINANTE',
        'INFLUENTE',
        'ESTÁVEL',
        'ANALÍTICO',
        'Híbrido'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TABELA PRINCIPAL: analyses (Todas as Análises)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identificador numérico legado (compatibilidade com frontend)
    legacy_id BIGINT UNIQUE DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,

    -- Relacionamentos
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

    -- Metadados básicos
    type analysis_type NOT NULL,
    model_id analysis_model_id NOT NULL,
    model_title TEXT NOT NULL,
    model_description TEXT,
    model_tags TEXT[] DEFAULT '{}',

    -- Dados comuns a todas as análises
    file_name TEXT NOT NULL,
    closer_name TEXT,

    -- Pontuação (para tipos que usam)
    total_score NUMERIC(10,2),
    total_max_score NUMERIC(10,2) DEFAULT 250,

    -- Dados específicos em JSONB (flexibilidade máxima)
    raw_data JSONB NOT NULL DEFAULT '{}',

    -- Perfil comportamental (comum a vários tipos)
    behavioral_profile JSONB,

    -- CS Feedback (comum a vários tipos)
    cs_feedback JSONB,

    -- Indicações/Referrals
    referrals JSONB DEFAULT '[]',

    -- Controle
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Análise de segunda call (para relatorio-cirurgico)
    second_call_analysis JSONB
);

-- Índices para analyses
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_type ON public.analyses(type);
CREATE INDEX IF NOT EXISTS idx_analyses_model_id ON public.analyses(model_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_closer_name ON public.analyses(closer_name);
CREATE INDEX IF NOT EXISTS idx_analyses_legacy_id ON public.analyses(legacy_id);
CREATE INDEX IF NOT EXISTS idx_analyses_not_deleted ON public.analyses(is_deleted) WHERE is_deleted = FALSE;

-- Índice GIN para busca em JSONB
CREATE INDEX IF NOT EXISTS idx_analyses_raw_data ON public.analyses USING GIN (raw_data);

-- ============================================================================
-- TABELA: analysis_steps (Etapas das Análises - para tipos com 25 etapas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analysis_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,

    step_number INTEGER NOT NULL CHECK (step_number >= 1 AND step_number <= 25),
    name TEXT NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) DEFAULT 10,
    status step_status,
    description TEXT,
    specific_analysis TEXT,
    justification TEXT,
    strengths TEXT[] DEFAULT '{}',
    opportunities TEXT[] DEFAULT '{}',
    benchmark_average NUMERIC(5,2),
    benchmark_top NUMERIC(5,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(analysis_id, step_number)
);

-- Índices para analysis_steps
CREATE INDEX IF NOT EXISTS idx_analysis_steps_analysis_id ON public.analysis_steps(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_steps_step_number ON public.analysis_steps(step_number);

-- ============================================================================
-- TABELA: behavioral_indicators (Indicadores Comportamentais)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.behavioral_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,
    score NUMERIC(5,2),
    status TEXT CHECK (status IN ('Excelente', 'Bom', 'Consultivo', 'Revisar', 'Crítico', 'Péssimo')),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para behavioral_indicators
CREATE INDEX IF NOT EXISTS idx_behavioral_indicators_analysis_id ON public.behavioral_indicators(analysis_id);

-- ============================================================================
-- TABELA: analysis_referrals (Indicações Coletadas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analysis_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    contact TEXT,
    context TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para analysis_referrals
CREATE INDEX IF NOT EXISTS idx_analysis_referrals_analysis_id ON public.analysis_referrals(analysis_id);

-- ============================================================================
-- TABELA: lost_call_details (Detalhes específicos de Call Perdida)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lost_call_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE UNIQUE,

    -- Pontuação por etapa
    pontuacao_por_etapa JSONB DEFAULT '[]',

    -- Justificativas detalhadas
    justificativa_detalhada JSONB DEFAULT '[]',

    -- Perfil comportamental do relatório
    perfil_comportamental JSONB,

    -- Acertos e erros
    acertos_identificados JSONB DEFAULT '[]',
    erros_para_correcao JSONB DEFAULT '[]',

    -- Indicadores comportamentais do relatório
    indicadores_comportamentais JSONB,

    -- Análise final
    analise_final JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para lost_call_details
CREATE INDEX IF NOT EXISTS idx_lost_call_details_analysis_id ON public.lost_call_details(analysis_id);

-- ============================================================================
-- TABELA: venda_realizada_details (Detalhes específicos de Venda Realizada)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.venda_realizada_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE UNIQUE,

    -- Pontos positivos
    pontos_positivos JSONB,

    -- Crítica construtiva
    critica_construtiva JSONB,

    -- Elogio final
    elogio_final JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para venda_realizada_details
CREATE INDEX IF NOT EXISTS idx_venda_realizada_details_analysis_id ON public.venda_realizada_details(analysis_id);

-- ============================================================================
-- TABELA: relatorio_cirurgico_details (Detalhes do Relatório Cirúrgico)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.relatorio_cirurgico_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE UNIQUE,

    -- Dados básicos
    data_da_call DATE,
    lead_name TEXT,
    duracao TEXT,
    status TEXT,

    -- Perfil comportamental
    identificacao_primaria behavioral_profile_type,
    sinais_identificados JSONB,
    perfil_hibrido TEXT,
    frases_conexao_recomendadas TEXT[] DEFAULT '{}',

    -- Foco e estratégias
    foco_entregaveis TEXT[] DEFAULT '{}',
    estrategia_por_perfil JSONB,

    -- Diagnóstico SPIN
    diagnostico_spin JSONB,

    -- Narrativas pessoais
    narrativas_pessoais JSONB,

    -- Gatilhos emocionais
    gatilhos_emocionais JSONB,

    -- Mapeamento financeiro
    mapeamento_financeiro JSONB,

    -- Objeções antecipadas
    objecoes_antecipadas JSONB,

    -- Estratégia de fechamento
    estrategia_fechamento JSONB,

    -- Plano segunda call
    plano_segunda_call JSONB,

    -- Checklist e lembrete
    checklist_pre_call TEXT[] DEFAULT '{}',
    lembrete_final TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para relatorio_cirurgico_details
CREATE INDEX IF NOT EXISTS idx_relatorio_cirurgico_details_analysis_id ON public.relatorio_cirurgico_details(analysis_id);

-- ============================================================================
-- TABELA: relatorio_segunda_call_details (Dossiê Segunda Call)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.relatorio_segunda_call_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE UNIQUE,

    cliente TEXT,
    data_da_analise DATE,

    -- Ato 1 - Briefing
    ato1_briefing JSONB,

    -- Ato 2 - Plano de Ação
    ato2_plano_de_acao JSONB,

    -- Ato 3 - Protocolos Avançados
    ato3_protocolos_avancados JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para relatorio_segunda_call_details
CREATE INDEX IF NOT EXISTS idx_relatorio_segunda_call_details_analysis_id ON public.relatorio_segunda_call_details(analysis_id);

-- ============================================================================
-- TABELA: baseline_indicacao_details (Baseline para Indicação)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.baseline_indicacao_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE UNIQUE,

    -- Informações do cliente
    informacoes_cliente JSONB,

    -- Dores quantificadas
    dores_quantificadas JSONB,

    -- Situação atual
    situacao_atual JSONB,

    -- Expectativas e desejos
    expectativas_desejos JSONB,

    -- Contexto emocional
    contexto_emocional JSONB,

    -- Tentativas anteriores
    tentativas_anteriores JSONB,

    -- Promessa e compromisso
    promessa_compromisso JSONB,

    -- Perfil para indicação
    perfil_para_indicacao JSONB,

    -- Observações estratégicas
    observacoes_estrategicas JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para baseline_indicacao_details
CREATE INDEX IF NOT EXISTS idx_baseline_indicacao_details_analysis_id ON public.baseline_indicacao_details(analysis_id);

-- ============================================================================
-- VIEW: v_analyses_summary (Resumo das Análises para Dashboard)
-- ============================================================================
CREATE OR REPLACE VIEW public.v_analyses_summary AS
SELECT
    a.id,
    a.legacy_id,
    a.user_id,
    a.type,
    a.model_id,
    a.model_title,
    a.file_name,
    a.closer_name,
    a.total_score,
    a.total_max_score,
    CASE
        WHEN a.total_max_score > 0 THEN ROUND((a.total_score / a.total_max_score) * 100, 1)
        ELSE 0
    END as score_percentage,
    a.created_at,
    a.is_deleted,
    CASE
        WHEN a.type IN ('successful', 'venda-realizada') THEN 'success'
        WHEN a.type = 'lost' THEN 'lost'
        ELSE 'other'
    END as result_category
FROM public.analyses a
WHERE a.is_deleted = FALSE
ORDER BY a.created_at DESC;

-- ============================================================================
-- VIEW: v_conversion_metrics (Métricas de Conversão)
-- ============================================================================
CREATE OR REPLACE VIEW public.v_conversion_metrics AS
SELECT
    user_id,
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) FILTER (WHERE type IN ('successful', 'venda-realizada', 'lost')) as total_calls,
    COUNT(*) FILTER (WHERE type IN ('successful', 'venda-realizada')) as successful_calls,
    COUNT(*) FILTER (WHERE type = 'lost') as lost_calls,
    CASE
        WHEN COUNT(*) FILTER (WHERE type IN ('successful', 'venda-realizada', 'lost')) > 0 THEN
            ROUND(
                (COUNT(*) FILTER (WHERE type IN ('successful', 'venda-realizada'))::NUMERIC /
                COUNT(*) FILTER (WHERE type IN ('successful', 'venda-realizada', 'lost'))::NUMERIC) * 100,
                1
            )
        ELSE 0
    END as conversion_rate
FROM public.analyses
WHERE is_deleted = FALSE
GROUP BY user_id, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ============================================================================
-- FUNCTION: Atualizar updated_at automaticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trigger_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_analyses_updated_at ON public.analyses;
CREATE TRIGGER trigger_analyses_updated_at
    BEFORE UPDATE ON public.analyses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FUNCTION: Gerar legacy_id único
-- ============================================================================
CREATE OR REPLACE FUNCTION public.generate_legacy_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.legacy_id IS NULL THEN
        NEW.legacy_id = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT + (random() * 1000)::INT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para legacy_id
DROP TRIGGER IF EXISTS trigger_analyses_legacy_id ON public.analyses;
CREATE TRIGGER trigger_analyses_legacy_id
    BEFORE INSERT ON public.analyses
    FOR EACH ROW EXECUTE FUNCTION public.generate_legacy_id();

-- ============================================================================
-- FUNCTION: Soft delete de análise
-- ============================================================================
CREATE OR REPLACE FUNCTION public.soft_delete_analysis(analysis_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.analyses
    SET is_deleted = TRUE, updated_at = NOW()
    WHERE id = analysis_uuid;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Restaurar análise deletada
-- ============================================================================
CREATE OR REPLACE FUNCTION public.restore_analysis(analysis_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.analyses
    SET is_deleted = FALSE, updated_at = NOW()
    WHERE id = analysis_uuid;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Inserir análise completa (com tratamento de erro)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.insert_analysis(
    p_user_id UUID,
    p_type analysis_type,
    p_model_id analysis_model_id,
    p_model_title TEXT,
    p_model_description TEXT,
    p_model_tags TEXT[],
    p_file_name TEXT,
    p_closer_name TEXT,
    p_total_score NUMERIC,
    p_total_max_score NUMERIC,
    p_raw_data JSONB,
    p_behavioral_profile JSONB DEFAULT NULL,
    p_cs_feedback JSONB DEFAULT NULL,
    p_referrals JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
    v_analysis_id UUID;
BEGIN
    INSERT INTO public.analyses (
        user_id,
        type,
        model_id,
        model_title,
        model_description,
        model_tags,
        file_name,
        closer_name,
        total_score,
        total_max_score,
        raw_data,
        behavioral_profile,
        cs_feedback,
        referrals
    ) VALUES (
        p_user_id,
        p_type,
        p_model_id,
        p_model_title,
        p_model_description,
        p_model_tags,
        p_file_name,
        p_closer_name,
        p_total_score,
        p_total_max_score,
        p_raw_data,
        p_behavioral_profile,
        p_cs_feedback,
        p_referrals
    )
    RETURNING id INTO v_analysis_id;

    RETURN v_analysis_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao inserir análise: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Buscar análises com filtros
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_analyses_filtered(
    p_user_id UUID DEFAULT NULL,
    p_type analysis_type DEFAULT NULL,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL,
    p_closer_name TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    legacy_id BIGINT,
    type analysis_type,
    model_id analysis_model_id,
    model_title TEXT,
    file_name TEXT,
    closer_name TEXT,
    total_score NUMERIC,
    total_max_score NUMERIC,
    score_percentage NUMERIC,
    created_at TIMESTAMPTZ,
    raw_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.legacy_id,
        a.type,
        a.model_id,
        a.model_title,
        a.file_name,
        a.closer_name,
        a.total_score,
        a.total_max_score,
        CASE
            WHEN a.total_max_score > 0 THEN ROUND((a.total_score / a.total_max_score) * 100, 1)
            ELSE 0
        END as score_percentage,
        a.created_at,
        a.raw_data
    FROM public.analyses a
    WHERE
        a.is_deleted = FALSE
        AND (p_user_id IS NULL OR a.user_id = p_user_id)
        AND (p_type IS NULL OR a.type = p_type)
        AND (p_start_date IS NULL OR a.created_at >= p_start_date)
        AND (p_end_date IS NULL OR a.created_at <= p_end_date)
        AND (p_closer_name IS NULL OR a.closer_name ILIKE '%' || p_closer_name || '%')
    ORDER BY a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- FUNCTION: Atualizar análise de segunda call
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_second_call_analysis(
    p_analysis_id UUID,
    p_second_call_data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.analyses
    SET
        second_call_analysis = p_second_call_data,
        updated_at = NOW()
    WHERE id = p_analysis_id AND type = 'relatorio-cirurgico';

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_call_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venda_realizada_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorio_cirurgico_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorio_segunda_call_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baseline_indicacao_details ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid()::text = firebase_uid OR auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid()::text = firebase_uid OR auth.uid() = id);

-- Políticas para analyses (mais permissivas para desenvolvimento)
CREATE POLICY "Users can view own analyses"
    ON public.analyses FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert own analyses"
    ON public.analyses FOR INSERT
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own analyses"
    ON public.analyses FOR UPDATE
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete own analyses"
    ON public.analyses FOR DELETE
    USING (user_id = auth.uid() OR user_id IS NULL);

-- Políticas genéricas para tabelas filhas (herdam da análise pai)
CREATE POLICY "Access through parent analysis"
    ON public.analysis_steps FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = analysis_id
            AND (a.user_id = auth.uid() OR a.user_id IS NULL)
        )
    );

CREATE POLICY "Access through parent analysis"
    ON public.behavioral_indicators FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = analysis_id
            AND (a.user_id = auth.uid() OR a.user_id IS NULL)
        )
    );

CREATE POLICY "Access through parent analysis"
    ON public.analysis_referrals FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = analysis_id
            AND (a.user_id = auth.uid() OR a.user_id IS NULL)
        )
    );

CREATE POLICY "Access through parent analysis"
    ON public.lost_call_details FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = analysis_id
            AND (a.user_id = auth.uid() OR a.user_id IS NULL)
        )
    );

CREATE POLICY "Access through parent analysis"
    ON public.venda_realizada_details FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = analysis_id
            AND (a.user_id = auth.uid() OR a.user_id IS NULL)
        )
    );

CREATE POLICY "Access through parent analysis"
    ON public.relatorio_cirurgico_details FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = analysis_id
            AND (a.user_id = auth.uid() OR a.user_id IS NULL)
        )
    );

CREATE POLICY "Access through parent analysis"
    ON public.relatorio_segunda_call_details FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = analysis_id
            AND (a.user_id = auth.uid() OR a.user_id IS NULL)
        )
    );

CREATE POLICY "Access through parent analysis"
    ON public.baseline_indicacao_details FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = analysis_id
            AND (a.user_id = auth.uid() OR a.user_id IS NULL)
        )
    );

-- ============================================================================
-- GRANTS (Permissões)
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- COMENTÁRIOS NAS TABELAS (Documentação)
-- ============================================================================
COMMENT ON TABLE public.analyses IS 'Tabela principal de análises de calls - armazena todos os tipos de análise';
COMMENT ON TABLE public.analysis_steps IS 'Etapas individuais das análises (25 etapas para modelos completos)';
COMMENT ON TABLE public.behavioral_indicators IS 'Indicadores comportamentais extraídos das análises';
COMMENT ON TABLE public.lost_call_details IS 'Detalhes específicos para análises de calls perdidas';
COMMENT ON TABLE public.venda_realizada_details IS 'Detalhes específicos para análises de vendas realizadas';
COMMENT ON TABLE public.relatorio_cirurgico_details IS 'Detalhes do relatório cirúrgico (1ª call)';
COMMENT ON TABLE public.relatorio_segunda_call_details IS 'Detalhes do dossiê estratégico (2ª call)';
COMMENT ON TABLE public.baseline_indicacao_details IS 'Detalhes do baseline para indicação';

COMMENT ON COLUMN public.analyses.raw_data IS 'Dados completos da análise em formato JSONB para flexibilidade máxima';
COMMENT ON COLUMN public.analyses.legacy_id IS 'ID numérico para compatibilidade com frontend (timestamp-based)';
COMMENT ON COLUMN public.analyses.second_call_analysis IS 'Análise comparativa da segunda call (apenas para relatorio-cirurgico)';

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
