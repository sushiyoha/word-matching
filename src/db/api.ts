import { supabase } from './supabase';
import type { WordLibrary, WordPair, GameRecord, WordLibraryLevel } from '@/types';

// 词库相关API
export const wordLibraryApi = {
  // 获取所有词库
  async getAll(): Promise<WordLibrary[]> {
    const { data, error } = await supabase
      .from('word_libraries')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching word libraries:', error);
      return [];
    }
    
    return Array.isArray(data) ? data : [];
  },

  // 获取默认词库
  async getDefault(): Promise<WordLibrary | null> {
    const { data, error } = await supabase
      .from('word_libraries')
      .select('*')
      .eq('is_default', true)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching default word library:', error);
      return null;
    }
    
    return data;
  },

  // 根据ID获取词库
  async getById(id: string): Promise<WordLibrary | null> {
    const { data, error } = await supabase
      .from('word_libraries')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching word library by id:', error);
      return null;
    }
    
    return data;
  },

  // 创建新词库
  async create(library: { name: string; description?: string }): Promise<WordLibrary | null> {
    const { data, error } = await supabase
      .from('word_libraries')
      .insert({
        name: library.name,
        description: library.description || null,
        is_default: false
      })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error creating word library:', error);
      return null;
    }
    
    return data;
  },

  // 删除词库
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('word_libraries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting word library:', error);
      return false;
    }
    
    return true;
  }
};

// 关卡相关API
export const wordLibraryLevelApi = {
  // 获取词库的所有关卡
  async getByLibraryId(libraryId: string): Promise<WordLibraryLevel[]> {
    const { data, error } = await supabase
      .from('word_library_levels')
      .select('*')
      .eq('library_id', libraryId)
      .order('level_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching library levels:', error);
      return [];
    }
    
    return Array.isArray(data) ? data : [];
  },

  // 创建新关卡
  async create(level: { library_id: string; level_name: string; level_order: number }): Promise<WordLibraryLevel | null> {
    const { data, error } = await supabase
      .from('word_library_levels')
      .insert({
        library_id: level.library_id,
        level_name: level.level_name,
        level_order: level.level_order
      })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error creating library level:', error);
      return null;
    }
    
    return data;
  },

  // 批量创建关卡
  async batchCreate(libraryId: string, levels: Array<{ level_name: string; level_order: number }>): Promise<WordLibraryLevel[]> {
    const { data, error } = await supabase
      .from('word_library_levels')
      .insert(
        levels.map(level => ({
          library_id: libraryId,
          level_name: level.level_name,
          level_order: level.level_order
        }))
      )
      .select();
    
    if (error) {
      console.error('Error creating library levels:', error);
      return [];
    }
    
    return Array.isArray(data) ? data : [];
  },

  // 删除关卡
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('word_library_levels')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting library level:', error);
      return false;
    }
    
    return true;
  }
};

// 单词对相关API
export const wordPairApi = {
  // 根据词库ID获取单词对
  async getByLibraryId(libraryId: string): Promise<WordPair[]> {
    const { data, error } = await supabase
      .from('word_pairs')
      .select('*')
      .eq('library_id', libraryId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching word pairs:', error);
      return [];
    }
    
    return Array.isArray(data) ? data : [];
  },

  // 根据关卡ID获取单词对
  async getByLevelId(levelId: string): Promise<WordPair[]> {
    const { data, error } = await supabase
      .from('word_pairs')
      .select('*')
      .eq('level_id', levelId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching word pairs by level:', error);
      return [];
    }
    
    return Array.isArray(data) ? data : [];
  },

  // 创建单个单词对
  async create(pair: { 
    library_id: string; 
    level_id?: string; 
    english_word: string; 
    chinese_translation: string;
    lang_a?: string;
    lang_b?: string;
  }): Promise<WordPair | null> {
    const { data, error } = await supabase
      .from('word_pairs')
      .insert({
        library_id: pair.library_id,
        level_id: pair.level_id || null,
        english_word: pair.english_word,
        chinese_translation: pair.chinese_translation,
        lang_a: pair.lang_a || 'en-US-EricNeural',
        lang_b: pair.lang_b || 'zh-CN-XiaoxiaoNeural'
      })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error creating word pair:', error);
      return null;
    }
    
    return data;
  },

  // 更新单词对
  async update(id: string, updates: { 
    english_word?: string; 
    chinese_translation?: string;
    lang_a?: string;
    lang_b?: string;
  }): Promise<WordPair | null> {
    const { data, error } = await supabase
      .from('word_pairs')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error updating word pair:', error);
      return null;
    }
    
    return data;
  },

  // 批量添加单词对（支持关卡）
  async batchCreate(libraryId: string, pairs: Array<{ level_id?: string; english_word: string; chinese_translation: string }>): Promise<WordPair[]> {
    const { data, error } = await supabase
      .from('word_pairs')
      .insert(
        pairs.map(pair => ({
          library_id: libraryId,
          level_id: pair.level_id || null,
          english_word: pair.english_word,
          chinese_translation: pair.chinese_translation
        }))
      )
      .select();
    
    if (error) {
      console.error('Error creating word pairs:', error);
      return [];
    }
    
    return Array.isArray(data) ? data : [];
  },

  // 删除单词对
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('word_pairs')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting word pair:', error);
      return false;
    }
    
    return true;
  }
};

// 游戏记录相关API
export const gameRecordApi = {
  // 创建游戏记录
  async create(record: {
    player_name: string;
    library_id: string;
    level_id?: string;
    word_count: number;
    steps: number;
    time_seconds: number;
  }): Promise<GameRecord | null> {
    const { data, error } = await supabase
      .from('game_records')
      .insert({
        player_name: record.player_name,
        library_id: record.library_id,
        level_id: record.level_id || null,
        word_count: record.word_count,
        steps: record.steps,
        time_seconds: record.time_seconds
      })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error creating game record:', error);
      return null;
    }
    
    return data;
  },

  // 获取排行榜（按时间排序，支持关卡过滤）
  async getLeaderboard(libraryId: string, wordCount: number, levelId?: string, limit = 10): Promise<GameRecord[]> {
    let query = supabase
      .from('game_records')
      .select('*')
      .eq('library_id', libraryId)
      .eq('word_count', wordCount);
    
    if (levelId) {
      query = query.eq('level_id', levelId);
    }
    
    const { data, error } = await query
      .order('time_seconds', { ascending: true })
      .order('steps', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    
    return Array.isArray(data) ? data : [];
  },

  // 获取用户最佳记录
  async getBestRecord(playerName: string, libraryId: string, wordCount: number, levelId?: string): Promise<GameRecord | null> {
    let query = supabase
      .from('game_records')
      .select('*')
      .eq('player_name', playerName)
      .eq('library_id', libraryId)
      .eq('word_count', wordCount);
    
    if (levelId) {
      query = query.eq('level_id', levelId);
    }
    
    const { data, error } = await query
      .order('time_seconds', { ascending: true })
      .order('steps', { ascending: true })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching best record:', error);
      return null;
    }
    
    return data;
  },

  // 获取词库的所有记录
  async getByLibraryId(libraryId: string): Promise<GameRecord[]> {
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('library_id', libraryId)
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching library records:', error);
      return [];
    }
    
    return Array.isArray(data) ? data : [];
  }
};