import React, { createContext, useReducer, Dispatch } from 'react';
import type { AnalysisState, AnalysisAction, Settings, AnalysisResult, View } from './types';

const defaultSettings: Settings = {
  theme: 'dark',
  reducedAnimations: false,
  compactSidebar: false,
  autoGainControl: true,
  noiseSuppression: false,
};

const initialState: AnalysisState = {
  user: null,
  settings: defaultSettings,
  currentView: 'dashboard',
  analysisResult: null,
  analysisHistory: [],
  isLoading: false,
  error: null,
  isModalOpen: false,
  notification: null,
  confirmationModal: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  },
  isAuthenticated: true, // Sempre autenticado (sem login)
  authView: 'login',
  isAuthLoading: false, // Nunca loading
  startDate: null,
  endDate: null,
};

const getNextView = (result: AnalysisResult): View => {
    switch (result.type) {
        case 'successful': return 'successful-call-report';
        case 'lost': return 'lost-call-report';
        case 'venda-realizada': return 'venda-realizada-report';
        case 'relatorio-segunda-call': return 'relatorio-segunda-call-report';
        case 'relatorio-cirurgico': return 'relatorio-cirurgico-report';
        case 'baseline-indicacao': return 'baseline-indicacao-report';
        default: return 'dashboard';
    }
};

const analysisReducer = (state: AnalysisState, action: AnalysisAction): AnalysisState => {
  switch (action.type) {
    case 'SET_AUTH_LOADING':
      return { ...state, isAuthLoading: action.payload };
    case 'LOGIN_SUCCESS':
        return {
            ...state,
            isAuthenticated: true,
            isAuthLoading: false,
            isLoading: false,
            error: null,
            user: action.payload,
        };
    case 'LOGOUT':
        return {
            ...initialState,
            isAuthLoading: false,
            isAuthenticated: true,
            user: null,
        };
    case 'SET_AUTH_VIEW':
        return { ...state, authView: action.payload, error: null };
    case 'NAVIGATE':
      return { ...state, currentView: action.payload, analysisResult: action.payload === 'dashboard' ? null : state.analysisResult };
    case 'SET_IS_MODAL_OPEN':
      return { ...state, isModalOpen: action.payload };
    case 'ACTION_STARTED':
      return { ...state, isLoading: true, error: null };
    case 'ANALYSIS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isModalOpen: false,
        analysisResult: action.payload,
        analysisHistory: [action.payload, ...state.analysisHistory],
        currentView: getNextView(action.payload),
      };
    case 'ACTION_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'REVIEW_ANALYSIS':
      const resultToReview = state.analysisHistory.find(r => r.id === action.payload);
      if (!resultToReview) return state;
      return {
        ...state,
        analysisResult: resultToReview,
        currentView: getNextView(resultToReview),
      };
    case 'LOAD_HISTORY_SUCCESS':
        return { ...state, analysisHistory: action.payload };
    case 'SHOW_CONFIRMATION':
      return { ...state, confirmationModal: { ...action.payload, isOpen: true } };
    case 'HIDE_CONFIRMATION':
      return { ...state, confirmationModal: { ...state.confirmationModal, isOpen: false } };
    case 'UPDATE_USER_INFO':
        if (!state.user) return state;
        return { ...state, user: { ...state.user, ...action.payload } };
    case 'UPDATE_SETTINGS':
        return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ANALYSIS_SECOND_CALL_SUCCESS':
      const { reportId, analysisData } = action.payload;
      const updatedHistory = state.analysisHistory.map(report => {
        if (report.id === reportId && report.type === 'relatorio-cirurgico') {
          return { ...report, analiseSegundaCall: analysisData };
        }
        return report;
      });
      const updatedResult = (state.analysisResult?.id === reportId && state.analysisResult.type === 'relatorio-cirurgico')
        ? { ...state.analysisResult, analiseSegundaCall: analysisData }
        : state.analysisResult;
      return { ...state, analysisHistory: updatedHistory, analysisResult: updatedResult, isLoading: false };
    case 'SET_DATE_FILTER':
      return { ...state, startDate: action.payload.startDate, endDate: action.payload.endDate };
    default:
      return state;
  }
};

export const AnalysisContext = createContext<{ state: AnalysisState; dispatch: Dispatch<AnalysisAction> } | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  return (
    <AnalysisContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalysisContext.Provider>
  );
};
