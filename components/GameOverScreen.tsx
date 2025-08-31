
import React from 'react';
import { Relationship } from '../types';

interface GameOverScreenProps {
  reason: string;
  onRestart: () => void;
  onShowTimeline: () => void;
  children: Relationship[];
  onContinueAsChild: (child: Relationship) => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ reason, onRestart, onShowTimeline, children, onContinueAsChild }) => {
  const adultChildren = children.filter(c => c.type === 'Child');

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center p-4 bg-gradient-to-br from-slate-900 to-gray-900">
      <div className="animate-fade-in opacity-0">
        <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
          The End
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mb-10">{reason}</p>

        {adultChildren.length > 0 && (
          <div className="mb-8 p-6 border border-cyan-500/30 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-3 text-cyan-400">Continue Legacy</h2>
            <p className="text-slate-400 mb-6">Your story has ended, but your legacy lives on. Continue as one of your children.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {adultChildren.map(child => (
                <button
                  key={child.name}
                  onClick={() => onContinueAsChild(child)}
                  className="px-6 py-3 bg-cyan-600/50 border border-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:bg-cyan-600/80 transform transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
                >
                  Play as {child.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onShowTimeline}
            className="px-8 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg shadow-lg hover:bg-white/20 transform transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
          >
            View Life Timeline
          </button>
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-cyan-300"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;