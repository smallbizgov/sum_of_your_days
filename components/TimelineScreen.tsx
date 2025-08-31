import React, { useEffect, useMemo } from 'react';
import { StorySegment } from '../types';

interface TimelineScreenProps {
  storyHistory: StorySegment[];
  onClose: () => void;
}

const TimelineEvent: React.FC<{ segment: StorySegment; isLast: boolean }> = ({ segment, isLast }) => {
  return (
    <div className="relative pl-8 sm:pl-32 py-6 group">
      {/* Vertical line */}
      {!isLast && <div className="absolute top-0 left-2 sm:left-12 -ml-px w-0.5 h-full bg-slate-700"></div>}
      
      {/* Dot */}
      <div className="absolute top-8 left-2 sm:left-12 -ml-2 h-4 w-4 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors"></div>

      {/* Content */}
      <div className="relative">
        <p className="absolute -top-1 left-0 sm:left-auto sm:right-full sm:mr-8 text-slate-400 font-bold whitespace-nowrap">
          Age {segment.age}
        </p>
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          {segment.imageUrl && (
            <img src={segment.imageUrl} alt={`Event at age ${segment.age}`} className="w-full h-48 object-cover" />
          )}
          <div className="p-6">
            <p className="text-slate-300 leading-relaxed">{segment.narrative}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineScreen: React.FC<TimelineScreenProps> = ({ storyHistory, onClose }) => {
  const majorEvents = useMemo(() => storyHistory.filter(s => s.isMajorLifeEvent), [storyHistory]);

  useEffect(() => {
    // Disable scrolling on the body when the modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col animate-fade-in opacity-0"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl mx-auto my-auto p-4 md:p-8 flex flex-col h-full"
        onClick={e => e.stopPropagation()} // Prevent clicks inside from closing the modal
      >
        <header className="flex-shrink-0 flex items-center justify-between pb-4 mb-4 border-b border-slate-700">
            <h1 className="font-serif text-4xl font-bold text-white">Life Timeline</h1>
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="Close Timeline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </header>

        <div className="flex-grow overflow-y-auto pr-2">
          {majorEvents.length > 0 ? (
            majorEvents.map((segment, index) => (
              <TimelineEvent key={index} segment={segment} isLast={index === majorEvents.length - 1} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Major Life Events Recorded</h2>
                <p>Your story's most defining moments will appear here as they happen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineScreen;
