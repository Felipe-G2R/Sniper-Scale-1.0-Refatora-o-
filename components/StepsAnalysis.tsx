import React, { useState } from 'react';
import type { AnalysisStep } from '../types';
import StepDetailModal from './StepDetailModal';

interface StepsAnalysisProps {
  steps: AnalysisStep[];
}

const StepCard: React.FC<{ step: AnalysisStep; onClick: () => void }> = ({ step, onClick }) => {
    const getStatusColor = (status: AnalysisStep['status']) => {
        switch (status) {
            case 'Excelente': return 'bg-cyan-500/20 text-cyan-400';
            case 'Bom': return 'bg-green-500/20 text-green-400';
            case 'Revisar': return 'bg-yellow-500/20 text-yellow-400';
        }
    }
    
    return (
        <button onClick={onClick} className="bg-[#161b22] border border-gray-800/50 rounded-lg p-4 space-y-2 cursor-pointer hover:border-cyan-400/50 transition-colors text-left w-full">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold bg-gray-700 text-gray-300 rounded-full">{step.id}</span>
                    <h4 className="text-sm font-semibold text-white truncate">{step.name}</h4>
                </div>
                <p className="text-sm font-bold text-white">{step.score}<span className="text-gray-400">/10</span></p>
            </div>
            <div className="flex justify-between items-center">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(step.status)}`}>{step.status}</span>
                <span className="text-xs text-cyan-400 font-semibold">Ver análise &rarr;</span>
            </div>
        </button>
    );
};


const StepsAnalysis: React.FC<StepsAnalysisProps> = ({ steps }) => {
  const [selectedStep, setSelectedStep] = useState<AnalysisStep | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step) => (
          <StepCard key={step.id} step={step} onClick={() => setSelectedStep(step)} />
        ))}
      </div>
      {selectedStep && (
        <StepDetailModal
          step={selectedStep}
          onClose={() => setSelectedStep(null)}
        />
      )}
    </>
  );
};

export default StepsAnalysis;