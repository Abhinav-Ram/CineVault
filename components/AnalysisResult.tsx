
import React, { useState, useRef } from 'react';
import { AnalysisData } from '../types';
import { CineChat } from './CineChat';
import * as Icons from 'lucide-react';

interface AnalysisResultProps {
  data: AnalysisData;
  onReset: () => void;
}

const TShirtDisplay: React.FC<{ design: AnalysisData['general']['tShirtDesign'] }> = ({ design }) => {
  const IconComponent = (Icons as any)[design.iconName] || Icons.HelpCircle;

  return (
    <div 
      className="relative w-full rounded-xl shadow-2xl border-4 border-black aspect-[1/1] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
      style={{ backgroundColor: design.backgroundColor }}
    >
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div style={{ color: design.textColor }}>
          <IconComponent size={120} strokeWidth={1.5} />
        </div>
        <p 
          className="text-2xl font-bold leading-tight"
          style={{ 
            color: design.textColor,
            fontFamily: design.fontFamily === 'cursive' ? '"Brush Script MT", cursive' : 
                        design.fontFamily === 'fantasy' ? 'Papyrus, fantasy' : 
                        design.fontFamily
          }}
        >
          {design.phrase}
        </p>
      </div>
    </div>
  );
};

const ScoreBar: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">{label}</span>
      <span className={`text-[10px] font-black text-black`}>{score}/10</span>
    </div>
    <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden border border-black/20">
      <div 
        className={`h-full bg-black transition-all duration-1000`} 
        style={{ width: `${score * 10}%` }}
      />
    </div>
  </div>
);

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'FRIENDLY'>('GENERAL');
  const [isExporting, setIsExporting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  if (!data || !data.general) return null;

  const { general, friendliness, sources } = data;

  const handleDownloadReport = async () => {
    if (!pdfRef.current || isExporting) return;
    setIsExporting(true);
    const element = pdfRef.current;
    const movieTitle = (general.title || "Movie").replace(/\s+/g, '_');
    const movieYear = general.year || "Unknown";
    const opt = {
      margin: 0,
      filename: `CineReport_${movieTitle}_${movieYear}.pdf`,
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

  const reportId = `CV-${general.year}-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="max-w-4xl mx-auto w-full pb-20 animate-fade-in relative">
      {/* Cine-Chat Tab */}
      {isChatOpen && <CineChat movieData={data} onClose={() => setIsChatOpen(false)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b-2 border-black pb-6 gap-4 no-print">
        <div className="flex-grow">
          <p className="text-sm text-black/60 uppercase tracking-widest mb-1 font-black">Cine-Vault Intel</p>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl md:text-5xl font-black text-black italic tracking-tighter underline decoration-black decoration-2">
              {general.title} <span className="text-black/40">({general.year})</span>
            </h2>
            {/* New Chat Button Position */}
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center justify-center p-2 rounded-xl transition-all duration-300 no-print shadow-lg hover:scale-110 active:scale-95 border-2 ${
                isChatOpen 
                  ? 'bg-black text-[#FFD700] border-black' 
                  : 'bg-white/40 text-black border-black hover:bg-white/60'
              }`}
              title="Toggle Cine-Chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={handleDownloadReport}
              disabled={isExporting}
              className={`flex items-center gap-2 bg-black text-[#FFD700] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-lg active:scale-95 ${isExporting ? 'opacity-50' : 'hover:bg-gray-900'}`}
            >
              <svg className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isExporting ? 'Compiling Report...' : 'Export Pro Report'}
            </button>
            <button onClick={onReset} className="text-xs text-black font-bold hover:underline">New Search</button>
          </div>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex gap-4 mb-8 no-print">
        <button onClick={() => setActiveTab('GENERAL')} className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all border-2 border-black ${activeTab === 'GENERAL' ? 'bg-black text-white shadow-lg' : 'bg-white/40 text-black hover:bg-white/60'}`}>Executive Summary</button>
        <button onClick={() => setActiveTab('FRIENDLY')} className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all border-2 border-black ${activeTab === 'FRIENDLY' ? 'bg-black text-[#FFD700] shadow-lg' : 'bg-white/40 text-black hover:bg-white/60'}`}>Social Impact Assessment</button>
      </div>

      <div className="no-print">
        {activeTab === 'GENERAL' ? (
          <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Poster Column (Now T-Shirt Display) */}
              <div className="w-full md:w-80 flex-shrink-0 relative group">
                <div className="absolute -inset-1 bg-black/20 rounded-xl blur group-hover:blur-md transition-all"></div>
                <TShirtDisplay design={general.tShirtDesign} />
              </div>

              {/* Synopsis & Meta Column */}
              <div className="flex-grow space-y-6">
                <div className="bg-white/60 p-8 rounded-2xl border-2 border-black">
                  <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] mb-4 underline decoration-black/20">Synopsis</h3>
                  <p className="text-xl text-black leading-relaxed font-bold italic">"{general.synopsis}"</p>
                </div>
                
                {/* Critical Pulse (Description) brought to first page */}
                <div className="bg-black/5 border-2 border-black p-6 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    Critical Pulse
                  </h3>
                  <p className="text-black italic leading-relaxed text-sm font-bold">"{friendliness.overallReception}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/40 border-2 border-black p-6 rounded-xl">
                    <span className="text-[10px] font-black text-black/60 uppercase block mb-2">Director</span>
                    <p className="text-black font-black">{general.director}</p>
                  </div>
                  <div className="bg-white/40 border-2 border-black p-6 rounded-xl">
                    <span className="text-[10px] font-black text-black/60 uppercase block mb-2">Music Score</span>
                    <p className="text-black font-black">{general.musicScore || "Original Score"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/40 border-2 border-black p-6 rounded-xl md:col-span-2">
                <span className="text-[10px] font-black text-black/60 uppercase block mb-2">Lead Cast</span>
                <p className="text-black font-black">{general.actors.join(', ')}</p>
              </div>
              <div className="bg-white/40 border-2 border-black p-6 rounded-xl">
                <span className="text-[10px] font-black text-black/60 uppercase block mb-2">Where to Watch</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {general.whereToWatch.length > 0 ? general.whereToWatch.map((plat, i) => (
                    <span key={i} className="bg-black text-[#FFD700] px-3 py-1 rounded-full text-xs font-black border border-black">{plat}</span>
                  )) : <span className="text-black/40 text-xs font-bold">Varies by Region</span>}
                </div>
              </div>
            </div>
          </div>
        ) : friendliness && (
          <div className="animate-fade-in space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/60 border-2 border-black p-6 rounded-2xl">
                <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-3 flex items-center gap-2">Who it is FOR</h3>
                <p className="text-black leading-relaxed font-bold italic">"{friendliness.idealFor}"</p>
              </div>
              <div className="bg-white/60 border-2 border-black p-6 rounded-2xl">
                <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-3 flex items-center gap-2">Who it is NOT FOR</h3>
                <p className="text-black leading-relaxed font-bold italic">"{friendliness.notFor}"</p>
              </div>
            </div>

            <div className="bg-white/80 border-2 border-black p-8 rounded-2xl shadow-lg relative overflow-hidden">
              <h3 className="text-xs font-black text-black uppercase tracking-[0.3em] mb-4 underline decoration-black/20">References</h3>
              <div className="text-black leading-relaxed relative z-10 whitespace-pre-wrap font-bold">{friendliness.lorePrerequisites}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white/60 border-2 border-black p-6 rounded-2xl">
                  <h3 className="text-xs font-black text-black uppercase tracking-widest mb-4">Critical Pulse</h3>
                  <p className="text-black leading-relaxed font-bold">"{friendliness.overallReception}"</p>
                </div>
                <div className="bg-white/60 border-2 border-black p-6 rounded-2xl">
                  <h3 className="text-xs font-black text-black uppercase tracking-widest mb-4">Content Advisory</h3>
                  <p className="text-black leading-relaxed text-sm font-bold">{friendliness.contentAdvisory}</p>
                </div>
              </div>

              <div className="bg-white/80 border-2 border-black p-8 rounded-2xl shadow-xl">
                <h3 className="text-xs font-black text-black uppercase tracking-widest mb-6 underline decoration-black/20">Sensitivity Heatmap</h3>
                <div className="grid grid-cols-1 gap-1">
                  <ScoreBar label="Nudity & Sex" score={friendliness.sensitivity.nuditySex} color="text-black" />
                  <ScoreBar label="Violence & Gore" score={friendliness.sensitivity.violenceGore} color="text-black" />
                  <ScoreBar label="Profanity" score={friendliness.sensitivity.profanity} color="text-black" />
                  <ScoreBar label="Awkwardness Factor" score={friendliness.sensitivity.awkwardnessFactor} color="text-black" />
                  <ScoreBar label="Scary / Intensity" score={friendliness.sensitivity.scaryIntensity} color="text-black" />
                  <ScoreBar label="Draggy / Pacing" score={friendliness.sensitivity.pacingDrag} color="text-black" />
                  <ScoreBar label="Complexity" score={friendliness.sensitivity.complexity} color="text-black" />
                  <ScoreBar label="Subtext / Risks" score={friendliness.sensitivity.subtextRisk} color="text-black" />
                  <ScoreBar label="Brainrot Level" score={friendliness.sensitivity.brainrot} color="text-black" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LaTeX-INSPIRED PDF TEMPLATE */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={pdfRef} className="pdf-template">
          <div className="watermark">CINEVAULT</div>
          
          <div style={{ textAlign: 'center', marginBottom: '30pt' }}>
            <p style={{ fontSize: '10pt', letterSpacing: '2pt', fontWeight: 'bold' }}>CINE-VAULT INTELLIGENCE SERVICES</p>
            <p style={{ fontSize: '8pt' }}>Social Viewing & Group Safety Division</p>
          </div>

          <h1>Report: {general.title}</h1>
          
          <div className="metadata-block">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><strong>Report ID:</strong> {reportId}</div>
              <div><strong>Date of Record:</strong> {new Date().toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5pt' }}>
              <div><strong>Movie Title (and year):</strong> {general.title} ({general.year})</div>
            </div>
          </div>

          <h2><span className="section-num">1</span> Synopsis</h2>
          <div style={{ display: 'flex', gap: '20pt', marginBottom: '15pt' }}>
            <div style={{ width: '180pt' }}>
              <TShirtDisplay design={general.tShirtDesign} />
            </div>
            <div style={{ flex: 1 }}>
              <p>{general.synopsis}</p>
              <div style={{ marginTop: '10pt', fontSize: '11pt' }}>
                <strong>Director:</strong> {general.director}<br/>
                <strong>Cast:</strong> {general.actors.join(', ')}
              </div>
            </div>
          </div>

          <h2><span className="section-num">2</span> Social Impact Assessment</h2>
          <div style={{ backgroundColor: '#f9f9f9', padding: '15pt', borderLeft: '3pt solid #333' }}>
            {/* Removed Universal Safety Rating percentage */}
            <p style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Social Narrative Summary:</p>
            <p style={{ fontStyle: 'italic', marginTop: '5pt' }}>{friendliness?.overallReception}</p>
          </div>

          <h3>2.1 Who it is FOR</h3>
          <p>{friendliness?.idealFor}</p>

          <h3>2.2 Who it is NOT FOR</h3>
          <p>{friendliness?.notFor}</p>

          <h3>2.3 References</h3>
          <div style={{ whiteSpace: 'pre-wrap' }}>{friendliness?.lorePrerequisites}</div>

          <div style={{ pageBreakBefore: 'always' }}></div>

          <h2><span className="section-num">3</span> Technical Analysis & Risks</h2>
          <h3>3.1 Sensitivity Heatmap (Scalar 0-10)</h3>
          {friendliness && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10pt', marginTop: '10pt' }}>
               <div style={{ borderBottom: '1pt solid #eee' }}>Nudity & Sexual Content: <strong>{friendliness.sensitivity.nuditySex}</strong></div>
               <div style={{ borderBottom: '1pt solid #eee' }}>Violence & Gore: <strong>{friendliness.sensitivity.violenceGore}</strong></div>
               <div style={{ borderBottom: '1pt solid #eee' }}>Lexical Profanity: <strong>{friendliness.sensitivity.profanity}</strong></div>
               <div style={{ borderBottom: '1pt solid #eee' }}>Interpersonal Awkwardness: <strong>{friendliness.sensitivity.awkwardnessFactor}</strong></div>
               <div style={{ borderBottom: '1pt solid #eee' }}>Fear/Terror Intensity: <strong>{friendliness.sensitivity.scaryIntensity}</strong></div>
               <div style={{ borderBottom: '1pt solid #eee' }}>Pacing/Narrative Drag: <strong>{friendliness.sensitivity.pacingDrag}</strong></div>
               <div style={{ borderBottom: '1pt solid #eee' }}>Cognitive Complexity: <strong>{friendliness.sensitivity.complexity}</strong></div>
               <div style={{ borderBottom: '1pt solid #eee' }}>Cultural/Subtextual Risk: <strong>{friendliness.sensitivity.subtextRisk}</strong></div>
               <div style={{ borderBottom: '1pt solid #eee' }}>Substantive Quality (Brainrot): <strong>{friendliness.sensitivity.brainrot}</strong></div>
            </div>
          )}

          <h3>3.2 Content Advisory</h3>
          <p>{friendliness?.contentAdvisory}</p>

          <h2><span className="section-num">4</span> Operative Recommendations</h2>
          <p style={{ backgroundColor: '#333', color: 'white !important', padding: '10pt', fontWeight: 'bold' }}>
            PRO TIP: {friendliness?.proTips}
          </p>

          <div style={{ marginTop: '50pt', borderTop: '1pt solid #ccc', paddingTop: '10pt', fontSize: '9pt', textAlign: 'center' }}>
            END OF REPORT - CINE-VAULT SECURE DATASET
          </div>
        </div>
      </div>

      {sources.length > 0 && (
        <div className="mt-12 border-t border-gray-800 pt-6 no-print">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">Reference Data Grounding</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {sources.map((source, idx) => (
              <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-cine-gray hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition-all uppercase font-bold tracking-wider">{source.title || new URL(source.uri).hostname}</a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
