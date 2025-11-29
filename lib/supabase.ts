import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Tipos para o banco de dados
export type AnalysisType =
    | 'successful'
    | 'lost'
    | 'venda-realizada'
    | 'relatorio-cirurgico'
    | 'relatorio-segunda-call'
    | 'baseline-indicacao';

export type ModelId =
    | 'next-level'
    | 'call-perdida'
    | 'venda-realizada'
    | 'universal'
    | 'relatorio-cirurgico'
    | 'relatorio-segunda-call'
    | 'baseline-indicacao';

export interface AnalysisRecord {
    id?: string;
    legacy_id?: number;
    user_id?: string;
    type: AnalysisType;
    model_id: ModelId;
    model_title: string;
    model_description?: string;
    model_tags?: string[];
    file_name: string;
    closer_name?: string;
    total_score?: number;
    total_max_score?: number;
    raw_data: Record<string, any>;
    behavioral_profile?: Record<string, any>;
    cs_feedback?: Record<string, any>;
    referrals?: Array<{ name: string; contact?: string; context: string }>;
    second_call_analysis?: Record<string, any>;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

// Inicialização lazy do cliente Supabase
let supabaseClient: SupabaseClient | null = null;

/**
 * Obtém ou cria a instância do cliente Supabase
 */
export const getSupabase = (): SupabaseClient | null => {
    if (supabaseClient) return supabaseClient;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('[SUPABASE] Variáveis de ambiente não configuradas. Persistência desabilitada.');
        return null;
    }

    try {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
        console.log('[SUPABASE] Cliente inicializado com sucesso');
        return supabaseClient;
    } catch (error) {
        console.error('[SUPABASE] Erro ao inicializar cliente:', error);
        return null;
    }
};

/**
 * Verifica se o Supabase está disponível
 */
export const isSupabaseAvailable = (): boolean => {
    return getSupabase() !== null;
};

/**
 * Serviço de Análises - CRUD completo
 */
export const AnalysisService = {
    /**
     * Salva uma nova análise no banco de dados
     * Não bloqueia em caso de erro - retorna silenciosamente
     */
    async save(analysis: AnalysisRecord): Promise<{ success: boolean; id?: string; error?: string }> {
        const supabase = getSupabase();
        if (!supabase) {
            console.log('[SUPABASE] Persistência desabilitada - análise não salva no banco');
            return { success: false, error: 'Supabase não configurado' };
        }

        try {
            const { data, error } = await supabase
                .from('analyses')
                .insert({
                    user_id: analysis.user_id || null,
                    type: analysis.type,
                    model_id: analysis.model_id,
                    model_title: analysis.model_title,
                    model_description: analysis.model_description,
                    model_tags: analysis.model_tags || [],
                    file_name: analysis.file_name,
                    closer_name: analysis.closer_name,
                    total_score: analysis.total_score,
                    total_max_score: analysis.total_max_score || 250,
                    raw_data: analysis.raw_data,
                    behavioral_profile: analysis.behavioral_profile,
                    cs_feedback: analysis.cs_feedback,
                    referrals: analysis.referrals || [],
                })
                .select('id, legacy_id')
                .single();

            if (error) {
                console.error('[SUPABASE] Erro ao salvar análise:', error);
                return { success: false, error: error.message };
            }

            console.log('[SUPABASE] Análise salva com sucesso:', data.id);
            return { success: true, id: data.id };
        } catch (err) {
            console.error('[SUPABASE] Exceção ao salvar análise:', err);
            return { success: false, error: String(err) };
        }
    },

    /**
     * Busca todas as análises do usuário
     */
    async getAll(userId?: string, filters?: {
        type?: AnalysisType;
        startDate?: string;
        endDate?: string;
        closerName?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ data: AnalysisRecord[] | null; error?: string }> {
        const supabase = getSupabase();
        if (!supabase) {
            return { data: [], error: 'Supabase não configurado' };
        }

        try {
            let query = supabase
                .from('analyses')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (userId) {
                query = query.eq('user_id', userId);
            }

            if (filters?.type) {
                query = query.eq('type', filters.type);
            }

            if (filters?.startDate) {
                query = query.gte('created_at', filters.startDate);
            }

            if (filters?.endDate) {
                query = query.lte('created_at', filters.endDate);
            }

            if (filters?.closerName) {
                query = query.ilike('closer_name', `%${filters.closerName}%`);
            }

            if (filters?.limit) {
                query = query.limit(filters.limit);
            }

            if (filters?.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
            }

            const { data, error } = await query;

            if (error) {
                console.error('[SUPABASE] Erro ao buscar análises:', error);
                return { data: null, error: error.message };
            }

            return { data: data as AnalysisRecord[] };
        } catch (err) {
            console.error('[SUPABASE] Exceção ao buscar análises:', err);
            return { data: null, error: String(err) };
        }
    },

    /**
     * Busca uma análise específica por ID
     */
    async getById(id: string): Promise<{ data: AnalysisRecord | null; error?: string }> {
        const supabase = getSupabase();
        if (!supabase) {
            return { data: null, error: 'Supabase não configurado' };
        }

        try {
            const { data, error } = await supabase
                .from('analyses')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('[SUPABASE] Erro ao buscar análise:', error);
                return { data: null, error: error.message };
            }

            return { data: data as AnalysisRecord };
        } catch (err) {
            console.error('[SUPABASE] Exceção ao buscar análise:', err);
            return { data: null, error: String(err) };
        }
    },

    /**
     * Busca uma análise por legacy_id (compatibilidade com frontend)
     */
    async getByLegacyId(legacyId: number): Promise<{ data: AnalysisRecord | null; error?: string }> {
        const supabase = getSupabase();
        if (!supabase) {
            return { data: null, error: 'Supabase não configurado' };
        }

        try {
            const { data, error } = await supabase
                .from('analyses')
                .select('*')
                .eq('legacy_id', legacyId)
                .single();

            if (error) {
                console.error('[SUPABASE] Erro ao buscar análise por legacy_id:', error);
                return { data: null, error: error.message };
            }

            return { data: data as AnalysisRecord };
        } catch (err) {
            console.error('[SUPABASE] Exceção ao buscar análise:', err);
            return { data: null, error: String(err) };
        }
    },

    /**
     * Atualiza uma análise existente
     */
    async update(id: string, updates: Partial<AnalysisRecord>): Promise<{ success: boolean; error?: string }> {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: 'Supabase não configurado' };
        }

        try {
            const { error } = await supabase
                .from('analyses')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) {
                console.error('[SUPABASE] Erro ao atualizar análise:', error);
                return { success: false, error: error.message };
            }

            console.log('[SUPABASE] Análise atualizada:', id);
            return { success: true };
        } catch (err) {
            console.error('[SUPABASE] Exceção ao atualizar análise:', err);
            return { success: false, error: String(err) };
        }
    },

    /**
     * Atualiza a análise de segunda call (para relatório cirúrgico)
     */
    async updateSecondCallAnalysis(
        analysisId: string,
        secondCallData: Record<string, any>
    ): Promise<{ success: boolean; error?: string }> {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: 'Supabase não configurado' };
        }

        try {
            const { error } = await supabase
                .from('analyses')
                .update({
                    second_call_analysis: secondCallData,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', analysisId)
                .eq('type', 'relatorio-cirurgico');

            if (error) {
                console.error('[SUPABASE] Erro ao atualizar análise de segunda call:', error);
                return { success: false, error: error.message };
            }

            console.log('[SUPABASE] Análise de segunda call atualizada:', analysisId);
            return { success: true };
        } catch (err) {
            console.error('[SUPABASE] Exceção ao atualizar segunda call:', err);
            return { success: false, error: String(err) };
        }
    },

    /**
     * Soft delete - marca análise como deletada
     */
    async delete(id: string): Promise<{ success: boolean; error?: string }> {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: 'Supabase não configurado' };
        }

        try {
            const { error } = await supabase
                .from('analyses')
                .update({
                    is_deleted: true,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) {
                console.error('[SUPABASE] Erro ao deletar análise:', error);
                return { success: false, error: error.message };
            }

            console.log('[SUPABASE] Análise deletada (soft):', id);
            return { success: true };
        } catch (err) {
            console.error('[SUPABASE] Exceção ao deletar análise:', err);
            return { success: false, error: String(err) };
        }
    },

    /**
     * Restaura uma análise deletada
     */
    async restore(id: string): Promise<{ success: boolean; error?: string }> {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: 'Supabase não configurado' };
        }

        try {
            const { error } = await supabase
                .from('analyses')
                .update({
                    is_deleted: false,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) {
                console.error('[SUPABASE] Erro ao restaurar análise:', error);
                return { success: false, error: error.message };
            }

            console.log('[SUPABASE] Análise restaurada:', id);
            return { success: true };
        } catch (err) {
            console.error('[SUPABASE] Exceção ao restaurar análise:', err);
            return { success: false, error: String(err) };
        }
    },

    /**
     * Obtém métricas de conversão
     */
    async getConversionMetrics(userId?: string, startDate?: string, endDate?: string): Promise<{
        data: {
            totalCalls: number;
            successfulCalls: number;
            lostCalls: number;
            conversionRate: number;
        } | null;
        error?: string;
    }> {
        const supabase = getSupabase();
        if (!supabase) {
            return { data: null, error: 'Supabase não configurado' };
        }

        try {
            let query = supabase
                .from('analyses')
                .select('type')
                .eq('is_deleted', false)
                .in('type', ['successful', 'venda-realizada', 'lost']);

            if (userId) {
                query = query.eq('user_id', userId);
            }

            if (startDate) {
                query = query.gte('created_at', startDate);
            }

            if (endDate) {
                query = query.lte('created_at', endDate);
            }

            const { data, error } = await query;

            if (error) {
                console.error('[SUPABASE] Erro ao buscar métricas:', error);
                return { data: null, error: error.message };
            }

            const analyses = data || [];
            const successfulCalls = analyses.filter(a =>
                a.type === 'successful' || a.type === 'venda-realizada'
            ).length;
            const lostCalls = analyses.filter(a => a.type === 'lost').length;
            const totalCalls = successfulCalls + lostCalls;
            const conversionRate = totalCalls > 0
                ? (successfulCalls / totalCalls) * 100
                : 0;

            return {
                data: {
                    totalCalls,
                    successfulCalls,
                    lostCalls,
                    conversionRate: Math.round(conversionRate * 10) / 10,
                }
            };
        } catch (err) {
            console.error('[SUPABASE] Exceção ao buscar métricas:', err);
            return { data: null, error: String(err) };
        }
    },
};

export default AnalysisService;
