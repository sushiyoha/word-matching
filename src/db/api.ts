import { supabase } from './supabase';
import type { WordLibrary, WordPair, GameRecord, WordLibraryLevel, UserProfile } from '@/types';

// =======================================================
// User Profile API (基于 user.id 的最终安全版) ROBIN IS HERE
// =======================================================
export const userProfileApi = {
  async getOrCreate(user: { id: string, user_metadata: { user_name?: string, name?: string, preferred_username?: string } }): Promise<UserProfile> {
    let { data, error: selectError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (selectError) {
      console.error("查询用户档案失败:", selectError);
      throw selectError;
    }

    if (!data) {
      console.log("未找到档案，为新用户创建一个...");
      const playerName = user.user_metadata?.user_name || user.user_metadata?.name || user.user_metadata?.preferred_username || '新朋友';

      const { data: newData, error: insertError } = await supabase
        .from('user_profiles')
        .insert({ 
          user_id: user.id,
          player_name: playerName
        })
        .select()
        .single();
      
      if (insertError) {
        console.error("创建新用户档案失败:", insertError);
        throw insertError;
      }
      return newData as UserProfile;
    }
    
    return data as UserProfile;
  },

  async updateStats(userId: string, stepsToAdd: number, timeToAdd: number): Promise<UserProfile> {
    const { error } = await supabase.rpc('update_user_stats_by_id', {
      p_user_id: userId,
      steps_to_add: stepsToAdd,
      time_to_add: timeToAdd
    });

    if (error) throw error;
    
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    return updatedProfile as UserProfile;
  },

  async checkIn(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      console.error('更新见面时间失败:', error);
    }
  }
};

// =======================================================
// Word Library API (词库相关)
// =======================================================


// src/db/api.ts (请用这个新版本替换旧的 wordLibraryApi)

export const wordLibraryApi = {
  // ✨ 我们给 getAll 函数的指令加上了精确的条件！ ✨
  async getAll(): Promise<WordLibrary[]> {
    const { data, error } = await supabase
      .from('word_libraries')
      .select('*')
      .eq('is_public', true) // <--- 只去拿那些“is_public”为 true 的书！
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('获取公共词库失败:', error); // 修改了日志，更清晰
      throw error; // 抛出错误，让调用方知道失败了
    }
    
    return Array.isArray(data) ? data : [];
  },

    // 获取单个词库详情(2025.12.7新增代码)
    async getById(id: string): Promise<WordLibrary | null> {
      const { data, error } = await supabase
        .from('word_libraries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('获取词库详情失败:', error);
        throw error;
      }
      return data;
    },




  // (getForUser, create, delete 函数保持不变)
  async getForUser(userId: string): Promise<WordLibrary[]> {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('user_libraries')
      .select(`word_libraries (*, word_pairs ( count ))`)
      .eq('user_id', userId);
    if (error) {
        console.error("获取用户词库失败:", error);
        throw error;
    }
    return data.map((item: any) => item.word_libraries).filter(Boolean) as WordLibrary[];
  },

  async create(libraryData: { name: string; description?: string; uploader_id: string }): Promise<WordLibrary> {
    console.log("【API层】接收到创建词库的请求！", libraryData);

    const { data: newLibrary, error: createError } = await supabase
      .from('word_libraries')
      .insert({
        name: libraryData.name,
        description: libraryData.description,
        is_public: true,
        uploader_id: libraryData.uploader_id,
      })
      .select()
      .single();

    if (createError) {
      console.error('创建公共词库失败:', createError);
      throw createError;
    }

    const { error: linkError } = await supabase
      .from('user_libraries')
      .insert({
        user_id: libraryData.uploader_id,
        library_id: newLibrary.id,
      });

    if (linkError) {
      console.error('为上传者关联词库失败:', linkError);
      throw linkError;
    }
    return newLibrary as WordLibrary;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('word_libraries').delete().eq('id', id);
    if (error) {
      console.error('Error deleting word library:', error);
      return false;
    }
    return true;
  }
};


// =======================================================
// Word Library Level API (关卡相关)
// =======================================================
export const wordLibraryLevelApi = {
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

  async create(level: { library_id: string; level_name: string; level_order: number }): Promise<WordLibraryLevel> {
    const { data, error } = await supabase
      .from('word_library_levels')
      .insert(level)
      .select()
      .single();
    if (error) {
      console.error('Error creating library level:', error);
      throw error;
    }
    return data;
  },
};





// =======================================================
// Word Pair API (单词对相关)
// =======================================================
export const wordPairApi = {
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

  async create(pair: { 
    library_id: string; 
    level_id?: string; 
    english_word: string; 
    chinese_translation: string;
    lang_a?: string;
    lang_b?: string;
  }): Promise<WordPair> {
    const { data, error } = await supabase
      .from('word_pairs')
      .insert({
        ...pair,
        level_id: pair.level_id || null,
        lang_a: pair.lang_a || 'en-US-EricNeural',
        lang_b: pair.lang_b || 'zh-CN-XiaoqiuNeural'
      })
      .select()
      .single();
    if (error) {
      console.error('Error creating word pair:', error);
      throw error;
    }
    return data;
  },

    // 更新单词 (2025.12.7新增)
    async update(id: string, updates: { english_word?: string; chinese_translation?: string }): Promise<WordPair> {
      const { data, error } = await supabase
        .from('word_pairs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating word pair:', error);
        throw error;
      }
      return data;
    },
  
    // 删除单词 (2025.12.7新增)
    async delete(id: string): Promise<boolean> {
      const { error } = await supabase
        .from('word_pairs')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting word pair:', error);
        throw error;
      }
      return true;
    }


  
};

// =======================================================
// Game Record API (游戏记录相关)
// =======================================================
export const gameRecordApi = {
  async create(record: {
    player_name: string;
    library_id: string;
    level_id?: string;
    word_count: number;
    steps: number;
    time_seconds: number;
  }): Promise<GameRecord> {
    const { data, error } = await supabase
      .from('game_records')
      .insert({
        ...record,
        level_id: record.level_id || null
      })
      .select()
      .single();
    if (error) {
      console.error('Error creating game record:', error);
      throw error;
    }
    return data;
  },
};