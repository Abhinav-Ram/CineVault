
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AnalysisData } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface CineChatProps {
  movieData: AnalysisData;
  onClose: () => void;
}

/**
 * A lightweight Markdown-lite formatter for chatbot responses.
 * Handles bolding (**text**) and bullet points (* or -).
 */
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, lineIdx) => {
        // Handle Bullet Points
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          const content = line.trim().substring(2);
          return (
            <div key={lineIdx} className="flex gap-2 pl-2">
              <span className="text-cine-accent">•</span>
              <span className="flex-grow">{renderInline(content)}</span>
            </div>
          );
        }

        // Handle Empty Lines (Paragraph Breaks)
        if (!line.trim()) return <div key={lineIdx} className="h-2" />;

        // Standard Line
        return <div key={lineIdx}>{renderInline(line)}</div>;
      })}
    </div>
  );
};

const renderInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-black text-black text-[11px] uppercase tracking-tight">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export const CineChat: React.FC<CineChatProps> = ({ movieData, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Chat Session with context
  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemPrompt = `
      You are an expert film analyst at CineVault. You are chatting with a user about the movie: ${movieData.general.title} (${movieData.general.year}).
      
      HERE IS THE DATA FROM THE REPORT WE JUST GENERATED:
      - Synopsis: ${movieData.general.synopsis}
      - Director: ${movieData.general.director}
      - Main Cast: ${movieData.general.actors.join(', ')}
      - Friendliness Score: ${movieData.friendliness.friendlinessScore}/100
      - References & Prerequisites: ${movieData.friendliness.lorePrerequisites}
      - Sensitivity Heatmap: 
        Nudity: ${movieData.friendliness.sensitivity.nuditySex}/10, 
        Violence: ${movieData.friendliness.sensitivity.violenceGore}/10, 
        Profanity: ${movieData.friendliness.sensitivity.profanity}/10, 
        Awkwardness: ${movieData.friendliness.sensitivity.awkwardnessFactor}/10
      - Content Advisory: ${movieData.friendliness.contentAdvisory}
      - Expert Pro-Tip: ${movieData.friendliness.proTips}

      Your goal is to answer questions about this movie based on this data and your general knowledge. 
      Use Markdown formatting:
      - Use **bold** for movie titles, important warnings, or names.
      - Use bullet points (* ) for lists of reasons or advice.
      
      Be concise, slightly witty, and help the user decide if they should watch it tonight.
      Never reveal spoilers unless the user specifically asks for them.
    `;

    chatInstance.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemPrompt,
      },
    });

    // Initial greeting
    setMessages([{ role: 'model', text: `Agent online. Any specific questions about **${movieData.general.title}** or our report findings?` }]);
  }, [movieData]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatInstance.current.sendMessage({ message: userMsg });
      const text = response.text;
      setMessages(prev => [...prev, { role: 'model', text: text }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Signal lost. My neural link to the database was interrupted. Try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-10rem)] bg-white border-2 border-black rounded-2xl shadow-2xl flex flex-col z-[100] animate-fade-in no-print overflow-hidden">
      {/* Header */}
      <div className="bg-black p-4 border-b-2 border-black flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">Cine-Chat: {movieData.general.title}</span>
        </div>
        <button onClick={onClose} className="text-[#FFD700] hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide bg-white/10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-[12px] leading-relaxed shadow-sm border-2 ${
              msg.role === 'user' 
                ? 'bg-black text-[#FFD700] border-black rounded-br-none' 
                : 'bg-white text-black border-black rounded-bl-none font-bold'
            }`}>
              {msg.role === 'model' ? <FormattedMessage text={msg.text} /> : msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-black border-2 border-black rounded-xl rounded-bl-none p-3 text-[10px] flex gap-1 font-black">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce [animation-delay:0.2s]">.</span>
              <span className="animate-bounce [animation-delay:0.4s]">.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t-2 border-black flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow bg-white border-2 border-black rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black/20 placeholder-black/40 font-handwriting text-sm"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="bg-black hover:bg-gray-900 text-[#FFD700] p-2 rounded-lg transition-colors disabled:opacity-50 shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};
