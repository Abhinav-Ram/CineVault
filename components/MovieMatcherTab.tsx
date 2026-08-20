
import React, { useState, useRef } from 'react';
import { MovieCandidate, MovieRecommendation, SimilarityRequest } from '../types';
import { DisambiguationOptions } from './DisambiguationOptions';

interface MovieMatcherTabProps {
  onSearchSimilar: (req: SimilarityRequest) => void;
  results: MovieRecommendation[] | null;
  isLoading: boolean;
  onReset: () => void;
  // Fix: Changed from string[] to MovieCandidate[]
  candidates: MovieCandidate[];
  // Fix: Changed from (candidate: string) => void to (candidate: MovieCandidate) => void
  onCandidateSelect: (candidate: MovieCandidate) => void;
  onReplaceMovie?: (movieIdx: number) => Promise<void>;
  replacingMap?: Record<number, boolean>;
}

export const MovieMatcherTab: React.FC<MovieMatcherTabProps> = ({ 
  onSearchSimilar, 
  results, 
  isLoading, 
  onReset, 
  candidates, 
  onCandidateSelect,
  onReplaceMovie,
  replacingMap
}) => {
  const [query, setQuery] = useState('');
  const [reason, setReason] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadReport = async () => {
    if (!pdfRef.current || isExporting) return;
    
    setIsExporting(true);
    const element = pdfRef.current;
    const opt = {
      margin: 10,
      filename: `CineMatcher_SimilarTo_${query.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearchSimilar({ sourceMovie: query, reason });
    }
  };

  if (candidates.length > 0) {
    return <DisambiguationOptions candidates={candidates} onSelect={onCandidateSelect} onCancel={onReset} />;
  }

  if (results) {
    return (
      <div className="max-w-4xl mx-auto w-full pb-20 animate-fade-in">
        <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4 no-print">
          <h2 className="text-2xl font-bold text-black underline decoration-black decoration-2">Your "Cine-Matches" 🎬</h2>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              disabled={isExporting}
              onClick={handleDownloadReport}
              className={`flex items-center gap-2 bg-black text-[#FFD700] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-lg active:scale-95 ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-900'}`}
            >
              <svg className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isExporting ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                )}
              </svg>
              {isExporting ? 'Generating...' : 'Download PDF'}
            </button>
            <button onClick={onReset} className="text-sm text-black font-bold hover:underline">Find Another</button>
          </div>
        </div>

        <div className="grid gap-6 no-print">
          {results.map((movie, idx) => {
            const isReplacing = replacingMap?.[idx];
            return (
              <div key={idx} className={`bg-white/60 border-2 border-black rounded-xl p-6 hover:bg-white transition-all duration-300 relative ${isReplacing ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-black pr-24">{movie?.title || "Unknown"} <span className="text-black/60 text-base">({movie?.year || "Unknown"})</span></h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-black text-[#FFD700] text-[10px] uppercase font-bold px-2 py-1 rounded">Match High</span>
                    {onReplaceMovie && (
                      <button
                        type="button"
                        onClick={() => onReplaceMovie(idx)}
                        disabled={isReplacing}
                        title="Not interested? Replace this movie"
                        className="p-1.5 rounded-full border border-black/10 hover:border-black/40 hover:bg-black/5 active:scale-95 transition-all text-black/60 hover:text-black flex items-center justify-center"
                      >
                        <svg className={`w-3.5 h-3.5 ${isReplacing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-black mb-4 leading-relaxed font-bold"><strong className="text-black underline uppercase text-xs tracking-wider block mb-1">Why you'll love it:</strong> {movie?.reason || "No data available."}</p>
                <div className="bg-white/80 rounded-lg p-3 border-2 border-black text-sm text-black italic font-bold">
                   <span className="text-black font-black not-italic mr-2">VIBE CHECK:</span>
                   {movie?.suitability || "N/A"}
                </div>
              </div>
            );
          })}
        </div>

        {/* HIDDEN TEMPLATE FOR PDF */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={pdfRef} className="pdf-template">
            <h1>Cine-Matcher Matches</h1>
            <p style={{ color: '#666', marginBottom: '10px' }}>Similar to: <strong>{query}</strong></p>
            {reason && <p style={{ fontSize: '10pt', fontStyle: 'italic', marginBottom: '20px' }}>Your context: {reason}</p>}
            
            <div style={{ marginTop: '30px' }}>
              {results.map((m, mIdx) => (
                <div key={mIdx} style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px dotted #eee' }}>
                  <p style={{ fontSize: '12pt', fontWeight: 'bold' }}>{mIdx + 1}. {m?.title || "Unknown"} ({m?.year || "Unknown"})</p>
                  <p style={{ fontSize: '10pt', color: '#444' }}><strong>Match Reason:</strong> {m?.reason || "N/A"}</p>
                  <p style={{ fontSize: '9pt', color: '#777', fontStyle: 'italic' }}>Suitability: {m?.suitability || "N/A"}</p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '30px', fontSize: '8pt', color: '#999', textAlign: 'center' }}>© CineVault - Expert Movie Recommendations</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in pb-20 no-print">
      <form onSubmit={handleSubmit} className="bg-white/40 border-2 border-black rounded-2xl p-8 shadow-2xl backdrop-blur-md">
        <h2 className="text-2xl font-bold text-black mb-2 text-center underline decoration-black decoration-2">Find your ideal movies</h2>
        <p className="text-black/70 text-center mb-8 font-bold">Enter a movie you loved, and we'll find others with the same type and mood.</p>

        <input type="text" className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 mb-6 font-handwriting text-lg" placeholder="The Movie You Loved (e.g. Inception)" value={query} onChange={(e) => setQuery(e.target.value)} disabled={isLoading} />
        <textarea className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black/20 h-32 resize-none mb-8 font-handwriting text-lg" placeholder="What specifically did you enjoy? (Optional)" value={reason} onChange={(e) => setReason(e.target.value)} disabled={isLoading} />

        <button type="submit" disabled={isLoading || !query.trim()} className="w-full bg-black hover:bg-gray-900 py-4 rounded-xl font-bold text-[#FFD700] shadow-xl disabled:opacity-50 transition-all">
          {isLoading ? 'Scanning the Cinema Multiverse...' : 'Find Matches'}
        </button>
      </form>
    </div>
  );
};
