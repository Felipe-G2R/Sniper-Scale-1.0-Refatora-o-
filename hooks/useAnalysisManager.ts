import { useContext, useCallback } from 'react';
import { AnalysisContext } from '../AnalysisContext';
import { generateAnalysis, extractTextFromPdf, generateSecondCallComparison } from '../lib/gemini';
import type { View, AnalysisModel, AnalysisResult, User, Settings, AuthView, RelatorioCirurgicoData, AnaliseSegundaCall } from '../types';
import { knowledgeDB } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import { AnalysisService, type AnalysisRecord, type AnalysisType, type ModelId } from '../lib/supabase';


// --- Helper Functions ---

const getResultTypeFromModel = (model: AnalysisModel): AnalysisResult['type'] => {
    switch (model.id) {
        case 'call-perdida':
        case 'universal':
            return 'lost';
        case 'venda-realizada':
            return 'venda-realizada';
        case 'next-level':
            return 'successful';
        case 'relatorio-segunda-call':
            return 'relatorio-segunda-call';
        case 'relatorio-cirurgico':
            return 'relatorio-cirurgico';
        case 'baseline-indicacao':
            return 'baseline-indicacao';
        default:
            return 'successful';
    }
};

/**
 * Salva a análise no Supabase de forma não-bloqueante.
 * Não interfere no fluxo principal da aplicação em caso de erro.
 */
const saveAnalysisToSupabase = async (
    result: AnalysisResult,
    model: AnalysisModel,
    fileName: string,
    type: AnalysisType
): Promise<void> => {
    try {
        // Acesso seguro às propriedades que podem não existir em todos os tipos de análise
        const resultAny = result as any;

        const analysisRecord: AnalysisRecord = {
            legacy_id: result.id,
            type: type,
            model_id: model.id as ModelId,
            model_title: model.title,
            model_description: model.description,
            model_tags: model.tags,
            file_name: fileName,
            closer_name: result.closerName || 'N/A',
            total_score: resultAny.totalScore,
            total_max_score: resultAny.totalMaxScore || 250,
            raw_data: result,
            behavioral_profile: resultAny.behavioralIndicators ? { indicators: resultAny.behavioralIndicators } : undefined,
            cs_feedback: resultAny.feedbackCS ? { feedback: resultAny.feedbackCS } : undefined,
            referrals: resultAny.referrals?.map((r: any) => ({
                name: r.nome || r.name || 'N/A',
                contact: r.contato || r.contact,
                context: r.contexto || r.context || ''
            })),
        };

        const saveResult = await AnalysisService.save(analysisRecord);

        if (saveResult.success) {
            console.log(`[SUPABASE] Análise salva com ID: ${saveResult.id}`);
        } else {
            console.warn(`[SUPABASE] Falha ao salvar análise: ${saveResult.error}`);
        }
    } catch (error) {
        // Não propaga o erro - apenas loga
        console.error('[SUPABASE] Erro inesperado ao salvar análise:', error);
    }
};

/**
 * Atualiza a análise de segunda call no Supabase de forma não-bloqueante.
 * Busca a análise original pelo legacy_id e atualiza com os dados da segunda call.
 */
const updateSecondCallInSupabase = async (
    legacyId: number,
    secondCallData: Record<string, any>
): Promise<void> => {
    try {
        // Primeiro, busca a análise original pelo legacy_id
        const { data: originalAnalysis, error: fetchError } = await AnalysisService.getByLegacyId(legacyId);

        if (fetchError || !originalAnalysis) {
            console.warn(`[SUPABASE] Análise original não encontrada para legacy_id ${legacyId}: ${fetchError}`);
            return;
        }

        // Atualiza com os dados da segunda call
        const updateResult = await AnalysisService.update(originalAnalysis.id!, {
            second_call_analysis: secondCallData,
        });

        if (updateResult.success) {
            console.log(`[SUPABASE] Segunda call atualizada para análise ${originalAnalysis.id}`);
        } else {
            console.warn(`[SUPABASE] Falha ao atualizar segunda call: ${updateResult.error}`);
        }
    } catch (error) {
        // Não propaga o erro - apenas loga
        console.error('[SUPABASE] Erro inesperado ao atualizar segunda call:', error);
    }
};

/**
 * Cache para os dados de contexto do Firebase.
 */
let cachedContextData: string | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutos

/**
 * Fetches the entire knowledge base from the Firebase RTDB.
 */
const fetchContextFromDB = async (): Promise<string> => {
    const now = Date.now();
    if (cachedContextData !== null && cacheTimestamp !== null) {
        const cacheAge = now - cacheTimestamp;
        if (cacheAge < CACHE_DURATION_MS) {
            console.log(`[CACHE HIT] Usando contexto em cache (idade: ${Math.round(cacheAge / 1000)}s)`);
            return cachedContextData;
        }
        console.log("[CACHE EXPIRED] Cache expirado, recarregando...");
    }

    try {
        console.log("[FIREBASE] Iniciando carregamento do contexto...");
        const startTime = Date.now();

        const snapshot = await get(ref(knowledgeDB, '/'));

        const loadTime = Date.now() - startTime;
        console.log(`[FIREBASE] Carregamento concluído em ${loadTime}ms`);

        if (snapshot.exists()) {
            const data = JSON.stringify(snapshot.val(), null, 2);
            const sizeKB = Math.round(data.length / 1024);
            console.log(`[FIREBASE] Contexto carregado: ${sizeKB}KB de dados`);

            cachedContextData = data;
            cacheTimestamp = now;

            return data;
        }
        console.log("[FIREBASE] Nenhum dado de contexto disponível.");
        return "";
    } catch (error) {
        console.error("[FIREBASE ERROR] Erro ao carregar contexto:", error);
        return "";
    }
};


// --- Custom Hook ---

export const useAnalysisManager = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysisManager must be used within an AnalysisProvider');
  }
  const { state, dispatch } = context;

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const notification = { id: Date.now(), message, type };
    dispatch({ type: 'SET_NOTIFICATION', payload: notification });
    setTimeout(() => {
      dispatch({ type: 'SET_NOTIFICATION', payload: null });
    }, 5000);
  }, [dispatch]);

  // Funções de autenticação vazias (não usadas)
  const signup = useCallback(async (_name: string, _email: string, _password: string) => {
    showNotification('Autenticação desabilitada nesta versão.', 'error');
  }, [showNotification]);

  const login = useCallback(async (_email: string, _password: string) => {
    showNotification('Autenticação desabilitada nesta versão.', 'error');
  }, [showNotification]);

  const logout = useCallback(async () => {
    showNotification('Logout desabilitado nesta versão.', 'error');
  }, [showNotification]);

  const setAuthView = useCallback((view: AuthView) => {
    dispatch({ type: 'SET_AUTH_VIEW', payload: view });
  }, [dispatch]);


  const startAnalysis = useCallback(async (files: File | File[], model: AnalysisModel, enrich: boolean) => {
    dispatch({ type: 'ACTION_STARTED' });

    try {
      let fileContent: string;
      let fileName: string;

      if (Array.isArray(files)) {
        const content1 = files[0].type === 'application/pdf' ? await extractTextFromPdf(files[0]) : await files[0].text();
        const content2 = files[1].type === 'application/pdf' ? await extractTextFromPdf(files[1]) : await files[1].text();
        fileContent = `--- PARTE 1 ---\n\n${content1}\n\n--- PARTE 2 ---\n\n${content2}`;
        fileName = `${files[0].name} + ${files[1].name}`;
      } else {
        fileContent = files.type === 'application/pdf' ? await extractTextFromPdf(files) : await files.text();
        fileName = files.name;
      }

      let contextData = '';
      if (enrich) {
          contextData = await fetchContextFromDB();
      }

      const result = await generateAnalysis(fileContent, model, contextData);

      const type = getResultTypeFromModel(model);

      // Validação e sanitização
      const validatedResult = { ...result };
      validatedResult.referrals = Array.isArray(validatedResult.referrals) ? validatedResult.referrals : [];

      if (type === 'successful') {
        validatedResult.steps = Array.isArray(validatedResult.steps) ? validatedResult.steps : [];
        validatedResult.behavioralIndicators = Array.isArray(validatedResult.behavioralIndicators) ? validatedResult.behavioralIndicators : [];
      } else if (type === 'venda-realizada') {
          validatedResult.steps = Array.isArray(validatedResult.steps) ? validatedResult.steps : [];
          validatedResult.pontosPositivos = validatedResult.pontosPositivos || { detalhes: [] };
          validatedResult.pontosPositivos.detalhes = Array.isArray(validatedResult.pontosPositivos.detalhes) ? validatedResult.pontosPositivos.detalhes : [];
          validatedResult.criticaConstrutiva = validatedResult.criticaConstrutiva || { detalhes: [] };
          validatedResult.criticaConstrutiva.detalhes = Array.isArray(validatedResult.criticaConstrutiva.detalhes) ? validatedResult.criticaConstrutiva.detalhes : [];
          validatedResult.elogioFinal = validatedResult.elogioFinal || { detalhes: {} };
      } else if (type === 'lost') {
          validatedResult.pontuacaoPorEtapa = Array.isArray(validatedResult.pontuacaoPorEtapa) ? validatedResult.pontuacaoPorEtapa : [];
          validatedResult.justificativaDetalhada = Array.isArray(validatedResult.justificativaDetalhada) ? validatedResult.justificativaDetalhada : [];
          validatedResult.acertosIdentificados = Array.isArray(validatedResult.acertosIdentificados) ? validatedResult.acertosIdentificados : [];
          validatedResult.errosParaCorrecao = Array.isArray(validatedResult.errosParaCorrecao) ? validatedResult.errosParaCorrecao : [];
          validatedResult.analiseFinal = validatedResult.analiseFinal || {};
          if (validatedResult.analiseFinal.diagnostico8020) {
              validatedResult.analiseFinal.diagnostico8020.errosCriticos = Array.isArray(validatedResult.analiseFinal.diagnostico8020.errosCriticos) ? validatedResult.analiseFinal.diagnostico8020.errosCriticos : [];
          } else {
              validatedResult.analiseFinal.diagnostico8020 = { errosCriticos: [] };
          }
      }

      if ((type === 'successful' || type === 'venda-realizada' || type === 'lost') && validatedResult.totalMaxScore !== 250) {
          console.warn(`Corrigindo totalMaxScore de ${validatedResult.totalMaxScore} para 250 para o modelo ${model.id}`);
          validatedResult.totalMaxScore = 250;
      }

      const newResult: AnalysisResult = {
        ...validatedResult,
        id: Date.now(),
        fileName: fileName,
        model,
        type: type,
        closerName: validatedResult.closerName || validatedResult.nomeCloser || (validatedResult.dadosBasicos && validatedResult.dadosBasicos.nomeDoCloser) || (validatedResult.informacoesCliente && validatedResult.informacoesCliente.closerResponsavel) || 'N/A'
      };

      dispatch({ type: 'ANALYSIS_SUCCESS', payload: newResult });
      showNotification('Análise concluída com sucesso!', 'success');

      // Salva no Supabase em background (não bloqueia a UI)
      saveAnalysisToSupabase(newResult, model, fileName, type).catch(() => {
          // Silenciosamente ignora erros - já logados na função
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao analisar o arquivo. Por favor, tente novamente.';
      let finalMessage = errorMessage;
      if (errorMessage.includes("formato inválido")) {
          finalMessage = "A IA retornou um formato de dados inesperado. Tente novamente ou verifique a transcrição.";
      } else if (errorMessage.includes("API Gemini")) {
          finalMessage = "Ocorreu um erro de comunicação com a IA. Verifique sua conexão e tente novamente.";
      }

      dispatch({ type: 'ACTION_FAILURE', payload: finalMessage });
      showNotification(finalMessage, 'error');
    }
  }, [dispatch, showNotification]);

  const startSecondCallAnalysis = useCallback(async (reportId: number, secondCallFile: File) => {
    dispatch({ type: 'ACTION_STARTED' });
    const originalReport = state.analysisHistory.find(r => r.id === reportId);

    if (!originalReport || originalReport.type !== 'relatorio-cirurgico') {
        const errorMsg = "Relatório original não encontrado ou inválido.";
        dispatch({ type: 'ACTION_FAILURE', payload: errorMsg });
        showNotification(errorMsg, 'error');
        return;
    }

    try {
        let secondCallContent: string;
        if (secondCallFile.type === 'application/pdf') {
            secondCallContent = await extractTextFromPdf(secondCallFile);
        } else {
            secondCallContent = await secondCallFile.text();
        }

        const comparisonResult = await generateSecondCallComparison(originalReport, secondCallContent);

        dispatch({ type: 'ANALYSIS_SECOND_CALL_SUCCESS', payload: { reportId, analysisData: comparisonResult } });
        showNotification('Análise comparativa da 2ª call concluída!', 'success');

        // Atualiza no Supabase em background (não bloqueia a UI)
        updateSecondCallInSupabase(reportId, comparisonResult).catch(() => {
            // Silenciosamente ignora erros - já logados na função
        });

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Falha ao analisar a segunda call.';
        dispatch({ type: 'ACTION_FAILURE', payload: errorMessage });
        showNotification(errorMessage, 'error');
    }
  }, [dispatch, showNotification, state.analysisHistory]);

  const deleteSecondCallAnalysis = useCallback((reportId: number) => {
    dispatch({
        type: 'SHOW_CONFIRMATION',
        payload: {
            title: 'Excluir Análise da 2ª Call',
            message: 'Tem certeza de que deseja excluir esta análise comparativa? Você poderá gerar uma nova análise depois.',
            onConfirm: async () => {
                dispatch({ type: 'HIDE_CONFIRMATION' });
                dispatch({ type: 'ANALYSIS_SECOND_CALL_SUCCESS', payload: { reportId, analysisData: null as any } });
                showNotification('Análise da segunda call excluída.', 'success');
            },
        },
    });
  }, [dispatch, showNotification]);


  const navigate = useCallback((view: View) => {
    dispatch({ type: 'NAVIGATE', payload: view });
  }, [dispatch]);

  const setIsModalOpen = useCallback((isOpen: boolean) => {
      dispatch({type: 'SET_IS_MODAL_OPEN', payload: isOpen})
  }, [dispatch]);

  const newAnalysisRequest = useCallback(() => {
      dispatch({ type: 'NAVIGATE', payload: 'dashboard' });
      dispatch({ type: 'SET_IS_MODAL_OPEN', payload: true });
  }, [dispatch]);

  const reviewAnalysis = useCallback((id: number) => {
    dispatch({ type: 'REVIEW_ANALYSIS', payload: id });
  }, [dispatch]);

  const hideConfirmation = useCallback(() => {
      dispatch({ type: 'HIDE_CONFIRMATION' });
  }, [dispatch]);

  const updateUserInfo = useCallback(async (userInfo: Partial<User>) => {
      dispatch({ type: 'UPDATE_USER_INFO', payload: userInfo });
      showNotification('Perfil atualizado com sucesso!', 'success');
  }, [dispatch, showNotification]);

  const updateSettings = useCallback(async (settings: Partial<Settings>) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, [dispatch]);

  const setDateFilter = useCallback((startDate: string | null, endDate: string | null) => {
      dispatch({ type: 'SET_DATE_FILTER', payload: { startDate, endDate }});
  }, [dispatch]);


  return {
    state,
    signup,
    login,
    logout,
    setAuthView,
    startAnalysis,
    startSecondCallAnalysis,
    deleteSecondCallAnalysis,
    navigate,
    setIsModalOpen,
    newAnalysisRequest,
    reviewAnalysis,
    hideConfirmation,
    updateUserInfo,
    updateSettings,
    setDateFilter,
  };
};
