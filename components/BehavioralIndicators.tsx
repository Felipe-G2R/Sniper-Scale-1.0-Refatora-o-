import React from 'react';
import type { BehavioralIndicator } from '../types';

interface BehavioralIndicatorsProps {
  indicators: BehavioralIndicator[];
}

const IndicatorBar: React.FC<{ indicator: BehavioralIndicator }> = ({ indicator }) => {
    const getStatusColor = (status: BehavioralIndicator['status']) => {
        switch (status) {
            case 'Excelente': return 'bg-cyan-400 text-cyan-400';
            case 'Bom': return 'bg-green-400 text-green-400';
            case 'Consultivo': return 'bg-purple-400 text-purple-400';
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-white">{indicator.name}</h4>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-opacity-20 ${getStatusColor(indicator.status)}`}>{indicator.status}</span>
            </div>
            <p className="text-xs text-gray-400">{indicator.description}</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div className={`${getStatusColor(indicator.status)} h-2 rounded-full`} style={{ width: `${indicator.score}%` }}></div>
            </div>
        </div>
    );
};


const BehavioralIndicators: React.FC<BehavioralIndicatorsProps> = ({ indicators }) => {
  return (
    <div className="space-y-6">
        {indicators.map((indicator, index) => (
            <IndicatorBar key={index} indicator={indicator} />
        ))}
    </div>
  );
};

export default BehavioralIndicators;