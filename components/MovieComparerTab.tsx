import React, { useState, useRef } from 'react';
import { Plus, Trash2, Zap, Brain, Music, ArrowRight, Download, RefreshCw } from 'lucide-react';
import { ComparisonResult, LoadingStage } from '../types';
import { compareMovies } from '../services/geminiService';

interface MovieComparerTabProps {
  onCompare: (titles: string[], preferences?: string) => Promise<void>;
  results: ComparisonResult | null;
  isLoading: boolean;
  onReset: () => void;
}

export const MovieComparerTab: React.FC<MovieComparerTabProps> = ({
  onCompare,
  results,
  isLoading,
  onReset,
}) => {
  const [movieInputs, setMovieInputs] = useState<string[]>(['', '']);
  const [userPreferences, setUserPreferences] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  const handleAddInput = () => {
    setMovieInputs([...movieInputs, '']);
  };

  const handleRemoveInput = (index: number) => {
    if (movieInputs.length > 2) {
      const newInputs = [...movieInputs];
      newInputs.splice(index, 1);
      setMovieInputs(newInputs);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...movieInputs];
    newInputs[index] = value;
    setMovieInputs(newInputs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validMovies = movieInputs.filter(m => m.trim() !== '');
    if (validMovies.length >= 2) {
      onCompare(validMovies, userPreferences);
    }
  };

  const downloadPDF = () => {
    if (!reportRef.current || !results) return;
    
    // @ts-ignore
    const html2pdf = window.html2pdf;
    const element = reportRef.current;
    
    const opt = {
      margin: 10,
      filename: `CineVault_Comparison_${results.movies.map(m => m.title).join('_vs_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  if (results) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in pb-20">
        <div className="flex justify-between items-center mb-8 bg-white/40 p-4 rounded-xl backdrop-blur-md border-2 border-black">
          <h1 className="text-xl font-bold text-black">Head-to-Head <span className="underline decoration-black decoration-2">Audit</span></h1>
          <div className="flex gap-4">
            <button onClick={downloadPDF} className="flex items-center gap-2 text-xs bg-black text-[#FFD700] px-4 py-2 rounded-lg font-bold hover:bg-gray-900 transition-all">
              <Download size={14} /> Download PDF
            </button>
            <button onClick={onReset} className="flex items-center gap-2 text-xs text-black font-bold hover:underline">
              <RefreshCw size={14} /> New Comparison
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {results.movies.map((movie, idx) => (
            <div key={idx} className="bg-white/60 border-2 border-black rounded-2xl p-6 relative overflow-hidden group hover:bg-white transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-black/10 transition-all"></div>
              <h3 className="text-2xl font-bold mb-1 text-black">{movie.title}</h3>
              <p className="text-black/60 text-sm mb-6 font-bold">{movie.year}</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-black/60 font-black flex items-center gap-2"><Zap size={12} /> Pacing</span>
                  <span className="text-sm font-bold text-black">{movie.pacing}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-black/60 font-black flex items-center gap-2"><Brain size={12} /> Cognitive Load</span>
                  <span className="text-sm font-bold text-black">{movie.cognitiveLoad}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-black/60 font-black flex items-center gap-2"><Music size={12} /> Tonal Friction</span>
                  <span className="text-sm font-bold text-black">{movie.tonalFriction}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-black/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black uppercase text-black/60">Vibe Match Score</span>
                  <span className="text-black font-black">{movie.vibeScore}%</span>
                </div>
                <div className="w-full bg-black/10 h-2 rounded-full overflow-hidden border border-black/20">
                  <div className="bg-black h-full transition-all duration-1000" style={{ width: `${movie.vibeScore}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/40 border-2 border-black rounded-2xl p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-black">
              <span className="w-8 h-8 bg-black text-[#FFD700] rounded-lg flex items-center justify-center text-sm font-black">01</span>
              Vibe Gap Analysis
            </h3>
            <p className="text-black leading-relaxed italic font-bold">"{results.vibeGapAnalysis}"</p>
          </div>

          <div className="bg-black/5 border-2 border-black rounded-2xl p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-black">
              <span className="w-8 h-8 bg-black text-[#FFD700] rounded-lg flex items-center justify-center text-sm font-black">02</span>
              Tie-Breaker Recommendation
            </h3>
            <div className="bg-white/80 p-6 rounded-xl border-2 border-black">
              <p className="text-black font-bold leading-relaxed">{results.tieBreakerRecommendation}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white/40 border-2 border-black rounded-2xl p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-8 text-black underline decoration-black decoration-2">Deep-Tissue Comparison Points</h3>
          <div className="space-y-8">
            {results.comparisonPoints.map((point, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <h4 className="text-black font-black uppercase tracking-tighter text-sm underline decoration-black/20">{point.category}</h4>
                </div>
                <div className="md:col-span-3 space-y-2">
                  {point.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex gap-3 text-black font-bold text-sm">
                      <ArrowRight size={14} className="mt-1 flex-shrink-0 text-black" />
                      <p>{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden PDF Template */}
        <div className="hidden">
          <div ref={reportRef} className="pdf-template">
            <div className="watermark">CINEVAULT AUDIT</div>
            <h1>Movie Comparison Report</h1>
            <div className="metadata-block">
              <p><strong>Generated:</strong> {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
              <p><strong>Movies Audited:</strong> {results.movies.map(m => `${m.title} (${m.year})`).join(', ')}</p>
              {userPreferences && <p><strong>User Context:</strong> {userPreferences}</p>}
            </div>

            <h2>1. Technical & Emotional Mapping</h2>
            {results.movies.map((movie, idx) => (
              <div key={idx} style={{ marginBottom: '20pt' }}>
                <h3>{idx + 1}. {movie.title} ({movie.year})</h3>
                <p><strong>Pacing:</strong> {movie.pacing}</p>
                <p><strong>Cognitive Load:</strong> {movie.cognitiveLoad}</p>
                <p><strong>Tonal Friction:</strong> {movie.tonalFriction}</p>
                <p><strong>Vibe Match Score:</strong> {movie.vibeScore}%</p>
              </div>
            ))}

            <h2>2. The Vibe Gap</h2>
            <p>{results.vibeGapAnalysis}</p>

            <h2>3. Final Recommendation</h2>
            <div style={{ padding: '15pt', border: '1pt solid #333', fontStyle: 'italic' }}>
              {results.tieBreakerRecommendation}
            </div>

            <h2>4. Comparative Breakdown</h2>
            {results.comparisonPoints.map((point, idx) => (
              <div key={idx} style={{ marginBottom: '15pt' }}>
                <p><strong>{point.category}:</strong></p>
                <ul style={{ paddingLeft: '20pt' }}>
                  {point.details.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white/40 backdrop-blur-md border-2 border-black rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-2 text-black underline decoration-black decoration-2">Movie Comparer</h2>
        <p className="text-black/70 mb-8 font-bold">Resolve decision paralysis with a head-to-head audit of your options.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-black/60">Movies to Compare</label>
            {movieInputs.map((input, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Movie ${index + 1} title...`}
                  className="flex-grow bg-white border-2 border-black rounded-xl px-2 py-1.5 text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition-colors font-handwriting text-2xl"
                  required
                />
                {movieInputs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInput(index)}
                    className="p-3 text-black/40 hover:text-black transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddInput}
              className="flex items-center gap-2 text-sm text-black hover:underline font-black transition-colors"
            >
              <Plus size={16} /> Add Another Movie
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-black/60">Optional Context / Preferences</label>
            <textarea
              value={userPreferences}
              onChange={(e) => setUserPreferences(e.target.value)}
              placeholder="e.g. 'I'm feeling tired and want something comforting' or 'We want something that will spark a long discussion'"
              className="w-full bg-white border-2 border-black rounded-xl px-2 py-1.5 text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition-colors h-24 resize-none font-handwriting text-2xl"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || movieInputs.filter(m => m.trim() !== '').length < 2}
            className="w-full bg-black hover:bg-gray-900 disabled:bg-black/20 disabled:text-black/40 text-[#FFD700] py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin"></div>
                Mapping DNA...
              </>
            ) : (
              <>
                <Zap size={20} />
                Run Head-to-Head Audit
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
