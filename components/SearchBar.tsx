import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string, includeSpoilers: boolean) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [includeSpoilers, setIncludeSpoilers] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query, includeSpoilers);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center bg-white rounded-2xl p-1 border-2 border-black shadow-2xl z-10 overflow-hidden">
          <svg className="w-6 h-6 text-black ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="w-full bg-transparent text-black text-2xl px-2 py-1.5 focus:outline-none placeholder-black/40 font-handwriting"
            placeholder="Movie Title (e.g. The Host (2006))"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all duration-200 ${
              isLoading || !query.trim()
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-black hover:bg-gray-900 shadow-lg'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </span>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
        
        {/* Options Row */}
        <div className="flex justify-end mt-3 px-1">
          <label className="flex items-center space-x-2 cursor-pointer group/label">
            <div className="relative">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={includeSpoilers}
                onChange={(e) => setIncludeSpoilers(e.target.checked)}
              />
              <div className="w-5 h-5 border-2 border-black rounded bg-white peer-checked:bg-black peer-checked:border-black transition-all"></div>
              <svg className="absolute top-1 left-1 w-3 h-3 text-[#FFD700] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="text-sm text-black font-bold group-hover/label:underline transition-colors select-none">
              Include Spoilers (Plot details)
            </span>
          </label>
        </div>
      </form>
    </div>
  );
};