import React from 'react';

interface TitleScreenProps {
  onBegin: () => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onBegin }) => {
  const backgroundImageUrl = 'https://images.unsplash.com/photo-1528459176374-092a165a1338?q=80&w=2560&auto=format&fit=crop';

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center text-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative z-10 animate-fade-in opacity-0">
        <h1 className="font-serif text-6xl md:text-8xl font-bold mb-4 text-white">
          The Sum of Your Days
        </h1>
        <p className="text-slate-300 mb-12 text-lg max-w-xl mx-auto">
          Every choice becomes a memory. Every memory defines your story.
        </p>
        <button
          onClick={onBegin}
          className="px-8 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg shadow-lg hover:bg-white/20 transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
        >
          Begin
        </button>
      </div>
    </div>
  );
};

export default TitleScreen;
