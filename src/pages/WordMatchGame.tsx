import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Clock, 
  Target, 
  RefreshCw,
  Settings,
  Crown,
  Medal,
  ChevronRight,
  Layers,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { wordLibraryApi, wordPairApi, gameRecordApi, wordLibraryLevelApi } from '@/db/api';
import type { WordLibrary, WordPair, GameCard, GameState, WordLibraryLevel } from '@/types';
import GameBoard from '@/components/game/GameBoard';
import Leaderboard from '@/components/game/Leaderboard';
import LevelSelector from '@/components/game/LevelSelector';
import { useSoundEffect } from "@/hooks/useSoundEffect";

const WordMatchGame: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [libraries, setLibraries] = useState<WordLibrary[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<WordLibrary | null>(null);
  const [levels, setLevels] = useState<WordLibraryLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<WordLibraryLevel | null>(null);
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [currentWords, setCurrentWords] = useState<WordPair[]>([]);
  const [gameWords, setGameWords] = useState<WordPair[]>([]);
  const [wordCount, setWordCount] = useState(10);
  const [playerName, setPlayerName] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [firstPlaceRecord, setFirstPlaceRecord] = useState<{ playerName: string; time: number; steps: number } | null>(null);
  const [userBestRecord, setUserBestRecord] = useState<{ time: number; steps: number } | null>(null);
  const [currentGameResult, setCurrentGameResult] = useState<{ time: number; steps: number } | null>(null);
  const [gameCount, setGameCount] = useState(0);
  
  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    selectedCards: [],
    matchedPairs: 0,
    steps: 0,
    startTime: null,
    endTime: null,
    isGameStarted: false,
    isGameCompleted: false
  });
  const { playSound } = useSoundEffect();



  // 加载词库
  useEffect(() => {
    const loadLibraries = async () => {
      const libs = await wordLibraryApi.getAll();
      setLibraries(libs);
      
      // 默认选择第一个词库
      if (libs.length > 0) {
        const savedLibraryId = localStorage.getItem("selectedLibraryId");
        let libraryToSelect = null;
        if (savedLibraryId && libs.length > 0) {
          libraryToSelect = libs.find(lib => lib.id === savedLibraryId);
        }
        if (!libraryToSelect && libs.length > 0) {
          libraryToSelect = libs.find(lib => lib.is_default) || libs[0];
        }
        const defaultLib = libraryToSelect || null;
        setSelectedLibrary(defaultLib);
        if (defaultLib) {
          localStorage.setItem("selectedLibraryId", defaultLib.id);
        }
      }
    };
    
    loadLibraries();
  }, [searchParams]);

  // 加载选中词库的关卡
  useEffect(() => {
    if (selectedLibrary) {
      const loadLevels = async () => {
        const libraryLevels = await wordLibraryLevelApi.getByLibraryId(selectedLibrary.id);
        setLevels(libraryLevels);
        
        // 从URL参数读取关卡ID
        const urlLevelId = searchParams.get('levelId');
        
        if (urlLevelId && libraryLevels.length > 0) {
          const urlLevel = libraryLevels.find(l => l.id === urlLevelId);
          if (urlLevel) {
            setCurrentLevel(urlLevel);
            return;
          }
        }
        
        // 默认选择第一个关卡
        if (libraryLevels.length > 0) {
          setCurrentLevel(libraryLevels[0]);
        }
      };
      
      loadLevels();
    }
  }, [selectedLibrary, searchParams]);

  // 游戏计时器
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (gameState.isGameStarted && !gameState.isGameCompleted && gameState.startTime) {
      interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - gameState.startTime!) / 1000));
      }, 1000);
    } else {
      setCurrentTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState.isGameStarted, gameState.isGameCompleted, gameState.startTime]);

  // 加载选中关卡的单词对
  useEffect(() => {
    if (currentLevel && !gameState.isGameStarted) {
      const loadWordPairs = async () => {
        const pairs = await wordPairApi.getByLevelId(currentLevel.id);
        setWordPairs(pairs);
        // 默认显示前10个单词（只在游戏未开始时刷新）
        if (pairs.length > 0) {
          // 先去重，基于单词对的内容（english_word + chinese_translation）
          const contentMap = new Map<string, WordPair>();
          pairs.forEach(pair => {
            const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
            if (!contentMap.has(contentKey)) {
              contentMap.set(contentKey, pair);
            }
          });
          const uniquePairs = Array.from(contentMap.values());
          // 随机选择指定数量的单词对
          const shuffled = [...uniquePairs].sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, Math.min(wordCount, uniquePairs.length));
          setCurrentWords(selected);
        }
      };
      
      loadWordPairs();
    }
  }, [currentLevel, wordCount, gameState.isGameStarted]);

  // 从localStorage获取玩家名称
  useEffect(() => {
    const savedPlayerName = localStorage.getItem('wordMatchGame_playerName');
    if (savedPlayerName) {
      setPlayerName(savedPlayerName);
    }
  }, []);

  // 保存玩家名称到localStorage
  const savePlayerName = useCallback((name: string) => {
    setPlayerName(name);
    localStorage.setItem('wordMatchGame_playerName', name);
  }, []);

  // 刷新单词
  const refreshWords = useCallback((pairs: WordPair[] = wordPairs, count: number = wordCount) => {
    if (pairs.length === 0) return;
    
    // 先去重，基于单词对的内容（english_word + chinese_translation），而不是 id
    // 这样可以避免数据库中相同内容但不同 id 的重复记录
    const contentMap = new Map<string, WordPair>();
    pairs.forEach(pair => {
      const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
      if (!contentMap.has(contentKey)) {
        contentMap.set(contentKey, pair);
      }
    });
    const uniquePairs = Array.from(contentMap.values());
    
    // 随机选择指定数量的单词对
    const shuffled = [...uniquePairs].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, uniquePairs.length));
    setCurrentWords(selected);
  }, [wordPairs, wordCount]);

  // 切换到下一关
  const goToNextLevel = useCallback(() => {
    if (!currentLevel || levels.length === 0) return;
    
    const currentIndex = levels.findIndex(l => l.id === currentLevel.id);
    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1];
      setCurrentLevel(nextLevel);
      toast.success(`已切换到关卡：${nextLevel.level_name}`);
    } else {
      toast.info('已经是最后一关了');
    }
  }, [currentLevel, levels]);

  // 切换到上一关
  const goToPreviousLevel = useCallback(() => {
    if (!currentLevel || levels.length === 0) return;
    
    const currentIndex = levels.findIndex(l => l.id === currentLevel.id);
    if (currentIndex > 0) {
      const previousLevel = levels[currentIndex - 1];
      setCurrentLevel(previousLevel);
      toast.success(`已切换到关卡：${previousLevel.level_name}`);
    } else {
      toast.info('已经是第一关了');
    }
  }, [currentLevel, levels]);

  // 选择指定关卡
  const selectLevel = useCallback((level: WordLibraryLevel) => {
    setCurrentLevel(level);
    toast.success(`已切换到关卡：${level.level_name}`);
  }, []);

  // 监听页面焦点变化，自动同步词库选择
  useEffect(() => {
    const handleFocus = () => {
      // 当页面获得焦点时，检查是否有新的词库选择
      reloadLibraries();
    };

    // 监听自定义事件
    const handleLibraryChange = (e: any) => {
      const { library } = e.detail;
      if (library && library.id !== selectedLibrary?.id) {
        setSelectedLibrary(library);
        localStorage.setItem('selectedLibraryId', library.id);
        toast.success(`已自动切换到词库：${library.name}`);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('libraryChanged', handleLibraryChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('libraryChanged', handleLibraryChange);
    };
  }, [selectedLibrary]);

    // 重新加载词库（用于同步设置页面的选择）
  const reloadLibraries = async () => {
    const libs = await wordLibraryApi.getAll();
    setLibraries(libs);
    
    // 尝试从localStorage恢复之前选择的词库
    const savedLibraryId = localStorage.getItem('selectedLibraryId');
    let libraryToSelect = null;
    
    if (savedLibraryId && libs.length > 0) {
      libraryToSelect = libs.find(lib => lib.id === savedLibraryId);
    }
    
    if (libraryToSelect && libraryToSelect.id !== selectedLibrary?.id) {
      setSelectedLibrary(libraryToSelect);
      localStorage.setItem('selectedLibraryId', libraryToSelect.id);
      toast.success(`已切换到词库：${libraryToSelect.name}`);
    }
  };

  // 创建游戏卡片
  const createGameCards = useCallback((pairs: WordPair[], showContent: boolean = false): GameCard[] => {
    // 创建卡片数组
    const cards: GameCard[] = [];
    
    // 先去重，基于单词对的内容（english_word + chinese_translation）
    // 使用内容作为 key，这样可以避免相同内容但不同 id 的重复
    const contentMap = new Map<string, WordPair>();
    pairs.forEach(pair => {
      const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
      if (!contentMap.has(contentKey)) {
        contentMap.set(contentKey, pair);
      }
    });
    const uniquePairs = Array.from(contentMap.values());
    
    uniquePairs.forEach((pair, index) => {
      // 使用内容作为 pairId 的基础，确保相同内容的单词对使用相同的 pairId
      // 使用内容生成稳定的 pairId，相同内容总是得到相同的 pairId
      const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
      // 使用简单的字符串替换，将特殊字符替换为下划线，确保 pairId 的唯一性和可读性
      const safePairId = contentKey.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      const pairId = `pair-${safePairId}`;
      
      // 英文卡片
      cards.push({
        id: `${pairId}-en-${index}`,
        content: pair.english_word,
        type: 'english',
        pairId,
        isFlipped: showContent,
        isMatched: false,
        lang: pair.lang_a || 'en-US-EricNeural'
      });
      
      // 中文卡片
      cards.push({
        id: `${pairId}-zh-${index}`,
        content: pair.chinese_translation,
        type: 'chinese',
        pairId,
        isFlipped: showContent,
        isMatched: false,
        lang: pair.lang_b || 'zh-CN-XiaoxiaoNeural'
      });
    });

    // 打乱卡片顺序
    return cards.sort(() => Math.random() - 0.5);
  }, []);

  // 开始游戏
  const startGame = useCallback(() => {
    if (!selectedLibrary || currentWords.length === 0) {
      toast.error('请先刷新单词');
      return;
    }

    // 使用当前显示的词汇创建快照（基于内容去重确保一致性）
    const contentMap = new Map<string, WordPair>();
    currentWords.forEach(pair => {
      const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
      if (!contentMap.has(contentKey)) {
        contentMap.set(contentKey, pair);
      }
    });
    const uniqueWords = Array.from(contentMap.values());
    setGameWords(uniqueWords);
    const cardsWithContent = createGameCards(uniqueWords, true);
    
    setGameState({
      cards: cardsWithContent,
      selectedCards: [],
      matchedPairs: 0,
      steps: 0,
      startTime: Date.now(),
      endTime: null,
      isGameStarted: true,
      isGameCompleted: false
    });
    
    // 0.5秒后将所有卡片翻转到背面
    setTimeout(() => {
      setGameState(prevState => ({
        ...prevState,
        cards: prevState.cards.map(card => ({
          ...card,
          isFlipped: false
        }))
      }));
    }, 500);
  }, [selectedLibrary, currentWords, createGameCards]);

  // 重置游戏
  const resetGame = useCallback(() => {
    setGameState({
      cards: [],
      selectedCards: [],
      matchedPairs: 0,
      steps: 0,
      startTime: null,
      endTime: null,
      isGameStarted: false,
      isGameCompleted: false
    });
    setGameWords([]);
    // 清除排名信息和成绩记录
    setUserRank(null);
    setFirstPlaceRecord(null);
    setUserBestRecord(null);
    setCurrentGameResult(null);
  }, []);

  // 重新开始游戏（保持当前设置）
  const restartGame = useCallback(() => {
    if (!selectedLibrary || currentWords.length === 0) {
      toast.error('请先选择词库并确保有单词');
      return;
    }

    // 使用当前显示的词汇创建快照（基于内容去重确保一致性）
    const contentMap = new Map<string, WordPair>();
    currentWords.forEach(pair => {
      const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
      if (!contentMap.has(contentKey)) {
        contentMap.set(contentKey, pair);
      }
    });
    const uniqueWords = Array.from(contentMap.values());
    setGameWords(uniqueWords);
    const cardsWithContent = createGameCards(uniqueWords, true);
    
    setGameState({
      cards: cardsWithContent,
      selectedCards: [],
      matchedPairs: 0,
      steps: 0,
      startTime: Date.now(),
      endTime: null,
      isGameStarted: true,
      isGameCompleted: false
    });
    
    // 清除排名信息和成绩记录
    setUserRank(null);
    setFirstPlaceRecord(null);
    setUserBestRecord(null);
    setCurrentGameResult(null);
    toast.success('游戏重新开始！');

    // 0.5秒后将所有卡片翻转到背面
    setTimeout(() => {
      setGameState(prevState => ({
        ...prevState,
        cards: prevState.cards.map(card => ({
          ...card,
          isFlipped: false
        }))
      }));
    }, 500);
  }, [selectedLibrary, currentWords, createGameCards]);


  // 处理卡片点击
  const handleCardClick = useCallback((cardId: string) => {
    setGameState(prevState => {
      const { cards, selectedCards, steps, matchedPairs } = prevState;
        
      // 如果已经选择了两张卡片，或者卡片已经被匹配，则忽略点击
      if (selectedCards.length >= 2) return prevState;
        
      const clickedCard = cards.find(card => card.id === cardId);
      if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) {
        return prevState;
      }
  
      // 翻转卡片
      const updatedCards = cards.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      );
  
      const newSelectedCards = [...selectedCards, clickedCard];
  
      // 如果选择了两张卡片，检查是否匹配
      if (newSelectedCards.length === 2) {
        const [firstCard, secondCard] = newSelectedCards;
        const isMatch = firstCard.pairId === secondCard.pairId;
  
        if (isMatch) {
          // 匹配成功
          const finalCards = updatedCards.map(card =>
            card.pairId === firstCard.pairId 
              ? { ...card, isMatched: true }
              : card
          );
  
          const newMatchedPairs = matchedPairs + 1;
          const newSteps = steps + 1;
          const isGameCompleted = newMatchedPairs === currentWords.length;
  
          return {
            ...prevState,
            cards: finalCards,
            selectedCards: [],
            matchedPairs: newMatchedPairs,
            steps: newSteps,
            isGameCompleted,
            endTime: isGameCompleted ? Date.now() : null
          };
        } else {
          // 匹配失败，延迟翻回卡片
          setTimeout(() => {
            setGameState(currentState => ({
              ...currentState,
              cards: currentState.cards.map(card =>
                (card.id === firstCard.id || card.id === secondCard.id)
                  ? { ...card, isFlipped: false }
                  : card
              ),
              selectedCards: []
            }));
          }, 500);
  
          return {
            ...prevState,
            cards: updatedCards,
            selectedCards: newSelectedCards,
            steps: steps + 1
          };
        }
      }
  
      return {
        ...prevState,
        cards: updatedCards,
        selectedCards: newSelectedCards
      };
    });
  }, [currentWords.length]);





  // 游戏完成处理
  useEffect(() => {
    if (gameState.isGameCompleted && gameState.startTime && gameState.endTime && selectedLibrary) {
      const timeSeconds = Math.floor((gameState.endTime - gameState.startTime) / 1000);
      
      // 保存当前游戏结果
      setCurrentGameResult({
        time: timeSeconds,
        steps: gameState.steps
      });
      
      const saveRecordAndGetRanking = async () => {
        if (playerName.trim()) {
          try {
            // 先获取用户的历史最佳记录
            const existingRecords = await gameRecordApi.getLeaderboard(
              selectedLibrary.id, 
              gameWords.length, 
              currentLevel?.id
            );
            const userRecords = existingRecords.filter(record => record.player_name === playerName.trim());
            
            // 保存用户的历史最佳记录（保存新记录之前的最佳）
            if (userRecords.length > 0) {
              const bestUserRecord = userRecords[0];
              setUserBestRecord({
                time: bestUserRecord.time_seconds,
                steps: bestUserRecord.steps
              });
            } else {
              setUserBestRecord(null);
            }
            
            // 计算游戏次数（包括即将保存的这一次）
            const newGameCount = userRecords.length + 1;
            setGameCount(newGameCount);
            
            // 保存新记录
            await gameRecordApi.create({
              player_name: playerName.trim(),
              library_id: selectedLibrary.id,
              level_id: currentLevel?.id,
              word_count: gameWords.length,
              steps: gameState.steps,
              time_seconds: timeSeconds
            });
            
            // 游戏记录保存成功后，获取排名信息
            await getRankingInfo();
            
            // 触发排行榜刷新
            setLeaderboardRefreshKey(Date.now());
            
            // 不再显示 toast 提示，因为游戏完成区域已经显示了所有信息
          } catch (error) {
            console.error('保存游戏记录失败:', error);
            toast.error('保存游戏记录失败');
          }
        } else {
          // 即使没有保存记录，也获取排名信息
          await getRankingInfo();
          // 不再显示 toast 提示，因为游戏完成区域已经显示了所有信息
        }
      };

      saveRecordAndGetRanking();
    }
  }, [gameState.isGameCompleted, gameState.startTime, gameState.endTime, gameState.steps, selectedLibrary, currentWords.length, playerName]);

  // 获取排名信息
  const getRankingInfo = async () => {
    if (!selectedLibrary) return;
    
    try {
      const records = await gameRecordApi.getLeaderboard(
        selectedLibrary.id, 
        gameWords.length, 
        currentLevel?.id
      );
      
      if (records.length > 0) {
        // 获取第一名信息
        const firstPlace = records[0];
        setFirstPlaceRecord({
          playerName: firstPlace.player_name,
          time: firstPlace.time_seconds,
          steps: firstPlace.steps
        });
        
        // 如果用户有名字，查找用户的最佳排名
        if (playerName.trim()) {
          // 找到用户的所有记录中最好的一个
          const userRecords = records.filter(record => record.player_name === playerName.trim());
          if (userRecords.length > 0) {
            // 用户的最佳记录就是排行榜中的第一个用户记录
            const bestUserRecord = userRecords[0];
            const userRankIndex = records.findIndex(record => 
              record.player_name === bestUserRecord.player_name && 
              record.time_seconds === bestUserRecord.time_seconds &&
              record.steps === bestUserRecord.steps
            );
            setUserRank(userRankIndex + 1);
          } else {
            setUserRank(null);
          }
        } else {
          setUserRank(null);
        }
      } else {
        setFirstPlaceRecord(null);
        setUserRank(null);
      }
    } catch (error) {
      console.error("获取排名信息失败:", error);
      setFirstPlaceRecord(null);
      setUserRank(null);
    }
  };

  // 监听单词数量变化，自动刷新单词（仅在游戏未开始时）
  useEffect(() => {
    if (wordPairs.length > 0 && !gameState.isGameStarted) {
      refreshWords(wordPairs, wordCount);
    }
  }, [wordCount, wordPairs, gameState.isGameStarted, refreshWords]);

  // 计算游戏进度
  const progress = gameState.isGameStarted 
    ? (gameState.matchedPairs / Math.max(1, gameWords.length)) * 100 
    : 0;

  // 计算游戏时间
  const gameTime = gameState.startTime 
    ? Math.floor(((gameState.endTime || Date.now()) - gameState.startTime) / 1000)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      {/* 左上角返回按钮 */}
      {gameState.isGameStarted && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={resetGame}
            variant="ghost"
            size="icon"
            className="hover:scale-110 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </Button>
        </div>
      )}
      
      {/* 右上角设置按钮 */}
      <div className="fixed top-4 right-4 z-50">
        <Link to="/settings">
          <Button
            variant="ghost"
            size="icon"
            className="hover:scale-110 transition-all"
          >
            <Settings className="w-6 h-6 text-indigo-600 hover:text-indigo-700" />
          </Button>
        </Link>
      </div>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 标题和关卡信息 */}
        <div className="text-center space-y-2">
          {selectedLibrary && (
            <div className="flex items-center justify-center gap-2">

              <h2 className="text-xl font-semibold text-slate-800">{selectedLibrary.name}</h2>
            </div>
          )}
          {currentLevel && levels.length > 1 && (
            <div className="flex items-center justify-center gap-3">
              {/* 可点击的关卡信息 */}
              <button
                onClick={() => navigate(`/levels?libraryId=${selectedLibrary?.id}&levelId=${currentLevel.id}`)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-indigo-50/50 transition-all duration-200 group"
              >
                <Layers className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <Badge variant="outline" className="text-sm border-0 bg-transparent">
                  {currentLevel.level_name}
                </Badge>
                <span className="text-xs text-slate-500">
                  ({levels.findIndex(l => l.id === currentLevel.id) + 1}/{levels.length})
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* 下一关按钮 */}
              {levels.findIndex(l => l.id === currentLevel.id) < levels.length - 1 && (
                <Button
                  onClick={goToNextLevel}
                  size="sm"
                  variant="ghost"
                  className="flex items-center justify-center hover:scale-110 transition-all w-8 h-8 p-0"
                >

                </Button>
              )}
            </div>
          )}
          {currentLevel && levels.length === 1 && (
            <div className="flex items-center justify-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <Badge variant="outline" className="text-sm">
                {currentLevel.level_name}
              </Badge>
            </div>
          )}
        </div>

        {/* 游戏未开始时显示单词列表 */}
        {!gameState.isGameStarted && (
          <Card className="max-w-[420px] mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">

              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentWords.length > 0 ? (() => {
                // 在显示前进行去重，确保首页显示的词汇和游戏中使用的完全一致
                const contentMap = new Map<string, WordPair>();
                currentWords.forEach(pair => {
                  const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
                  if (!contentMap.has(contentKey)) {
                    contentMap.set(contentKey, pair);
                  }
                });
                const uniqueWordsForDisplay = Array.from(contentMap.values());
                
                return (
                  <div className="grid grid-cols-4 gap-1.5 mb-6 max-w-[360px] mx-auto">
                    {uniqueWordsForDisplay.map((pair, index) => [
                      // 英文卡牌
                      <div
                        key={`${pair.english_word}-${pair.chinese_translation}-en-${index}`}
                        className="bg-blue-50 rounded-md border border-blue-200 text-center aspect-square flex items-center justify-center"
                      >
                        <span className="font-medium text-blue-700 text-xs leading-tight">
                          {pair.english_word}
                        </span>
                      </div>,
                      // 中文卡牌
                      <div
                        key={`${pair.english_word}-${pair.chinese_translation}-zh-${index}`}
                        className="bg-slate-50 rounded-md border border-slate-200 text-center aspect-square flex items-center justify-center"
                      >
                        <span className="text-slate-700 text-xs leading-tight">
                          {pair.chinese_translation}
                        </span>
                      </div>
                    ]).flat()}
                  </div>
                );
              })() : (
                <div className="text-center py-8 text-slate-500">
                  暂无单词，请刷新或检查词库
                </div>
              )}

              <Separator className="my-4" />

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => refreshWords()}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={wordPairs.length === 0}
                >
                  <RefreshCw className="w-4 h-4" />
                  刷新词汇
                </Button>
                
                {levels.length > 1 && selectedLibrary && (
                  <>
                    <LevelSelector
                      levels={levels}
                      currentLevel={currentLevel}
                      libraryId={selectedLibrary.id}
                      onSelectLevel={selectLevel}
                    />

                  </>
                )}
                
                <Button
                  onClick={startGame}
                  className="flex items-center gap-2"
                  disabled={currentWords.length === 0}
                >
                  <Play className="w-4 h-4" />
                  开始游戏
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 游戏进行中的统计面板 */}
        {gameState.isGameStarted && (
          <div className="mt-1 py-2 px-4">
            <div className="flex items-center justify-between gap-2">
              {/* 游戏统计信息 */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-sm font-medium">{gameState.steps}步</span>
                </div>
                {gameState.startTime && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-sm font-medium">{gameTime}秒</span>
                  </div>
                )}
                {/* 重新开始按钮 - 只显示符号 */}
                <button
                  onClick={restartGame}
                  className="flex items-center justify-center w-7 h-7 hover:scale-110 transition-all"
                  title="重新开始"
                >
                  <RotateCcw className="w-4 h-4 text-indigo-600 hover:text-indigo-700" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 游戏区域 */}
        {gameState.isGameStarted && (
          <GameBoard
            cards={gameState.cards}
            onCardClick={handleCardClick}
            isCompleted={gameState.isGameCompleted}
          />
        )}

        {/* 游戏完成提示 */}
        {gameState.isGameCompleted && (
          <div className="mt-4 space-y-3">
            {/* 第一名成绩 */}
            {firstPlaceRecord && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">第一名</span>
                </div>
                <div className="text-sm text-yellow-700">
                  {firstPlaceRecord.playerName} - {firstPlaceRecord.time}秒 {firstPlaceRecord.steps}步
                </div>
              </div>
            )}

            {/* 个人最好成绩 */}
            {userBestRecord && playerName.trim() && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-center gap-2">
                  <Medal className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">我的最好成绩</span>
                </div>
                <div className="text-sm text-blue-700">
                  {userBestRecord.time}秒 {userBestRecord.steps}步
                </div>
              </div>
            )}

            {/* 本局成绩 */}
            {currentGameResult && (
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">本局成绩</span>
                </div>
                <div className="text-sm text-green-700 font-semibold">
                  {currentGameResult.time}秒 {currentGameResult.steps}步
                </div>
              </div>
            )}

            {/* 排名信息 */}
            {userRank && playerName.trim() && (
              <div className="flex items-center justify-center p-2 bg-purple-50 rounded-md border border-purple-200">
                <span className="text-sm text-purple-700">
                  您在排行榜中排名第 <span className="font-bold text-purple-800">{userRank}</span> 名
                </span>
              </div>
            )}

            {/* 未登录提示 */}
            {!playerName.trim() && (
              <div className="text-xs text-gray-500 text-center">
                设置玩家名称后可查看个人最好成绩和排名
              </div>
            )}

            {/* 再玩一局按钮 */}
            <div className="flex gap-2 justify-center pt-2">
              <Button onClick={restartGame} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                再玩一局
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* 排行榜对话框 */}
      <Leaderboard
        open={showLeaderboard}
        onOpenChange={setShowLeaderboard}
        selectedLibrary={selectedLibrary}
        currentLevel={currentLevel}
        wordCount={gameWords.length}
        refreshKey={leaderboardRefreshKey}
      />
    </div>
  );
};

export default WordMatchGame;
