import React from 'react';
import type { AnalysisStep } from '../types';
import { CheckCircleIcon, LightbulbIcon } from './icons';

interface StepDetailModalProps {
  step: AnalysisStep;
  onClose: () => void;
}

const BenchmarkBar: React.FC<{ label: string; userScore: number; topScore: number }> = ({ label, userScore, topScore }) => (
    <div>
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm font-medium text-gray-300">{label}</span>
            <div className="flex items-baseline">
                 <span className="text-lg font-bold text-cyan-400">{userScore.toFixed(1)}</span>
                 <span className="text-sm text-gray-400">/{topScore.toFixed(1)}</span>
            </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(userScore / topScore) * 100}%` }}></div>
        </div>
    </div>
);

const StepDetailModal: React.FC<StepDetailModalProps> = ({ step, onClose }) => {
  if (!step) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity animate-fade-in" onClick={onClose}>
      <div className="bg-[#0D1117] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl m-4 animate-fade-in-up max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-6 border-b border-gray-800">
             <div className="flex items-center space-x-3">
                <span className="flex items-center justify-center w-8 h-8 text-sm font-bold bg-cyan-500/20 text-cyan-400 rounded-full">{step.id}</span>
                <div>
                    <h2 className="text-lg font-bold text-white">{step.name}</h2>
                    <p className="text-sm text-gray-400">Sessão Estratégica</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </header>

        <main className="p-6 overflow-y-auto space-y-6">
            <div>
                <h3 className="text-md font-semibold text-gray-300 mb-2">Análise Específica da Call</h3>
                <p className="text-gray-400 bg-[#161b22] p-4 rounded-lg text-sm leading-relaxed">{step.specificAnalysis}</p>
            </div>
             <div>
                <h3 className="text-md font-semibold text-gray-300 mb-2">Justificativa da Pontuação</h3>
                <p className="text-gray-400 bg-[#161b22] p-4 rounded-lg text-sm leading-relaxed">{step.justification}</p>
            </div>

            <div className="bg-[#161b22] border border-gray-800/50 p-4 rounded-lg">
                <h3 className="text-md font-semibold text-gray-300 mb-3">Comparação com Benchmark</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BenchmarkBar label="Média Geral" userScore={step.benchmark?.average ?? 0} topScore={10} />
                    <BenchmarkBar label="Top Performer" userScore={step.benchmark?.top ?? 0} topScore={10} />
                </div>
                 <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-1.5 rounded-full" style={{ width: '105%' }}></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-cyan-400 font-semibold">Progresso até Top Performer: 105%</p>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="flex items-center text-md font-semibold text-gray-300 mb-2"><CheckCircleIcon className="w-5 h-5 mr-2 text-green-400" />Pontos Fortes</h3>
                    <ul className="space-y-2">
                        {step.strengths.map((item, i) => <li key={i} className="text-sm text-gray-400 bg-[#161b22] p-3 rounded-md">{item}</li>)}
                    </ul>
                </div>
                 <div>
                    <h3 className="flex items-center text-md font-semibold text-gray-300 mb-2"><LightbulbIcon className="w-5 h-5 mr-2 text-yellow-400" />Oportunidades</h3>
                    <ul className="space-y-2">
                        {step.opportunities.map((item, i) => <li key={i} className="text-sm text-gray-400 bg-[#161b22] p-3 rounded-md">{item}</li>)}
                    </ul>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default StepDetailModal;