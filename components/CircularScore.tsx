import React, { useEffect, useState } from 'react';

interface CircularScoreProps {
  score: number;
  maxScore: number;
  classification: string;
  size?: number;
  strokeWidth?: number;
}

const CircularScore: React.FC<CircularScoreProps> = ({ score, maxScore, classification, size = 200, strokeWidth = 12 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const animationTimeout = setTimeout(() => setProgress(score), 100);
    return () => clearTimeout(animationTimeout);
  }, [score]);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = maxScore > 0 ? (progress / maxScore) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;

  const getScoreColors = () => {
      if (percentage >= 85) return { text: 'text-cyan-400', stroke: '#22d3ee' }; // Excelente
      if (percentage >= 70) return { text: 'text-green-400', stroke: '#4ade80' }; // Boa
      if (percentage >= 55) return { text: 'text-yellow-400', stroke: '#facc15' }; // Regular
      return { text: 'text-red-400', stroke: '#f87171' }; // Crítica
  }

  const { text: textColor, stroke: strokeColor } = getScoreColors();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          className="stroke-gray-800"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={strokeColor}
          className="transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-6xl font-bold ${textColor}`}>{score}</span>
        <span className="text-sm text-gray-400">/ {maxScore}</span>
        <span className={`mt-2 text-sm font-semibold ${textColor}`}>{classification}</span>
      </div>
    </div>
  );
};

export default CircularScore;