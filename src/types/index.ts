export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

// 游戏相关类型定义
export interface WordLibrary {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface WordLibraryLevel {
  id: string;
  library_id: string;
  level_name: string;
  level_order: number;
  created_at: string;
}

export interface WordPair {
  id: string;
  library_id: string;
  level_id?: string;
  english_word: string;
  chinese_translation: string;
  lang_a?:string;//语言A的语言代码，如'zh-CN-XiaoxiaoNeural'
  lang_b?:string;
  created_at: string;
}

export interface GameRecord {
  id: string;
  player_name: string;
  library_id: string;
  level_id?: string;
  word_count: number;
  steps: number;
  time_seconds: number;
  completed_at: string;
}

// 游戏状态类型
export interface GameCard {
  id: string;
  content: string;
  type: 'english' | 'chinese';
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
  lang?:string;//该语言的语言代码
}

export interface GameState {
  cards: GameCard[];
  selectedCards: GameCard[];
  matchedPairs: number;
  steps: number;
  startTime: number | null;
  endTime: number | null;
  isGameStarted: boolean;
  isGameCompleted: boolean;
}

export interface UserProfile {
  player_name: string;
  total_steps: number;
  total_time_seconds: number;
  last_seen_at: string; // timestamptz 类型会以字符串形式返回
  created_at: string;
}