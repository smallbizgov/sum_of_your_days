import React from 'react';

interface StatDisplayProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  modifier?: number;
}

const StatDisplay: React.FC<StatDisplayProps> = ({ icon, value, label, modifier }) => {
  const modifierColor = modifier && modifier > 0 ? 'text-green-400' : 'text-red-400';
  const modifierSign = modifier && modifier > 0 ? '+' : '';

  return (
    <div className="flex items-center space-x-2 bg-slate-800/50 p-2 rounded-lg text-sm relative" title={label}>
      <div className="text-cyan-400">{icon}</div>
      <span className="font-semibold text-slate-200">{value}</span>
      {modifier !== undefined && modifier !== 0 && (
        <span
          key={label + value} // Add value to key to re-trigger animation on change
          className={`absolute -top-4 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-xs font-bold ${modifierColor} ${modifier > 0 ? 'bg-green-500/20' : 'bg-red-500/20'} animate-fade-in-up opacity-0`}
        >
          {modifierSign}{modifier}
        </span>
      )}
    </div>
  );
};

export default StatDisplay;