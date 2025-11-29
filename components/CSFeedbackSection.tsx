import React from 'react';
import type { CSFeedback } from '../types';
import { ChatBubbleLeftRightIcon } from './icons';

interface CSFeedbackSectionProps {
  feedback: CSFeedback;
}

const CSFeedbackSection: React.FC<CSFeedbackSectionProps> = ({ feedback }) => {
  if (!feedback) {
    return null;
  }

  return (
    <div className="bg-[#161b22] border border-gray-800/50 rounded-xl p-6">
      <h2 className="flex items-center text-xl font-bold text-white mb-4">
        <ChatBubbleLeftRightIcon className="w-6 h-6 text-cyan-400" />
        <span className="ml-3">Feedback para o CS</span>
      </h2>
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="font-semibold text-gray-300">Resumo e Próximos Passos</h3>
          <p className="text-gray-400 mt-1">{feedback.summary}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-300">Oportunidades de Indicação</h3>
          <p className="text-gray-400 mt-1">{feedback.referralOpportunities}</p>
        </div>
      </div>
    </div>
  );
};

export default CSFeedbackSection;
