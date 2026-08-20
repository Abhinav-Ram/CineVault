
import React from 'react';
import { MovieCandidate } from '../types';

interface DisambiguationOptionsProps {
  candidates: MovieCandidate[];
  onSelect: (candidate: MovieCandidate) => void;
  onCancel: () => void;
}

export const DisambiguationOptions: React.FC<DisambiguationOptionsProps> = ({ candidates, onSelect, onCancel }) => {
  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in pb-20">
      <div className="bg-white/40 border-2 border-black rounded-lg p-8 backdrop-blur-md shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black text-[#FFD700] mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2 underline decoration-black decoration-2">Multiple Matches Found</h2>
          <p className="text-black/70 font-bold">Which movie would you like to analyze? Accuracy matters for the dossier.</p>
        </div>

        <div className="grid gap-4 mb-6">
          {candidates.map((candidate, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(candidate)}
              className="flex items-center w-full p-4 bg-white border-2 border-black hover:bg-gray-50 rounded-lg group transition-all duration-200 text-left"
            >
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-lg font-bold text-black group-hover:underline">
                    {candidate.title}
                  </span>
                  <span className="text-sm font-black text-black/60 tracking-tighter">
                    {candidate.year}
                  </span>
                </div>
                <p className="text-xs text-black/60 uppercase tracking-widest font-black">
                  Directed by: {candidate.director}
                </p>
                <p className="text-[10px] text-black/40 mt-1 line-clamp-1 italic font-bold">
                  Cast: {candidate.actors.join(', ')}
                </p>
              </div>
              <svg className="w-5 h-5 text-black transform group-hover:translate-x-1 transition-all ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={onCancel}
            className="text-black font-bold hover:underline text-sm transition-all"
          >
            None of these / New Search
          </button>
        </div>
      </div>
    </div>
  );
};
