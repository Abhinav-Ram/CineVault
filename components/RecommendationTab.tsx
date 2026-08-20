import React, { useState, useRef, useEffect } from 'react';
import { RecommendationRequirements, LanguageGroup } from '../types';

interface RecommendationTabProps {
  onGetRecommendations: (reqs: RecommendationRequirements) => void;
  results: LanguageGroup[] | null;
  isLoading: boolean;
  onReset: () => void;
  onReplaceMovie?: (groupIdx: number, movieIdx: number, language: string) => Promise<void>;
  replacingMap?: Record<string, boolean>;
}

const GENRES = ["Action", "Comedy", "Horror", "Thriller", "Sci-Fi", "Drama", "Romance", "Documentary", "Animated", "Mystery"];
const COMPANIES = ["Solo", "Family", "Friends", "Cinephiles/Critics"];
const PACING = ["Fast & Furious", "Balanced", "Slow Burn"];
const LANGUAGES = ["Any Language", "English", "French", "German", "Hindi", "Italian", "Japanese", "Kannada", "Korean", "Malayalam", "Mandarin", "Portuguese", "Spanish", "Tamil", "Telugu"].sort((a, b) => a === "Any Language" ? -1 : b === "Any Language" ? 1 : a.localeCompare(b));

export const RecommendationTab: React.FC<RecommendationTabProps> = ({ onGetRecommendations, results, isLoading, onReset, onReplaceMovie, replacingMap }) => {
  const [formData, setFormData] = useState<RecommendationRequirements>({
    genres: [],
    company: 'Solo',
    pacing: 'Balanced',
    languages: ['Any Language'],
    customDescription: ''
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadReport = async () => {
    if (!pdfRef.current || isExporting) return;
    
    setIsExporting(true);
    const element = pdfRef.current;
    const opt = {
      margin: 10,
      filename: `MoviePicker_Recommendations_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
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

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre) ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre]
    }));
  };

  const toggleLanguage = (lang: string) => {
    setFormData(prev => {
      let newLangs = [...prev.languages];
      if (lang === "Any Language") return { ...prev, languages: ["Any Language"] };
      if (newLangs.includes(lang)) {
        newLangs = newLangs.filter(l => l !== lang);
        if (newLangs.length === 0) newLangs = ["Any Language"];
      } else {
        newLangs = newLangs.filter(l => l !== "Any Language");
        newLangs.push(lang);
      }
      return { ...prev, languages: newLangs };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGetRecommendations(formData);
  };

  if (results) {
    return (
      <div className="max-w-4xl mx-auto w-full pb-20 animate-fade-in">
        <div className="flex justify-between items-center mb-10 border-b-2 border-black pb-4 no-print">
          <h2 className="text-2xl font-bold text-black underline decoration-black decoration-2">Your Curated Picks 🍿</h2>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              disabled={isExporting}
              onClick={handleDownloadReport}
              className={`flex items-center gap-2 bg-black text-[#FFD700] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-lg active:scale-95 ${isExporting ? 'opacity-50' : 'hover:bg-gray-900'}`}
            >
              <svg className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isExporting ? 'Generating...' : 'Download PDF'}
            </button>
            <button onClick={onReset} className="text-sm text-black font-bold hover:underline">Start Over</button>
          </div>
        </div>

        {results.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-12 animate-fade-in" style={{ animationDelay: `${groupIdx * 0.1}s` }}>
            <div className="flex items-center gap-4 mb-6 no-print">
              <div className="h-0.5 flex-grow bg-black/20"></div>
              <h3 className="text-xs font-black text-black uppercase tracking-[0.3em] whitespace-nowrap">
                {group.language} Selection
              </h3>
              <div className="h-0.5 flex-grow bg-black/20"></div>
            </div>

            <div className="grid gap-6">
              {group.movies.map((movie, idx) => {
                const isReplacing = replacingMap?.[`${groupIdx}-${idx}`];
                return (
                  <div key={idx} className={`bg-white/60 border-2 border-black rounded-xl p-6 hover:bg-white transition-all duration-300 relative ${isReplacing ? 'opacity-60 pointer-events-none' : ''}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-black pr-12">{movie.title} <span className="text-black/60 text-base">({movie.year})</span></h3>
                      {onReplaceMovie && (
                        <button
                          type="button"
                          onClick={() => onReplaceMovie(groupIdx, idx, group.language)}
                          disabled={isReplacing}
                          title="Not interested? Replace this movie"
                          className="absolute top-6 right-6 p-1.5 rounded-full border border-black/10 hover:border-black/40 hover:bg-black/5 active:scale-95 transition-all text-black/60 hover:text-black flex items-center justify-center"
                        >
                          <svg className={`w-4 h-4 ${isReplacing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-black mb-4 leading-relaxed font-bold"><strong className="text-black underline uppercase text-xs tracking-wider block mb-1">Why it matches:</strong> {movie.reason}</p>
                    <div className="bg-white/80 rounded-lg p-3 border-2 border-black text-sm text-black italic font-bold">
                      <span className="text-black font-black not-italic mr-2">VIBE CHECK:</span>
                      {movie.suitability}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* HIDDEN TEMPLATE FOR PDF */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={pdfRef} className="pdf-template">
            <h1>Cine-Vault Picks</h1>
            <p style={{ color: '#666' }}>Recommendations based on: {formData.genres.join(', ')} • {formData.company}</p>
            
            {results.map((group, gIdx) => (
              <div key={gIdx} style={{ marginTop: '30px' }}>
                <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #ccc' }}>{group.language} Selection</h2>
                {group.movies.map((m, mIdx) => (
                  <div key={mIdx} style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px dotted #eee' }}>
                    <p style={{ fontSize: '12pt', fontWeight: 'bold' }}>{mIdx + 1}. {m.title} ({m.year})</p>
                    <p style={{ fontSize: '10pt', color: '#444' }}><strong>Reason:</strong> {m.reason}</p>
                    <p style={{ fontSize: '9pt', color: '#777', fontStyle: 'italic' }}>Match Vibe: {m.suitability}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in pb-20">
      <form onSubmit={handleSubmit} className="bg-white/40 border-2 border-black rounded-2xl p-8 shadow-2xl backdrop-blur-md">
        <h2 className="text-2xl font-bold text-black mb-6 text-center underline decoration-black decoration-2">Describe Your Perfect Movie</h2>
        
        <div className="mb-8">
          <label className="block text-black text-sm font-black mb-3 uppercase tracking-wider">Which vibes are we feeling?</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(genre => (
              <button key={genre} type="button" onClick={() => toggleGenre(genre)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 border-black ${formData.genres.includes(genre) ? 'bg-black text-white shadow-lg' : 'bg-white text-black hover:bg-gray-100'}`}>
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-black text-sm font-black mb-3 uppercase tracking-wider">Who's on the couch?</label>
            <select value={formData.company} onChange={(e) => setFormData(p => ({...p, company: e.target.value}))} className="w-full bg-white border-2 border-black rounded-xl px-2 py-1.5 text-black focus:outline-none focus:ring-2 focus:ring-black/20 font-handwriting text-2xl">
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <label className="block text-black text-sm font-black mb-3 uppercase tracking-wider">Language Preference</label>
            <button type="button" onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} className="w-full bg-white border-2 border-black rounded-xl px-2 py-1.5 text-black text-left flex justify-between items-center focus:ring-2 focus:ring-black/20 font-handwriting text-2xl">
              <span className="truncate pr-2">{formData.languages.join(', ')}</span>
              <svg className={`w-4 h-4 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isLangDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border-2 border-black rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                {LANGUAGES.map(lang => (
                  <button key={lang} type="button" onClick={() => toggleLanguage(lang)} className="w-full flex items-center px-4 py-3 hover:bg-black/5 text-left border-b border-black/10 last:border-0">
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${formData.languages.includes(lang) ? 'bg-black border-black' : 'border-black/40'}`}>
                      {formData.languages.includes(lang) && <svg className="w-3 h-3 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-sm font-bold ${formData.languages.includes(lang) ? 'text-black' : 'text-black/60'}`}>{lang}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-black text-sm font-black mb-3 uppercase tracking-wider">How fast should it move?</label>
          <div className="grid grid-cols-3 gap-3">
            {PACING.map(p => (
              <button key={p} type="button" onClick={() => setFormData(prev => ({...prev, pacing: p}))} className={`py-3 rounded-lg text-[10px] font-black border-2 transition-all ${formData.pacing === p ? 'border-black text-white bg-black' : 'border-black/20 text-black/60 hover:border-black hover:text-black'}`}>{p}</button>
            ))}
          </div>
        </div>

        <textarea className="w-full bg-white border-2 border-black rounded-xl px-2 py-1.5 text-black focus:outline-none focus:ring-2 focus:ring-black/20 h-24 mb-8 font-handwriting text-2xl" placeholder="Anything else? (Optional)" value={formData.customDescription} onChange={(e) => setFormData(p => ({...p, customDescription: e.target.value}))} />

        <button type="submit" disabled={isLoading || formData.genres.length === 0} className="w-full bg-black hover:bg-gray-900 py-4 rounded-xl font-bold text-[#FFD700] shadow-xl disabled:opacity-50 transition-all">
          {isLoading ? 'Curating Your List...' : 'Get Top Recommendations'}
        </button>
      </form>
    </div>
  );
};