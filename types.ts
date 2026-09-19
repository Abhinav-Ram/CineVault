
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface MovieCandidate {
  title: string;
  year: string;
  director: string;
  actors: string[];
}

export interface TShirtDesign {
  backgroundColor: string;
  textColor: string;
  iconName: string;
  phrase: string;
  fontFamily: 'serif' | 'sans-serif' | 'monospace' | 'cursive' | 'fantasy';
}

export interface GeneralInfo {
  title: string;
  year: string;
  synopsis: string;
  director: string;
  actors: string[];
  musicScore: string;
  posterUrl?: string;
  tShirtDesign: TShirtDesign;
  youtubeTrailerId: string;
  whereToWatch: string[];
}

export interface GroupSuitability {
  familyWithKids: string;
  firstDate: string;
  cinephiles: string;
  casualFriends: string;
}

export interface ContentSensitivity {
  nuditySex: number; // 0-10
  violenceGore: number; // 0-10
  profanity: number; // 0-10
  awkwardnessFactor: number; // 0-10
  pacingDrag: number; // 0-10
  complexity: number; // 0-10
  brainrot: number; // 0-10
  scaryIntensity: number; // 0-10
  subtextRisk: number; // 0-10
}

export interface FriendlinessInfo {
  friendlinessScore: number;
  overallReception: string;
  idealFor: string;
  notFor: string;
  suitability: GroupSuitability;
  sensitivity: ContentSensitivity;
  contentAdvisory: string;
  lorePrerequisites: string;
  proTips: string;
}

export interface AnalysisData {
  general: GeneralInfo;
  friendliness: FriendlinessInfo;
  sources: { title: string; uri: string }[];
}

export interface MovieRecommendation {
  title: string;
  year: string;
  reason: string;
  suitability: string;
}

export interface LanguageGroup {
  language: string;
  movies: MovieRecommendation[];
}

export type AnalysisResult = 
  | { type: 'SUCCESS'; data: AnalysisData }
  | { type: 'NOT_FOUND' };

export type Tab = 'ANALYZER' | 'MOVIE_EDITZZZ' | 'RECOMMENDER' | 'MATCHER' | 'COMPARER';

export interface MovieEditData {
  title: string;
  year: string;
  hook: string;
  moodSummary: string;
  transitions: string[];
  letterboxdReviews: {
    user: string;
    text: string;
    rating: number; // 0-5
  }[];
}

export enum LoadingStage {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  IDENTIFYING = 'IDENTIFYING',
  ANALYZING = 'ANALYZING',
  RECOMMENDING = 'RECOMMENDING',
  MATCHING = 'MATCHING',
  COMPARING = 'COMPARING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ComparisonResult {
  movies: {
    title: string;
    year: string;
    pacing: string;
    cognitiveLoad: string;
    tonalFriction: string;
    vibeScore: number;
  }[];
  vibeGapAnalysis: string;
  tieBreakerRecommendation: string;
  comparisonPoints: {
    category: string;
    details: string[];
  }[];
}

export interface RecommendationRequirements {
  genres: string[];
  company: string;
  pacing: string;
  languages: string[];
  customDescription: string;
  customGenre?: string;
  excludedMovies?: string[];
}

export interface SimilarityRequest {
  sourceMovie: string;
  reason?: string;
  excludedMovies?: string[];
}
