import React from 'react';
// FIX: Import `AnalysisResult` to resolve module export error.
import type { AnalysisResult, AnalysisModel } from '../types';
import { EyeIcon, TrashIcon } from './icons';
import { useAnalysisManager } from '../hooks/useAnalysisManager';

interface AnalysisHistoryTableProps {
    history: AnalysisResult[];
}

const ModelTag: React.FC<{ model: AnalysisModel }> = ({ model }) => {
    // FIX: Removed 'preparacao-fechamento' as it's an obsolete model ID.
    const modelColorClasses: Record<AnalysisModel['id'], string> = {
        'next-level': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        'call-perdida': 'bg-red-500/10 text-red-400 border-red-500/30',
        'venda-realizada': 'bg-green-500/10 text-green-400 border-green-500/30',
        'universal': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        'relatorio-segunda-call': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        'relatorio-cirurgico': 'bg-gray-500/10 text-gray-400 border-gray-500/30',
        'baseline-indicacao': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    };
    // FIX: Removed 'preparacao-fechamento' as it's an obsolete model ID.
    const dotColorClasses: Record<AnalysisModel['id'], string> = {
        'next-level': 'bg-cyan-400',
        'call-perdida': 'bg-red-400',
        'venda-realizada': 'bg-green-400',
        'universal': 'bg-purple-400',
        'relatorio-segunda-call': 'bg-indigo-400',
        'relatorio-cirurgico': 'bg-gray-400',
        'baseline-indicacao': 'bg-yellow-400',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${modelColorClasses[model.id]}`}>
            <span className={`w-2 h-2 mr-2 rounded-full ${dotColorClasses[model.id]}`}></span>
            {model.title}
        </span>
    );
};


const AnalysisHistoryTable: React.FC<AnalysisHistoryTableProps> = ({ history }) => {
  const { reviewAnalysis, deleteAnalysis } = useAnalysisManager();
  
  if (history.length === 0) {
    return <p className="text-gray-500 text-center py-4">Nenhuma análise no período selecionado.</p>;
  }

  const getResultAndScore = (item: AnalysisResult) => {
    let result = '';
    let scoreText = 'N/A';
    let scoreColor = 'text-gray-400';

    if (item.type === 'successful' || item.type === 'venda-realizada') {
      result = 'Venda Realizada';
      const score = (item.totalScore / item.totalMaxScore) * 100;
      scoreText = `${score.toFixed(0)}%`;
      scoreColor = score >= 85 ? 'text-cyan-400' : score >= 70 ? 'text-green-400' : score >= 55 ? 'text-yellow-400' : 'text-red-400';
    } else if (item.type === 'lost') {
      result = 'Call Perdida';
      const score = (item.totalScore / item.totalMaxScore) * 100;
      scoreText = `${score.toFixed(0)}%`;
      scoreColor = score >= 85 ? 'text-cyan-400' : score >= 70 ? 'text-green-400' : score >= 55 ? 'text-yellow-400' : 'text-red-400';
    } else if (item.type === 'baseline-indicacao') {
      result = 'Baseline Preenchido';
      scoreText = 'N/A';
      scoreColor = 'text-yellow-400';
    }
    return { result, scoreText, scoreColor };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-400">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700/20">
          <tr>
            <th scope="col" className="px-6 py-3">Arquivo</th>
            <th scope="col" className="px-6 py-3">Tipo de Análise</th>
            <th scope="col" className="px-6 py-3">Resultado</th>
            <th scope="col" className="px-6 py-3">Pontuação</th>
            <th scope="col" className="px-6 py-3">Data</th>
            <th scope="col" className="px-6 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {history.slice().reverse().map((item) => {
            const { result, scoreText, scoreColor } = getResultAndScore(item);
            return (
              <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                <td className="px-6 py-4 font-medium text-white truncate max-w-xs">{item.fileName}</td>
                <td className="px-6 py-4"><ModelTag model={item.model} /></td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${item.type === 'lost' ? 'text-red-400' : 'text-green-400'}`}>{result}</span>
                </td>
                <td className={`px-6 py-4 font-bold ${scoreColor}`}>{scoreText}</td>
                <td className="px-6 py-4">{new Date(item.id).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-1">
                  <button onClick={() => reviewAnalysis(item.id)} className="p-2 text-gray-400 hover:text-cyan-400" title="Revisar">
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteAnalysis(item.id)} className="p-2 text-gray-400 hover:text-red-400" title="Excluir">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AnalysisHistoryTable;