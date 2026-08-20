import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="text-center py-12 md:py-20 animate-fade-in-down">
      <div className="inline-block p-2 px-4 rounded-full bg-black border border-black mb-6 shadow-xl">
        <span className="text-[#FFD700] text-xs font-bold tracking-[0.2em] uppercase">
          Safe Bets Only
        </span>
      </div>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight text-black mb-6">
        Is this movie <br/>
        <span className="underline decoration-black decoration-4">
          "Movie Night"
        </span> Friendly?
      </h1>
      <p className="text-lg text-black/80 max-w-xl mx-auto mb-8 leading-relaxed font-bold">
        Avoid the awkwardness. We analyze reviews from IMDb, Letterboxd, and Metacritic to tell you if it's safe for the group chat.
      </p>
    </div>
  );
};