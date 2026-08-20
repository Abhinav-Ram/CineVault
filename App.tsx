
import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { SearchBar } from './components/SearchBar';
import { AnalysisResult } from './components/AnalysisResult';
import { DisambiguationOptions } from './components/DisambiguationOptions';
import { RecommendationTab } from './components/RecommendationTab';
import { MovieMatcherTab } from './components/MovieMatcherTab';
import { MovieComparerTab } from './components/MovieComparerTab';
import { MovieEditzTab } from './components/MovieEditzTab';
import { analyzeMovie, identifyMovieCandidates, getRecommendations, getSimilarMovies, compareMovies, getMovieEditz, getSingleRecommendationReplacement, getSingleSimilarityReplacement } from './services/geminiService';
import { AnalysisData, LoadingStage, MovieRecommendation, MovieCandidate, LanguageGroup, RecommendationRequirements, SimilarityRequest, Tab, ComparisonResult, MovieEditData } from './types';
import { animate, motion, AnimatePresence } from 'motion/react';

import { Popcorn, Clapperboard, Film, Glasses, Megaphone, CupSoda, Lightbulb, Trophy, Armchair, Candy, Ticket, Camera, Tv, Star, Play, Monitor, Menu, X } from 'lucide-react';

const ReelMenu: React.FC<{ activeTab: Tab; onTabChange: (tab: Tab) => void }> = ({ activeTab, onTabChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'ANALYZER', label: 'MOVIE CHECKER' },
    { id: 'MOVIE_EDITZZZ', label: 'MOVIE EDITZZZ' },
    { id: 'RECOMMENDER', label: 'MOVIE PICKER' },
    { id: 'MATCHER', label: 'MOVIE MATCHER' },
    { id: 'COMPARER', label: 'MOVIE COMPARER' },
  ];

  return (
    <div className="fixed top-6 left-6 z-[100]">
      {/* The Reel Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-[#FFD700] shadow-2xl relative z-20 border-4 border-black group"
        whileHover={{ rotate: 15 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="absolute inset-2 border-2 border-dashed border-[#FFD700]/30 rounded-full"></div>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X size={32} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
            >
              <Film size={32} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* The Unrolling Tape */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="absolute top-8 left-8 w-64 bg-black pt-12 pb-6 px-2 rounded-b-3xl overflow-hidden shadow-[10px_10px_0px_rgba(0,0,0,0.2)]"
          >
            {/* Film Holes */}
            <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-around py-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-2 h-3 bg-[#FFD700]/20 rounded-sm"></div>
              ))}
            </div>
            <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-around py-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-2 h-3 bg-[#FFD700]/20 rounded-sm"></div>
              ))}
            </div>

            <div className="flex flex-col gap-1 relative z-10 pl-6 pr-6 pt-4">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ x: 10, backgroundColor: '#FFD700', color: '#000' }}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsOpen(false);
                  }}
                  className={`text-left py-4 px-4 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${
                    activeTab === tab.id ? 'bg-[#FFD700] text-black' : 'text-white/60'
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CinemaBackground: React.FC = () => {
  const icons = [
    { Icon: Popcorn, top: '5%', left: '5%', rotate: '15deg' },
    { Icon: Clapperboard, top: '12%', left: '88%', rotate: '-10deg' },
    { Icon: Film, top: '35%', left: '2%', rotate: '45deg' },
    { Icon: Glasses, top: '55%', left: '92%', rotate: '20deg' },
    { Icon: Megaphone, top: '75%', left: '8%', rotate: '-30deg' },
    { Icon: CupSoda, top: '25%', left: '78%', rotate: '10deg' },
    { Icon: Lightbulb, top: '3%', left: '42%', rotate: '0deg' },
    { Icon: Trophy, top: '65%', left: '38%', rotate: '15deg' },
    { Icon: Armchair, top: '45%', left: '82%', rotate: '-15deg' },
    { Icon: Candy, top: '18%', left: '18%', rotate: '25deg' },
    { Icon: Ticket, top: '82%', left: '68%', rotate: '-20deg' },
    { Icon: Camera, top: '8%', left: '62%', rotate: '110deg' },
    { Icon: Clapperboard, top: '88%', left: '28%', rotate: '5deg' },
    { Icon: Megaphone, top: '42%', left: '48%', rotate: '160deg' },
    { Icon: Popcorn, top: '28%', left: '32%', rotate: '-15deg' },
    { Icon: Film, top: '62%', left: '15%', rotate: '30deg' },
    { Icon: CupSoda, top: '92%', left: '85%', rotate: '-40deg' },
    { Icon: Star, top: '15%', left: '50%', rotate: '10deg' },
    { Icon: Play, top: '78%', left: '52%', rotate: '45deg' },
    { Icon: Tv, top: '52%', left: '65%', rotate: '-10deg' },
    { Icon: Monitor, top: '32%', left: '95%', rotate: '25deg' },
    { Icon: Ticket, top: '2%', left: '25%', rotate: '-5deg' },
    { Icon: Candy, top: '72%', left: '90%', rotate: '15deg' },
    { Icon: Glasses, top: '95%', left: '10%', rotate: '-15deg' },
  ];

  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-30">
      {icons.map((item, index) => (
        <div 
          key={index} 
          className="absolute text-black/80" 
          style={{ 
            top: item.top, 
            left: item.left, 
            transform: `rotate(${item.rotate})`,
          }}
        >
          <item.Icon size={72} strokeWidth={1.2} />
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ANALYZER');
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(LoadingStage.IDLE);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [recResults, setRecResults] = useState<LanguageGroup[] | null>(null);
  const [activeRecReqs, setActiveRecReqs] = useState<RecommendationRequirements | null>(null);
  const [matcherResults, setMatcherResults] = useState<MovieRecommendation[] | null>(null);
  const [activeMatcherSource, setActiveMatcherSource] = useState<string>('');
  const [activeMatcherReason, setActiveMatcherReason] = useState<string>('');
  const [replacingRecMap, setReplacingRecMap] = useState<Record<string, boolean>>({});
  const [replacingMatchMap, setReplacingMatchMap] = useState<Record<number, boolean>>({});
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult | null>(null);
  const [editzResults, setEditzResults] = useState<MovieEditData | null>(null);
  const [editzContext, setEditzContext] = useState<string>('');
  const [candidates, setCandidates] = useState<MovieCandidate[]>([]);
  const [includeSpoilers, setIncludeSpoilers] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [watchedMovies, setWatchedMovies] = useState<string[]>(() => {
    const saved = localStorage.getItem('cinevault_watched_movies');
    const movies = saved ? JSON.parse(saved) : [];
    return Array.isArray(movies) ? [...movies].sort((a, b) => a.localeCompare(b)) : [];
  });

  useEffect(() => {
    localStorage.setItem('cinevault_watched_movies', JSON.stringify(watchedMovies));
  }, [watchedMovies]);

  const handleAddWatched = (title: string) => {
    if (!watchedMovies.includes(title)) {
      setWatchedMovies([...watchedMovies, title].sort((a, b) => a.localeCompare(b)));
    }
  };

  const handleRemoveWatched = (title: string) => {
    setWatchedMovies(watchedMovies.filter(m => m !== title));
  };

  const handleEditWatched = (oldTitle: string, newTitle: string) => {
    setWatchedMovies(watchedMovies.map(m => m === oldTitle ? newTitle : m).sort((a, b) => a.localeCompare(b)));
  };

  const handleBulkUpdateWatched = (titles: string[]) => {
    setWatchedMovies([...titles].sort((a, b) => a.localeCompare(b)));
  };

  const performAnalysis = async (candidate: MovieCandidate) => {
    setLoadingStage(LoadingStage.ANALYZING);
    setCandidates([]);
    try {
      const result = await analyzeMovie(candidate, includeSpoilers);
      if (result.type === 'SUCCESS') {
        setAnalysisData(result.data);
        setLoadingStage(LoadingStage.COMPLETED);
      } else {
        setError("Could not analyze this specific movie. Please try another.");
        setLoadingStage(LoadingStage.ERROR);
      }
    } catch (err) {
      setError("Analysis failed. Please try again later.");
      setLoadingStage(LoadingStage.ERROR);
    }
  };

  const handleSearch = async (query: string, spoilers: boolean) => {
    setLoadingStage(LoadingStage.IDENTIFYING);
    setAnalysisData(null);
    setCandidates([]);
    setError(null);
    setIncludeSpoilers(spoilers);

    try {
      const foundCandidates = await identifyMovieCandidates(query);
      
      if (foundCandidates.length === 0) {
        setError("Movie not found in archive. Try being more specific!");
        setLoadingStage(LoadingStage.ERROR);
      } else if (foundCandidates.length === 1) {
        // Only one match? Immediate analysis
        await performAnalysis(foundCandidates[0]);
      } else {
        // Multiple matches? Disambiguate
        setCandidates(foundCandidates);
        setLoadingStage(LoadingStage.COMPLETED);
      }
    } catch (err) {
      setError("Search failed. Check your connection.");
      setLoadingStage(LoadingStage.ERROR);
    }
  };

  const handleCandidateSelect = async (candidate: MovieCandidate) => {
    if (activeTab === 'ANALYZER') {
      await performAnalysis(candidate);
    } else if (activeTab === 'MOVIE_EDITZZZ') {
      await performEditzAnalysis(candidate);
    } else if (activeTab === 'MATCHER') {
      await performMatcherAnalysis(candidate);
    }
  };

  const performEditzAnalysis = async (candidate: MovieCandidate, context?: string) => {
    setLoadingStage(LoadingStage.SEARCHING);
    setEditzResults(null);
    setCandidates([]);
    setError(null);
    try {
      const activeContext = context !== undefined ? context : editzContext;
      const results = await getMovieEditz(`${candidate.title} ${candidate.year}`, activeContext);
      if (results) {
        setEditzResults(results);
        setLoadingStage(LoadingStage.COMPLETED);
      } else {
        setError("Could not find vibe data for this movie.");
        setLoadingStage(LoadingStage.ERROR);
      }
    } catch (err) {
      setError("Search failed.");
      setLoadingStage(LoadingStage.ERROR);
    }
  };

  const performMatcherAnalysis = async (candidate: MovieCandidate) => {
    setLoadingStage(LoadingStage.MATCHING);
    setMatcherResults(null);
    setCandidates([]);
    setError(null);
    const sourceMovieStr = `${candidate.title} ${candidate.year}`;
    setActiveMatcherSource(sourceMovieStr);
    try {
      const results = await getSimilarMovies({ 
        sourceMovie: sourceMovieStr, 
        excludedMovies: watchedMovies 
      });
      setMatcherResults(results);
      setLoadingStage(LoadingStage.COMPLETED);
    } catch (err) {
      setError("Failed to find matches.");
      setLoadingStage(LoadingStage.ERROR);
    }
  };

  const handleGetRecommendations = async (reqs: RecommendationRequirements) => {
    setLoadingStage(LoadingStage.RECOMMENDING);
    setRecResults(null);
    setError(null);
    setActiveRecReqs(reqs);
    try {
      const results = await getRecommendations({ ...reqs, excludedMovies: watchedMovies });
      setRecResults(results);
      setLoadingStage(LoadingStage.COMPLETED);
    } catch (err) {
      setError("Failed to get recommendations.");
      setLoadingStage(LoadingStage.ERROR);
    }
  };

  const handleMatcherSearch = async (req: SimilarityRequest) => {
    setLoadingStage(LoadingStage.IDENTIFYING);
    setMatcherResults(null);
    setCandidates([]);
    setError(null);
    setActiveMatcherSource(req.sourceMovie);
    setActiveMatcherReason(req.reason || '');
    try {
      const foundCandidates = await identifyMovieCandidates(req.sourceMovie);
      if (foundCandidates.length === 0) {
        setError("Movie not found. Try a different title.");
        setLoadingStage(LoadingStage.ERROR);
      } else if (foundCandidates.length === 1) {
        await performMatcherAnalysis(foundCandidates[0]);
      } else {
        setCandidates(foundCandidates);
        setLoadingStage(LoadingStage.COMPLETED);
      }
    } catch (err) {
      setError("Failed to find matches.");
      setLoadingStage(LoadingStage.ERROR);
    }
  };

  const handleReplaceSingleRecommendation = async (groupIdx: number, movieIdx: number, language: string) => {
    if (!recResults || !activeRecReqs) return;
    const key = `${groupIdx}-${movieIdx}`;
    setReplacingRecMap(prev => ({ ...prev, [key]: true }));
    try {
      const currentTitles = recResults.flatMap(g => g.movies.map(m => m.title));
      const activeLanguage = language && language !== "Any Language Selection" && language !== "Any Language" ? language : undefined;
      const replacement = await getSingleRecommendationReplacement(
        activeRecReqs,
        currentTitles,
        activeLanguage
      );
      if (replacement) {
        setRecResults(prev => {
          if (!prev) return prev;
          const updated = [...prev];
          const group = { ...updated[groupIdx] };
          const movies = [...group.movies];
          movies[movieIdx] = replacement;
          group.movies = movies;
          updated[groupIdx] = group;
          return updated;
        });
      }
    } catch (err) {
      console.error("Replacement failed", err);
    } finally {
      setReplacingRecMap(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleReplaceSingleSimilarity = async (movieIdx: number) => {
    if (!matcherResults || !activeMatcherSource) return;
    setReplacingMatchMap(prev => ({ ...prev, [movieIdx]: true }));
    try {
      const currentTitles = matcherResults.map(m => m.title);
      const replacement = await getSingleSimilarityReplacement(
        activeMatcherSource,
        activeMatcherReason,
        currentTitles,
        watchedMovies
      );
      if (replacement) {
        setMatcherResults(prev => {
          if (!prev) return prev;
          const updated = [...prev];
          updated[movieIdx] = replacement;
          return updated;
        });
      }
    } catch (err) {
      console.error("Similarity replacement failed", err);
    } finally {
      setReplacingMatchMap(prev => ({ ...prev, [movieIdx]: false }));
    }
  };

  const handleCompare = async (titles: string[], preferences?: string) => {
    setLoadingStage(LoadingStage.COMPARING);
    setComparisonResults(null);
    setError(null);
    try {
      const results = await compareMovies(titles, preferences);
      setComparisonResults(results);
      setLoadingStage(LoadingStage.COMPLETED);
    } catch (err) {
      setError("Failed to perform comparison.");
      setLoadingStage(LoadingStage.ERROR);
    }
  };

  const handleEditzSearch = async (query: string, context?: string) => {
    const activeContext = context || '';
    setEditzContext(activeContext);
    setLoadingStage(LoadingStage.IDENTIFYING);
    setEditzResults(null);
    setCandidates([]);
    setError(null);
    try {
      const foundCandidates = await identifyMovieCandidates(query);
      if (foundCandidates.length === 0) {
        setError("Movie not found. Try a different title.");
        setLoadingStage(LoadingStage.ERROR);
      } else if (foundCandidates.length === 1) {
        await performEditzAnalysis(foundCandidates[0], activeContext);
      } else {
        setCandidates(foundCandidates);
        setLoadingStage(LoadingStage.COMPLETED);
      }
    } catch (err) {
      setError("Search failed.");
      setLoadingStage(LoadingStage.ERROR);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setRecResults(null);
    setMatcherResults(null);
    setComparisonResults(null);
    setEditzResults(null);
    setEditzContext('');
    setCandidates([]);
    setLoadingStage(LoadingStage.IDLE);
    setError(null);
  };

  const isShowingResults = !!analysisData || !!recResults || !!matcherResults || !!comparisonResults || !!editzResults || candidates.length > 0;

  return (
    <div className="min-h-screen bg-[#FFD700] text-black selection:bg-black selection:text-[#FFD700] flex flex-col font-serif relative">
      <CinemaBackground />
      <ReelMenu activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); handleReset(); }} />

      <main className="flex-grow container mx-auto px-4 sm:px-6 relative z-10 pt-24 md:pt-32">
        {activeTab === 'ANALYZER' && (
          <>
            {!isShowingResults && loadingStage === LoadingStage.IDLE && <Hero />}
            <div className={`transition-all duration-500 ${isShowingResults || loadingStage !== LoadingStage.IDLE ? 'mb-8' : 'pb-10'}`}>
               {isShowingResults && (analysisData || candidates.length > 0) ? (
                 <div className="flex justify-between items-center max-w-4xl mx-auto mb-6 bg-white/40 p-4 rounded-lg backdrop-blur-sm border border-black/20">
                    <h1 className="text-xl font-bold text-black">Full <span className="text-black underline decoration-double">Movie Report</span></h1>
                    <button onClick={handleReset} className="text-xs text-black/60 hover:text-black underline">New Search</button>
                 </div>
               ) : (
                 loadingStage === LoadingStage.IDLE && <SearchBar onSearch={handleSearch} isLoading={false} />
               )}
            </div>

            {(loadingStage === LoadingStage.IDENTIFYING || loadingStage === LoadingStage.ANALYZING) && (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                 <div className="w-16 h-16 border-4 border-black/20 border-t-black rounded-full animate-spin mb-6"></div>
                 <p className="text-xl font-black text-black uppercase tracking-widest">
                   {loadingStage === LoadingStage.IDENTIFYING ? 'Identifying Target...' : 'Compiling Pro Report...'}
                 </p>
              </div>
            )}

            {candidates.length > 0 && <DisambiguationOptions candidates={candidates} onSelect={handleCandidateSelect} onCancel={handleReset} />}
            {analysisData && <AnalysisResult data={analysisData} onReset={handleReset} />}
          </>
        )}

        {activeTab === 'MOVIE_EDITZZZ' && (
          <MovieEditzTab onSearch={handleEditzSearch} results={editzResults} isLoading={loadingStage === LoadingStage.SEARCHING || loadingStage === LoadingStage.IDENTIFYING} onReset={handleReset} candidates={candidates} onSelect={handleCandidateSelect} />
        )}

        {activeTab === 'RECOMMENDER' && (
          <RecommendationTab onGetRecommendations={handleGetRecommendations} results={recResults} isLoading={loadingStage === LoadingStage.RECOMMENDING} onReset={handleReset} onReplaceMovie={handleReplaceSingleRecommendation} replacingMap={replacingRecMap} />
        )}

        {activeTab === 'MATCHER' && (
          <MovieMatcherTab onSearchSimilar={handleMatcherSearch} results={matcherResults} isLoading={loadingStage === LoadingStage.IDENTIFYING || loadingStage === LoadingStage.MATCHING} onReset={handleReset} candidates={candidates} onCandidateSelect={handleCandidateSelect} onReplaceMovie={handleReplaceSingleSimilarity} replacingMap={replacingMatchMap} />
        )}

        {activeTab === 'COMPARER' && (
          <MovieComparerTab onCompare={handleCompare} results={comparisonResults} isLoading={loadingStage === LoadingStage.COMPARING} onReset={handleReset} />
        )}

        {error && (
          <div className="max-w-2xl mx-auto bg-white/40 border-2 border-black rounded-lg p-6 text-center animate-fade-in my-8">
            <p className="text-black font-black">{error}</p>
            <button onClick={handleReset} className="mt-4 text-sm text-black/60 hover:text-black font-bold underline">Back to Search</button>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-black text-[10px] md:text-xs tracking-widest uppercase font-bold">
        {"CineVault • Story, Screenplay, Direction: [|@~<*>]~{#}|<@~|"}
      </footer>
    </div>
  );
};

export default App;
