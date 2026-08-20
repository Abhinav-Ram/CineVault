import React, { useState, useRef } from 'react';
import { Search, Zap, Stars, MessageSquare, Star, Download } from 'lucide-react';
import { MovieEditData, MovieCandidate } from '../types';

interface MovieEditzTabProps {
  onSearch: (query: string, context?: string) => Promise<void>;
  results: MovieEditData | null;
  isLoading: boolean;
  onReset: () => void;
  candidates: MovieCandidate[];
  onSelect: (candidate: MovieCandidate) => void;
}

export const MovieEditzTab: React.FC<MovieEditzTabProps> = ({ onSearch, results, isLoading, onReset, candidates, onSelect }) => {
  const [query, setQuery] = useState('');
  const [emotion, setEmotion] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query, emotion);
    }
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || isExporting || !results) return;
    setIsExporting(true);
    
    const element = pdfRef.current;
    const movieTitle = (results.title || "Movie").replace(/\s+/g, '_');
    const opt = {
      margin: 0,
      filename: `CineEditz_${movieTitle}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={12} 
            fill={i < rating ? "currentColor" : "none"} 
            className={i < rating ? "text-cine-gold" : "text-black/20"} 
          />
        ))}
      </div>
    );
  };

  if (candidates.length > 0 && !results) {
    return (
      <div className="max-w-2xl mx-auto w-full animate-fade-in">
        <div className="bg-white/60 border-2 border-black rounded-2xl p-8 backdrop-blur-md">
          <h2 className="text-xl font-black uppercase tracking-widest mb-6">Which vibe are we scanning?</h2>
          <div className="space-y-4">
            {candidates.map((c, i) => (
              <button
                key={i}
                onClick={() => onSelect(c)}
                className="w-full text-left p-4 bg-white border-2 border-black rounded-xl hover:bg-black hover:text-[#FFD700] transition-all group"
              >
                <div className="font-black text-lg">{c.title} ({c.year})</div>
                <div className="text-xs opacity-60 group-hover:opacity-100 uppercase tracking-tighter">Directed by {c.director}</div>
              </button>
            ))}
            <button onClick={onReset} className="w-full text-center py-4 text-xs font-black uppercase tracking-widest hover:underline">Cancel Search</button>
          </div>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="max-w-4xl mx-auto w-full animate-fade-in pb-20">
        <div className="flex justify-between items-center mb-10 border-b-2 border-black pb-4">
          <h2 className="text-2xl font-bold text-black uppercase tracking-[0.2em]">Movie <span className="underline decoration-black decoration-2 italic">Editzzz</span></h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className={`flex items-center gap-2 bg-black text-[#FFD700] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-lg active:scale-95 ${isExporting ? 'opacity-50' : 'hover:bg-gray-900'}`}
            >
              <Download size={14} className={isExporting ? 'animate-spin' : ''} />
              {isExporting ? 'Exporting...' : 'Save PDF'}
            </button>
            <button onClick={onReset} className="text-sm text-black/60 font-bold hover:text-black underline transition-colors">New Scan</button>
          </div>
        </div>

        <div className="space-y-12">
          {/* Hook & Mood */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-black via-gray-800 to-black rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition-all"></div>
            <div className="relative bg-white/60 border-2 border-black rounded-2xl p-8 backdrop-blur-md">
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-black mb-6 leading-none">
                {results.hook}
              </h1>
              <div className="flex items-center gap-4 text-black/60 mb-6">
                <span className="text-xs font-black uppercase tracking-widest">{results.title} ({results.year})</span>
                <div className="h-0.5 flex-grow bg-black/10"></div>
              </div>
              <p className="text-xl font-bold text-black leading-relaxed italic">
                "{results.moodSummary}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Visual Transitions */}
            <div className="bg-black text-white rounded-2xl p-8 border-2 border-black shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <Zap size={200} fill="currentColor" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#FFD700] mb-8 flex items-center gap-3">
                <Zap size={16} /> Edit Transitions
              </h3>
              <ul className="space-y-6 relative z-10">
                {results.transitions.map((t, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="text-[#FFD700] font-black italic text-lg leading-none">0{i+1}</span>
                    <p className="font-bold underline decoration-[#FFD700]/30 underline-offset-4">{t}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Letterboxd Reviews */}
            <div className="bg-white/80 border-2 border-black rounded-2xl p-8 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-black/60 mb-8 flex items-center gap-3">
                <MessageSquare size={16} /> Synthetic Feed
              </h3>
              <div className="space-y-8">
                {results.letterboxdReviews.map((rev, i) => (
                  <div key={i} className="border-b border-black/10 last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-black tracking-widest uppercase">@{rev.user}</span>
                      {renderStars(rev.rating)}
                    </div>
                    <p className="text-sm font-bold text-black italic">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PDF TEMPLATE */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={pdfRef} className="pdf-template">
            <div className="watermark">EDITZZZ</div>
            <div style={{ textAlign: 'center', marginBottom: '30pt' }}>
              <p style={{ fontSize: '10pt', letterSpacing: '4pt', fontWeight: 'bold', color: '#000' }}>CINE-VAULT AESTHETIC DIVISION</p>
              <p style={{ fontSize: '8pt', color: '#666' }}>Vibe Check & Edit DNA Report</p>
            </div>

            <h1>{results.title} ({results.year})</h1>
            
            <div className="metadata-block">
              <p style={{ fontSize: '14pt', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '10pt' }}>
                "{results.hook}"
              </p>
              <p style={{ fontSize: '11pt', fontStyle: 'italic' }}>
                {results.moodSummary}
              </p>
            </div>

            <h2><span className="section-num">1</span> Edit Transitions (Core Memories)</h2>
            <div style={{ backgroundColor: '#000', color: '#fff', padding: '20pt', borderRadius: '10pt' }}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {results.transitions.map((t, i) => (
                  <li key={i} style={{ marginBottom: '15pt', display: 'flex', gap: '10pt' }}>
                    <span style={{ color: '#FFD700', fontWeight: 'bold' }}>0{i+1}</span>
                    <span style={{ fontWeight: 'bold' }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h2><span className="section-num">2</span> Synthetic Feed (Letterboxd Meta)</h2>
            <div style={{ border: '1pt solid #000', padding: '15pt', borderRadius: '10pt' }}>
              {results.letterboxdReviews.map((rev, i) => (
                <div key={i} style={{ borderBottom: i < results.letterboxdReviews.length - 1 ? '0.5pt solid #eee' : 'none', paddingBottom: '10pt', marginBottom: '10pt' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4pt' }}>
                    <strong style={{ fontSize: '9pt' }}>@{rev.user}</strong>
                    <div style={{ display: 'flex', gap: '2pt' }}>
                      {[...Array(5)].map((_, si) => (
                        <span key={si} style={{ color: si < rev.rating ? '#000' : '#ccc', fontSize: '8pt' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '10pt', fontStyle: 'italic' }}>"{rev.text}"</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '50pt', borderTop: '1pt solid #ccc', paddingTop: '10pt', fontSize: '8pt', textAlign: 'center', opacity: 0.5 }}>
              GENERATED BY CINEVAULT NEURAL ENGINE - {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in pb-20">
      <div className="bg-white/40 border-2 border-black rounded-2xl p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-[#FFD700] rounded-full mb-4 animate-bounce">
            <Stars size={32} />
          </div>
          <h2 className="text-3xl font-black text-black italic uppercase tracking-tighter underline lg:text-4xl decoration-black decoration-2">Movie Editzzz</h2>
          <p className="text-black/60 font-bold mt-2">Generate a vibe-checker for the Insta/TikTok age.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={20} />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a movie (e.g. Fight Club, Interstellar)"
              className="w-full bg-white border-2 border-black rounded-xl pl-12 pr-4 py-4 text-black focus:outline-none focus:ring-4 focus:ring-black/5 font-handwriting text-2xl"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/60 pl-1">
              vibe shift / emotion/context (optional)
            </label>
            <input 
              type="text"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              placeholder="e.g., 'it was a bad movie', 'crying on the floor', 'absolute masterpiece'"
              className="w-full bg-white border-2 border-black rounded-xl px-4 py-3.5 text-black placeholder:text-black/30 focus:outline-none focus:ring-4 focus:ring-black/5 font-bold text-sm"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !query.trim()}
            className="w-full bg-black hover:bg-gray-900 py-5 rounded-xl font-black text-[#FFD700] text-lg uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 active:scale-95"
          >
            {isLoading ? 'Scanning Vibe DNA...' : 'Generate Edit Profile'}
          </button>
        </form>

        <div className="mt-8 text-[10px] font-black text-black/40 uppercase tracking-[0.3em] text-center">
          Powered by CineVault Neural Engine
        </div>
      </div>
    </div>
  );
};
