import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SuccessfulCallReport from './components/CallAnalysisReport';
import LostCallReport from './components/LostCallReport';
import VendaRealizadaReport from './components/VendaRealizadaReport';
import RelatorioCirurgicoReport from './components/RelatorioCirurgicoReport';
import RelatorioSegundaCallReport from './components/RelatorioSegundaCallReport';
import BaselineIndicacaoReport from './components/BaselineIndicacaoReport';
import Settings from './components/Settings';
import Performance from './components/Performance';
import Notification from './Notification';
import ConfirmationModal from './components/ConfirmationModal';
import { useAnalysisManager } from './hooks/useAnalysisManager';
import type { SuccessfulCallReportData, LostCallReportData, VendaRealizadaReportData, RelatorioCirurgicoData, RelatorioSegundaCallData, BaselineIndicacaoReportData } from './types';


const App: React.FC = () => {
  const { state } = useAnalysisManager();
  const { currentView, analysisResult, settings } = state;
  const { theme, reducedAnimations, compactSidebar } = settings;

  // Usuário mockado para a aplicação funcionar sem autenticação
  const mockUser = {
    uid: 'local-user',
    name: 'Usuário',
    email: 'usuario@local.com',
    avatarUrl: 'https://ui-avatars.com/api/?name=Usuario&background=0D8ABC&color=fff',
    phone: ''
  };

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    if (reducedAnimations) {
        root.classList.add('no-animations');
    } else {
        root.classList.remove('no-animations');
    }
  }, [theme, reducedAnimations]);

  const renderContent = () => {
    switch(currentView) {
      case 'successful-call-report':
        return <SuccessfulCallReport reportData={analysisResult as SuccessfulCallReportData} />;
      case 'lost-call-report':
        return <LostCallReport reportData={analysisResult as LostCallReportData} />;
       case 'venda-realizada-report':
        return <VendaRealizadaReport reportData={analysisResult as VendaRealizadaReportData} />;
      case 'relatorio-cirurgico-report':
        return <RelatorioCirurgicoReport reportData={analysisResult as RelatorioCirurgicoData} />;
      case 'relatorio-segunda-call-report':
        return <RelatorioSegundaCallReport reportData={analysisResult as RelatorioSegundaCallData} />;
      case 'baseline-indicacao-report':
        return <BaselineIndicacaoReport reportData={analysisResult as BaselineIndicacaoReportData} />;
      case 'settings':
        return <Settings />;
      case 'performance':
        return <Performance />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  }

  return (
    <>
      <div className={`flex min-h-screen bg-[--background] text-[--text-primary] font-sans transition-colors duration-300`}>
        <Sidebar isCompact={compactSidebar} user={mockUser} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      <ConfirmationModal />
      <Notification />
    </>
  );
};

export default App;
