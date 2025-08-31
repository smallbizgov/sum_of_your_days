import React from 'react';
import { Relationship } from '../types';

interface RelationshipDisplayProps {
  relationship: Relationship;
}

const RelationshipDisplay: React.FC<RelationshipDisplayProps> = ({ relationship }) => {
  const { name, type, status, lifeSituation, recentEvent } = relationship;

  const getStatusColor = () => {
    if (status > 60) return 'bg-green-500';
    if (status > 20) return 'bg-sky-500';
    if (status > -20) return 'bg-slate-400';
    if (status > -60) return 'bg-orange-500';
    return 'bg-red-600';
  };

  // Convert status from [-100, 100] to [0, 100] for width percentage
  const widthPercentage = (status + 100) / 2;

  return (
    <div className="bg-slate-800/50 p-3 rounded-lg text-sm w-full flex flex-col h-full">
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-slate-200">{name}</span>
        <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-700 rounded-full">{type}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5 mb-2">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${getStatusColor()}`} 
          style={{ width: `${widthPercentage}%` }}
          title={`Status: ${status}`}
        ></div>
      </div>
      {(lifeSituation || recentEvent) && (
        <div className="mt-auto pt-2 border-t border-slate-700/50">
          {lifeSituation && <p className="text-xs text-slate-400">{lifeSituation}</p>}
          {recentEvent && <p className="text-xs text-cyan-400 italic mt-1">"{recentEvent}"</p>}
        </div>
      )}
    </div>
  );
};

export default RelationshipDisplay;