
import { GoogleGenAI, Type } from "@google/genai";
export const getMovieEditz = async (query: string, context?: string): Promise<MovieEditData | null> => {
  try {
    const contextPrompt = context ? `\n\nApply the following emotion/context/vibe constraint for the generation (especially affecting the tone of the Letterboxd/TikTok-style reviews, hook, and mood): "${context}". If the context indicates a negative or critical opinion (e.g., "it was a bad movie" or "hated it"), make sure the letterboxdReviews reflect this negativity, disappointment, or sarcastic dislike.` : '';
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate an "Insta-style Edit Profile" for the movie matching: "${query}".${contextPrompt}
      
      Requirements:
      1. title & year: Factual title and release year.
      2. hook: A single, punchy, "main character energy" sentence that makes the movie sound incredibly cool/inviting, adjusted to the emotion/context if provided.
      3. moodSummary: A brief (2 sentence) description of the specific 'aesthetic' and mood (lighting, sound, vibe), reflecting the context if provided.
      4. transitions: 3-4 rich, evocative descriptions of cinematic moments or sequences that define the movie's soul. Describe them with sensory detail (lighting, texture, sound, motion) as if explaining a "core memory" or a viral edit moment to a friend. Focus on the "vibe" and "aesthetic" rather than dry technical camera movements.
      5. letterboxdReviews: 3-4 witty, short, one-liner style reviews that sound like authentic Letterboxd users (sarcastic, obsessed, or overly dramatic). Use creative usernames.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            year: { type: Type.STRING },
            hook: { type: Type.STRING },
            moodSummary: { type: Type.STRING },
            transitions: { type: Type.ARRAY, items: { type: Type.STRING } },
            letterboxdReviews: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  user: { type: Type.STRING },
                  text: { type: Type.STRING },
                  rating: { type: Type.NUMBER }
                },
                required: ["user", "text", "rating"]
              }
            }
          },
          required: ["title", "year", "hook", "moodSummary", "transitions", "letterboxdReviews"]
        }
      }
    });
    const text = response.text || "{}";
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson || "null");
  } catch (error) {
    console.error("Movie Editz Error:", error);
    return null;
  }
};

import { AnalysisResult, MovieCandidate, MovieRecommendation, LanguageGroup, RecommendationRequirements, SimilarityRequest, ComparisonResult, MovieEditData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Stage 1: Identification
 * Quickly find factual metadata for candidates matching the query.
 */
export const identifyMovieCandidates = async (query: string): Promise<MovieCandidate[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for movies matching: "${query}". Identify the correct Title, Release Year, Director, and Lead Cast for the top 1-4 potential matches.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              year: { type: Type.STRING },
              director: { type: Type.STRING },
              actors: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "year", "director", "actors"]
          }
        }
      }
    });
    const text = response.text || "[]";
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson || "[]");
  } catch (error) {
    console.error("Identification Error:", error);
    return [];
  }
};

/**
 * Stage 2: Deep Analysis
 * Analyze a specific movie using provided metadata to ensure grounding.
 */
export const analyzeMovie = async (candidate: MovieCandidate, includeSpoilers: boolean): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a deep social analysis of the movie "${candidate.title} (${candidate.year})" directed by ${candidate.director}. 
      Include details about the cast: ${candidate.actors.join(', ')}. 
      Spoilers allowed: ${includeSpoilers}.`,
      config: {
        systemInstruction: `You are a world-class film critic. Provide a surgical social analysis for "Movie Night Friendliness".

        IMPORTANT - T-SHIRT DESIGN:
        Instead of a movie poster, create a "T-Shirt Design" for this movie.
        1. "backgroundColor": A hex code that respects the movie's theme/color theory.
        2. "textColor": A hex code for the text that contrasts well with the background.
        3. "iconName": A Lucide icon name (e.g., 'Ghost', 'Heart', 'Skull', 'Zap', 'Brain', 'Smile', 'Flame', 'Rocket', 'Sword', 'Music', 'Eye', 'Moon', 'Sun', 'Anchor', 'Coffee', 'Pizza', 'Dog', 'Cat', 'Bird', 'Tree', 'Mountain', 'Waves', 'Wind', 'Snowflake', 'Umbrella', 'Briefcase', 'GraduationCap', 'Trophy', 'Medal', 'Target', 'Flag', 'Bell', 'Gift', 'Camera', 'Video', 'Mic', 'Headphones', 'Monitor', 'Smartphone', 'Laptop', 'Globe', 'Map', 'Compass', 'Navigation', 'Clock', 'Watch', 'Calendar', 'Mail', 'Phone', 'Lock', 'Unlock', 'Key', 'Search', 'Settings', 'User', 'Users', 'Home', 'ShoppingCart', 'CreditCard', 'Wallet', 'Banknote', 'Coins', 'BarChart', 'PieChart', 'LineChart', 'Activity', 'HeartPulse', 'Stethoscope', 'Syringe', 'Pill', 'Thermometer', 'Droplets', 'Leaf', 'Flower', 'Bug', 'Fish', 'PawPrint', 'Bone', 'Footprints', 'Hand', 'Fingerprint', 'Scan', 'Cpu', 'HardDrive', 'Database', 'Server', 'Cloud', 'Wifi', 'Bluetooth', 'Battery', 'Plug', 'Power', 'Lightbulb', 'Flashlight', 'Hammer', 'Wrench', 'Screwdriver', 'Axe', 'Pickaxe', 'Shovel', 'Brush', 'Pen', 'Pencil', 'Eraser', 'Scissors', 'Paperclip', 'StickyNote', 'Book', 'Library', 'Newspaper', 'School', 'Building', 'Factory', 'Warehouse', 'Store', 'ShoppingBag', 'Tag', 'Ticket', 'Plane', 'Train', 'Bus', 'Car', 'Bike', 'Truck', 'Ship', 'LifeBuoy', 'MapPin', 'Check', 'X', 'AlertTriangle', 'Info', 'HelpCircle', 'Minus', 'Plus', 'Divide', 'Equal', 'Percent', 'Hash', 'AtSign', 'DollarSign', 'EuroSign', 'PoundSign', 'IndianRupeeSign', 'YenSign', 'Bitcoin', 'Copyright', 'Registered', 'Trademark', 'Command', 'Option', 'Control', 'Shift', 'Delete', 'Enter', 'Escape', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ChevronUp', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronsUp', 'ChevronsDown', 'ChevronsLeft', 'ChevronsRight', 'ArrowUpLeft', 'ArrowUpRight', 'ArrowDownLeft', 'ArrowDownRight', 'Maximize', 'Minimize', 'Expand', 'Shrink', 'ExternalLink', 'Link', 'Unlink', 'Share', 'Download', 'Upload', 'RefreshCw', 'RefreshCcw', 'RotateCw', 'RotateCcw', 'Play', 'Pause', 'Stop', 'SkipBack', 'SkipForward', 'FastForward', 'Rewind', 'Volume', 'Volume1', 'Volume2', 'VolumeX', 'Mute', 'Speaker', 'Disc', 'Layers', 'Layout', 'Grid', 'List', 'Menu', 'MoreHorizontal', 'MoreVertical', 'CheckCircle', 'CheckSquare', 'Circle', 'Square', 'Triangle', 'Hexagon', 'Octagon', 'Star', 'ThumbsUp', 'ThumbsDown', 'Meh', 'Angry', 'Laugh', 'Wink', 'Tongue', 'Annoyed', 'Confused', 'Dizzy', 'Expressionless', 'Eyes', 'Flushed', 'Grimace', 'Grin', 'Kiss', 'Mask', 'Mouth', 'Neutral', 'NoMouth', 'Pensive', 'Relieved', 'RollingEyes', 'Sleeping', 'SlightlyFrown', 'SlightlySmile', 'Sweat', 'Thinking', 'UpsideDown', 'Vomit', 'Zzz') that reflects the movie's theme.
        4. "phrase": A short, catchy, spoiler-free phrase reflecting the movie's emotion.
        5. "fontFamily": One of ('serif', 'sans-serif', 'monospace', 'cursive', 'fantasy') that best fits the movie's vibe.

        Focus on:
        1. "Movie Night Friendliness" (suitability for specific groups).
        2. Sensitivity Heatmap (0-10) for content risks.
        3. Factual Synopsis and Cast details.
        
        Be honest, witty, and grounded.`,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            general: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                year: { type: Type.STRING },
                synopsis: { type: Type.STRING },
                director: { type: Type.STRING },
                actors: { type: Type.ARRAY, items: { type: Type.STRING } },
                musicScore: { type: Type.STRING },
                posterUrl: { type: Type.STRING, description: "Direct vertical poster image URL" },
                tShirtDesign: {
                  type: Type.OBJECT,
                  properties: {
                    backgroundColor: { type: Type.STRING },
                    textColor: { type: Type.STRING },
                    iconName: { type: Type.STRING },
                    phrase: { type: Type.STRING },
                    fontFamily: { type: Type.STRING, enum: ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'] }
                  },
                  required: ["backgroundColor", "textColor", "iconName", "phrase", "fontFamily"]
                },
                youtubeTrailerId: { type: Type.STRING },
                whereToWatch: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            friendliness: {
              type: Type.OBJECT,
              properties: {
                friendlinessScore: { type: Type.NUMBER },
                overallReception: { type: Type.STRING },
                idealFor: { type: Type.STRING },
                notFor: { type: Type.STRING },
                lorePrerequisites: { type: Type.STRING },
                sensitivity: {
                  type: Type.OBJECT,
                  properties: {
                    nuditySex: { type: Type.NUMBER },
                    violenceGore: { type: Type.NUMBER },
                    profanity: { type: Type.NUMBER },
                    awkwardnessFactor: { type: Type.NUMBER },
                    pacingDrag: { type: Type.NUMBER },
                    complexity: { type: Type.NUMBER },
                    brainrot: { type: Type.NUMBER },
                    scaryIntensity: { type: Type.NUMBER },
                    subtextRisk: { type: Type.NUMBER }
                  }
                },
                contentAdvisory: { type: Type.STRING },
                proTips: { type: Type.STRING }
              }
            }
          }
        }
      },
    });

    const text = response.text || "{}";
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedJson || "{}");
    if (!result.general) return { type: 'NOT_FOUND' };

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter((s: any): s is { title: string; uri: string } => s !== null);

    return {
      type: 'SUCCESS',
      data: { 
        general: { ...result.general, title: candidate.title, year: candidate.year }, 
        friendliness: result.friendliness, 
        sources 
      }
    };
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const getRecommendations = async (reqs: RecommendationRequirements): Promise<LanguageGroup[]> => {
  try {
    const exclusionPrompt = reqs.excludedMovies && reqs.excludedMovies.length > 0 
      ? `\nIMPORTANT: DO NOT recommend any of these movies as the user has already watched them: ${reqs.excludedMovies.join(', ')}.`
      : '';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Curate movie picks: ${JSON.stringify(reqs)}.${exclusionPrompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              language: { type: Type.STRING },
              movies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    year: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    suitability: { type: Type.STRING }
                  }
                }
              }
            }
          }
        },
        tools: [{ googleSearch: {} }]
      }
    });
    const text = response.text || "[]";
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson || "[]");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSimilarMovies = async (req: SimilarityRequest): Promise<MovieRecommendation[]> => {
  try {
    const exclusionPrompt = req.excludedMovies && req.excludedMovies.length > 0 
      ? `\nIMPORTANT: DO NOT recommend any of these movies as the user has already watched them: ${req.excludedMovies.join(', ')}.`
      : '';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find 5 movies similar to "${req.sourceMovie}".${exclusionPrompt}`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              year: { type: Type.STRING },
              reason: { type: Type.STRING },
              suitability: { type: Type.STRING }
            }
          }
        }
      }
    });
    const text = response.text || "[]";
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson || "[]");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSingleRecommendationReplacement = async (
  reqs: RecommendationRequirements,
  currentMoviesToAvoid: string[],
  languageContext?: string
): Promise<MovieRecommendation | null> => {
  try {
    const avoidList = [...(reqs.excludedMovies || []), ...currentMoviesToAvoid];
    const avoidPrompt = avoidList.length > 0 
      ? `\nIMPORTANT: DO NOT recommend any of these movies (user has watched them or they are already on the current list): ${avoidList.join(', ')}.`
      : '';
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find exactly ONE alternative movie recommendation based on these parameters: ${JSON.stringify(reqs)}.${languageContext ? ` The replacement movie MUST be in ${languageContext} language.` : ''}${avoidPrompt} Provide it in the standard movie recommendation structure.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            year: { type: Type.STRING },
            reason: { type: Type.STRING },
            suitability: { type: Type.STRING }
          },
          required: ["title", "year", "reason", "suitability"]
        },
        tools: [{ googleSearch: {} }]
      }
    });
    const text = response.text || "{}";
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson || "null");
  } catch (error) {
    console.error("Replacement Error:", error);
    return null;
  }
};

export const getSingleSimilarityReplacement = async (
  sourceMovie: string,
  userReason: string,
  currentMoviesToAvoid: string[],
  userExcludedMovies?: string[]
): Promise<MovieRecommendation | null> => {
  try {
    const avoidList = [...(userExcludedMovies || []), ...currentMoviesToAvoid];
    const avoidPrompt = avoidList.length > 0 
      ? `\nIMPORTANT: DO NOT recommend any of these movies: ${avoidList.join(', ')}.`
      : '';
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find exactly ONE alternative movie recommendation similar to the movie "${sourceMovie}" (context/user liked it because: ${userReason || 'Not specified'}).${avoidPrompt} Provide it in the standard movie recommendation structure.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            year: { type: Type.STRING },
            reason: { type: Type.STRING },
            suitability: { type: Type.STRING }
          },
          required: ["title", "year", "reason", "suitability"]
        },
        tools: [{ googleSearch: {} }]
      }
    });
    const text = response.text || "{}";
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson || "null");
  } catch (error) {
    console.error("Similarity Replacement Error:", error);
    return null;
  }
};

export const compareMovies = async (movieTitles: string[], userPreferences?: string): Promise<ComparisonResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a head-to-head comparison of these movies: ${movieTitles.join(', ')}. 
      Optional User Preferences: ${userPreferences || 'None'}.
      
      Map their technical and emotional DNA. Analyze pacing rhythm (Slow Burn vs. Rapid Fire), cognitive load (Casual Viewing vs. High-Effort Puzzle), and tonal friction (Nostalgic Comfort vs. Gritty Realism).
      Quantify the "vibe gap" and provide a tie-breaker recommendation based on mental bandwidth.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            movies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  year: { type: Type.STRING },
                  pacing: { type: Type.STRING },
                  cognitiveLoad: { type: Type.STRING },
                  tonalFriction: { type: Type.STRING },
                  vibeScore: { type: Type.NUMBER }
                },
                required: ["title", "year", "pacing", "cognitiveLoad", "tonalFriction", "vibeScore"]
              }
            },
            vibeGapAnalysis: { type: Type.STRING },
            tieBreakerRecommendation: { type: Type.STRING },
            comparisonPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  details: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["category", "details"]
              }
            }
          },
          required: ["movies", "vibeGapAnalysis", "tieBreakerRecommendation", "comparisonPoints"]
        }
      }
    });
    const text = response.text || "{}";
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson || "{}");
  } catch (error) {
    console.error("Comparison Error:", error);
    throw error;
  }
};
