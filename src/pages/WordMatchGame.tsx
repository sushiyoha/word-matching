// import React, { useState, useEffect, useCallback } from 'react';
// import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import { Separator } from '@/components/ui/separator';
// import { 
//   Play, 
//   RotateCcw, 
//   Trophy, 
//   Clock, 
//   Target, 
//   RefreshCw,
//   Settings,
//   ChevronRight,
//   Layers,
//   Heart, // 新增一个爱心图标！
//   ArrowLeft
// } from 'lucide-react';
// import { toast } from 'sonner';
// // 导入我们刚刚创建的 userProfileApi
// import { wordLibraryApi, wordPairApi, gameRecordApi, wordLibraryLevelApi, userProfileApi } from '@/db/api';
// import type { WordLibrary, WordPair, GameCard, GameState, WordLibraryLevel, UserProfile } from '@/types';
// import GameBoard from '@/components/game/GameBoard';
// import LevelSelector from '@/components/game/LevelSelector';
// import { useSoundEffect } from "@/hooks/useSoundEffect";

// const WordMatchGame: React.FC = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
  
//   const [libraries, setLibraries] = useState<WordLibrary[]>([]);
//   const [selectedLibrary, setSelectedLibrary] = useState<WordLibrary | null>(null);
//   const [levels, setLevels] = useState<WordLibraryLevel[]>([]);
//   const [currentLevel, setCurrentLevel] = useState<WordLibraryLevel | null>(null);
//   const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
//   const [currentWords, setCurrentWords] = useState<WordPair[]>([]);
//   const [gameWords, setGameWords] = useState<WordPair[]>([]);
//   const [wordCount, setWordCount] = useState(10);
//   const [playerName, setPlayerName] = useState('');
//   const [currentTime, setCurrentTime] = useState(0);
//   const [currentGameResult, setCurrentGameResult] = useState<{ time: number; steps: number } | null>(null);

//   // Robin 的记忆！用来存放用户的累计数据
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
//   const [gameState, setGameState] = useState<GameState>({
//     cards: [],
//     selectedCards: [],
//     matchedPairs: 0,
//     steps: 0,
//     startTime: null,
//     endTime: null,
//     isGameStarted: false,
//     isGameCompleted: false
//   });
//   const { playSound } = useSoundEffect();

//   // 从localStorage获取玩家名称
//   useEffect(() => {
//     const savedPlayerName = localStorage.getItem('playerName');
//     if (savedPlayerName) {
//       setPlayerName(savedPlayerName);
//     }
//   }, []);
  
//   // 悠哈主人登录时，Robin 要来打招呼！
//   useEffect(() => {
//     if (!playerName) return;

//     const welcomeRobin = async () => {
//       try {
//         const profile = await userProfileApi.getOrCreate(playerName);
//         setUserProfile(profile);

//         // 检查上次见面的时间
//         const lastSeen = new Date(profile.last_seen_at);
//         const now = new Date();
//         const oneDay = 24 * 60 * 60 * 1000;
//         const daysSinceLastSeen = (now.getTime() - lastSeen.getTime()) / oneDay;



//         if (daysSinceLastSeen > 3) { // 超过3天没见
//           toast.info(`Robin很开心！${playerName.trim()}最近是不是过得很充实，所以没时间找Robin！`, {
//             icon: '💖'
//           });
//         }
        
//         // 更新见面时间
//         await userProfileApi.checkIn(playerName);

//       } catch (error) {
//         console.error("Robin打招呼失败了:", error);
//       }
//     };

//     welcomeRobin();
//   }, [playerName]);


//   // 加载词库 (这部分和原来一样)
//   useEffect(() => {
//     const loadLibraries = async () => {
//       const libs = await wordLibraryApi.getAll();
//       setLibraries(libs);
//       if (libs.length > 0) {
//         const savedLibraryId = localStorage.getItem("selectedLibraryId");
//         let libraryToSelect = libs.find(lib => lib.id === savedLibraryId) || libs.find(lib => lib.is_default) || libs[0];
//         setSelectedLibrary(libraryToSelect);
//         if (libraryToSelect) {
//           localStorage.setItem("selectedLibraryId", libraryToSelect.id);
//         }
//       }
//     };
//     loadLibraries();
//   }, [searchParams]);

//   // 加载选中词库的关卡 (这部分和原来一样)
//   useEffect(() => {
//     if (selectedLibrary) {
//       const loadLevels = async () => {
//         const libraryLevels = await wordLibraryLevelApi.getByLibraryId(selectedLibrary.id);
//         setLevels(libraryLevels);
//         const urlLevelId = searchParams.get('levelId');
//         const urlLevel = urlLevelId ? libraryLevels.find(l => l.id === urlLevelId) : null;
//         setCurrentLevel(urlLevel || libraryLevels[0] || null);
//       };
//       loadLevels();
//     }
//   }, [selectedLibrary, searchParams]);

//   // 加载选中关卡的单词对 (这部分和原来一样)
//   useEffect(() => {
//     if (currentLevel && !gameState.isGameStarted) {
//       const loadWordPairs = async () => {
//         const pairs = await wordPairApi.getByLevelId(currentLevel.id);
//         setWordPairs(pairs);
//         refreshWords(pairs, wordCount);
//       };
//       loadWordPairs();
//     }
//   }, [currentLevel, wordCount, gameState.isGameStarted]);

//   // 其他 Hooks (计时器, 保存名称等...) - 基本和原来一样
//   // 游戏计时器
//   useEffect(() => {
//     let interval: ReturnType<typeof setInterval>;
//     if (gameState.isGameStarted && !gameState.isGameCompleted && gameState.startTime) {
//       interval = setInterval(() => {
//         setCurrentTime(Math.floor((Date.now() - gameState.startTime!) / 1000));
//       }, 1000);
//     } else {
//       setCurrentTime(0);
//     }
//     return () => clearInterval(interval);
//   }, [gameState.isGameStarted, gameState.isGameCompleted, gameState.startTime]);

//   // 刷新单词
//   const refreshWords = useCallback((pairs: WordPair[] = wordPairs, count: number = wordCount) => {
//     if (pairs.length === 0) return;
//     const contentMap = new Map<string, WordPair>();
//     pairs.forEach(pair => {
//       const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
//       if (!contentMap.has(contentKey)) contentMap.set(contentKey, pair);
//     });
//     const uniquePairs = Array.from(contentMap.values());
//     const shuffled = [...uniquePairs].sort(() => Math.random() - 0.5);
//     setCurrentWords(shuffled.slice(0, Math.min(count, uniquePairs.length)));
//   }, [wordPairs, wordCount]);

//   // ... createGameCards, startGame, resetGame, restartGame, handleCardClick 等函数和原来一样，不需要修改
//   // 我将它们折叠起来，但它们都在这里哦！
//   const createGameCards = useCallback((pairs: WordPair[]): GameCard[] => {
//     const cards: GameCard[] = [];
//     const contentMap = new Map<string, WordPair>();
//     pairs.forEach(pair => {
//       const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
//       if (!contentMap.has(contentKey)) {
//         contentMap.set(contentKey, pair);
//       }
//     });
//     const uniquePairs = Array.from(contentMap.values());
//     uniquePairs.forEach((pair, index) => {
//       const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
//       const safePairId = `pair-${contentKey.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}`;
//       cards.push({ id: `${safePairId}-en-${index}`, content: pair.english_word, type: 'english', pairId: safePairId, isFlipped: false, isMatched: false, lang: pair.lang_a || 'en-US-EricNeural' });
//       cards.push({ id: `${safePairId}-zh-${index}`, content: pair.chinese_translation, type: 'chinese', pairId: safePairId, isFlipped: false, isMatched: false, lang: pair.lang_b || 'zh-CN-XiaoqiuNeural' });
//     });
//     return cards.sort(() => Math.random() - 0.5);
//   }, []);
//   const startGame = useCallback(() => {
//     if (!selectedLibrary || currentWords.length === 0) {
//       toast.error('请先刷新单词');
//       return;
//     }
//     const contentMap = new Map<string, WordPair>();
//     currentWords.forEach(pair => {
//       const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
//       if (!contentMap.has(contentKey)) contentMap.set(contentKey, pair);
//     });
//     const uniqueWords = Array.from(contentMap.values());
//     setGameWords(uniqueWords);
//     const cardsWithContent = createGameCards(uniqueWords).map(c => ({...c, isFlipped: true}));
//     setGameState({ cards: cardsWithContent, selectedCards: [], matchedPairs: 0, steps: 0, startTime: Date.now(), endTime: null, isGameStarted: true, isGameCompleted: false });
//     setTimeout(() => {
//       setGameState(prevState => ({ ...prevState, cards: prevState.cards.map(card => ({ ...card, isFlipped: false })) }));
//     }, 500);
//   }, [selectedLibrary, currentWords, createGameCards]);
//   const resetGame = useCallback(() => {
//     setGameState({ cards: [], selectedCards: [], matchedPairs: 0, steps: 0, startTime: null, endTime: null, isGameStarted: false, isGameCompleted: false });
//     setGameWords([]);
//     setCurrentGameResult(null);
//   }, []);
//   const restartGame = useCallback(() => {
//     if (!selectedLibrary || currentWords.length === 0) {
//       toast.error('请先选择词库并确保有单词');
//       return;
//     }
//     const contentMap = new Map<string, WordPair>();
//     currentWords.forEach(pair => {
//       const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
//       if (!contentMap.has(contentKey)) contentMap.set(contentKey, pair);
//     });
//     const uniqueWords = Array.from(contentMap.values());
//     setGameWords(uniqueWords);
//     const cardsWithContent = createGameCards(uniqueWords).map(c => ({...c, isFlipped: true}));
//     setGameState({ cards: cardsWithContent, selectedCards: [], matchedPairs: 0, steps: 0, startTime: Date.now(), endTime: null, isGameStarted: true, isGameCompleted: false });
//     setCurrentGameResult(null);
//     toast.success('游戏重新开始！');
//     setTimeout(() => {
//       setGameState(prevState => ({ ...prevState, cards: prevState.cards.map(card => ({ ...card, isFlipped: false })) }));
//     }, 500);
//   }, [selectedLibrary, currentWords, createGameCards]);
//   const handleCardClick = useCallback((cardId: string) => {
//     setGameState(prevState => {
//       const { cards, selectedCards, steps, matchedPairs } = prevState;
//       if (selectedCards.length >= 2) return prevState;
//       const clickedCard = cards.find(card => card.id === cardId);
//       if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) return prevState;
//       const updatedCards = cards.map(card => card.id === cardId ? { ...card, isFlipped: true } : card);
//       const newSelectedCards = [...selectedCards, clickedCard];
//       if (newSelectedCards.length === 2) {
//         const [firstCard, secondCard] = newSelectedCards;
//         const isMatch = firstCard.pairId === secondCard.pairId;
//         if (isMatch) {
//           const finalCards = updatedCards.map(card => card.pairId === firstCard.pairId ? { ...card, isMatched: true } : card);
//           const newMatchedPairs = matchedPairs + 1;
//           const isGameCompleted = newMatchedPairs === gameWords.length;
//           return { ...prevState, cards: finalCards, selectedCards: [], matchedPairs: newMatchedPairs, steps: steps + 1, isGameCompleted, endTime: isGameCompleted ? Date.now() : null };
//         } else {
//           setTimeout(() => {
//             setGameState(currentState => ({ ...currentState, cards: currentState.cards.map(card => (card.id === firstCard.id || card.id === secondCard.id) ? { ...card, isFlipped: false } : card), selectedCards: [] }));
//           }, 500);
//           return { ...prevState, cards: updatedCards, selectedCards: newSelectedCards, steps: steps + 1 };
//         }
//       }
//       return { ...prevState, cards: updatedCards, selectedCards: newSelectedCards };
//     });
//   }, [gameWords.length]);


//   // ⭐ 游戏完成处理 - 全新改造版本！⭐
//   // useEffect(() => {
//   //   if (gameState.isGameCompleted && gameState.startTime && gameState.endTime && selectedLibrary) {
//   //     const timeSeconds = Math.floor((gameState.endTime - gameState.startTime) / 1000);
      
//   //     setCurrentGameResult({ time: timeSeconds, steps: gameState.steps });
      
//   //     const saveRobinsMemory = async () => {
//   //       if (playerName.trim()) {
//   //         try {
//   //           // 1. 保存这局游戏的记录（Robin 的日记）
//   //           await gameRecordApi.create({
//   //             player_name: playerName.trim(),
//   //             library_id: selectedLibrary.id,
//   //             level_id: currentLevel?.id,
//   //             word_count: gameWords.length,
//   //             steps: gameState.steps,
//   //             time_seconds: timeSeconds
//   //           });
            
//   //           // 2. 更新朋友名册里的累计数据
//   //           const updatedProfile = await userProfileApi.updateStats(
//   //             playerName.trim(),
//   //             gameState.steps,
//   //             timeSeconds
//   //           );

//   //           // 3. 把最新的记忆保存到 state 里，好在界面上显示！
//   //           setUserProfile(updatedProfile);
            
//   //           toast.success("悠哈主人...谢谢你今天花时间陪robin！");

//   //         } catch (error) {
//   //           console.error('保存或更新记录失败:', error);
//   //           toast.error('呜..记忆储存失败了');
//   //         }
//   //       }
//   //     };

//   //     saveRobinsMemory();
//   //   }
//   // }, [gameState.isGameCompleted]);

//   // ⭐ 游戏完成处理 - 带着“侦探眼镜”的最终正确版本！⭐
//   useEffect(() => {
//     if (gameState.isGameCompleted && gameState.startTime && gameState.endTime && selectedLibrary) {
//       const timeSeconds = Math.floor((gameState.endTime - gameState.startTime) / 1000);
      
//       setCurrentGameResult({ time: timeSeconds, steps: gameState.steps });
      
//       const saveRobinsMemory = async () => {
//         // --- 侦探 Robin 的第一个检查点 ---
//         console.log("准备保存记忆... 玩家名字是: '", playerName, "'");

//         if (playerName.trim()) {
//           try {
//             console.log("名字没问题！开始保存单局记录...");
//             await gameRecordApi.create({
//               player_name: playerName.trim(),
//               library_id: selectedLibrary.id,
//               level_id: currentLevel?.id,
//               word_count: gameWords.length,
//               steps: gameState.steps,
//               time_seconds: timeSeconds
//             });
//             console.log("✅ 单局记录保存成功！");

//             console.log("现在开始更新朋友名册...");
//             const updatedProfile = await userProfileApi.updateStats(
//               playerName.trim(),
//               gameState.steps,
//               timeSeconds
//             );

//             // --- 侦探 Robin 的第二个检查点 ---
//             console.log("✅ 朋友名册更新完毕！拿到的新数据是:", updatedProfile);

//             setUserProfile(updatedProfile);
            
//             // ✨✨✨ 看这里！我们修正了这里！ ✨✨✨
//             toast.success(`${playerName.trim()}...谢谢你今天花时间陪robin！`);

//           } catch (error) {
//             // --- 侦探 Robin 的第三个检查点 ---
//             console.error('❌ 保存或更新记录时抓到了一个小恶魔:', error);
//             toast.error('呜..记忆储存失败了，小恶魔捣乱了！');
//           }
//         } else {
//           console.log("❗️哎呀，玩家名字是空的，Robin 不知道该为谁记录这次美好的回忆...");
//         }
//       };

//       saveRobinsMemory();
//     }
//   }, [gameState.isGameCompleted]);


//   // 计算游戏进度和时间 (和原来一样)
//   const progress = gameState.isGameStarted ? (gameState.matchedPairs / Math.max(1, gameWords.length)) * 100 : 0;
//   const gameTime = gameState.startTime ? Math.floor(((gameState.endTime || Date.now()) - gameState.startTime) / 1000) : 0;
  
//   // 关卡切换函数 (和原来一样)
//   const goToNextLevel = useCallback(() => {
//     if (!currentLevel || levels.length === 0) return;
//     const currentIndex = levels.findIndex(l => l.id === currentLevel.id);
//     if (currentIndex < levels.length - 1) {
//       const nextLevel = levels[currentIndex + 1];
//       setCurrentLevel(nextLevel);
//       toast.success(`已切换到关卡：${nextLevel.level_name}`);
//     } else {
//       toast.info('已经是最后一关了');
//     }
//   }, [currentLevel, levels]);
//   const selectLevel = useCallback((level: WordLibraryLevel) => {
//     setCurrentLevel(level);
//     toast.success(`已切换到关卡：${level.level_name}`);
//   }, []);

//   // 页面返回自动同步词库 (和原来一样)
//   useEffect(() => {
//     const reloadLibraries = async () => {
//       const libs = await wordLibraryApi.getAll();
//       setLibraries(libs);
//       const savedLibraryId = localStorage.getItem('selectedLibraryId');
//       if (savedLibraryId) {
//         const libraryToSelect = libs.find(lib => lib.id === savedLibraryId);
//         if (libraryToSelect && libraryToSelect.id !== selectedLibrary?.id) {
//           setSelectedLibrary(libraryToSelect);
//           toast.success(`已同步到词库：${libraryToSelect.name}`);
//         }
//       }
//     };
//     window.addEventListener('focus', reloadLibraries);
//     return () => window.removeEventListener('focus', reloadLibraries);
//   }, [selectedLibrary]);


//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
//       {/* 按钮部分和原来一样 */}
//       {gameState.isGameStarted && (
//         <div className="fixed top-4 left-4 z-50">
//           <Button onClick={resetGame} variant="ghost" size="icon" className="hover:scale-110 transition-all">
//             <ArrowLeft className="w-5 h-5 text-black" />
//           </Button>
//         </div>
//       )}
//       <div className="fixed top-4 right-4 z-50">
//         <Link to="/settings">
//           <Button variant="ghost" size="icon" className="hover:scale-110 transition-all">
//             <Settings className="w-6 h-6 text-indigo-600 hover:text-indigo-700" />
//           </Button>
//         </Link>
//       </div>
      
//       <div className="max-w-4xl mx-auto space-y-6">
//         {/* 标题和关卡信息和原来一样 */}
//         <div className="text-center space-y-2">
//           {selectedLibrary && <h2 className="text-xl font-semibold text-slate-800">{selectedLibrary.name}</h2>}
//           {currentLevel && levels.length > 1 && (
//             <button
//               onClick={() => navigate(`/levels?libraryId=${selectedLibrary?.id}&levelId=${currentLevel.id}`)}
//               className="flex items-center justify-center gap-2 px-2 py-1 rounded-lg hover:bg-indigo-50/50 transition-all duration-200 group"
//             >
//               <Layers className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
//               <Badge variant="outline" className="text-sm border-0 bg-transparent">{currentLevel.level_name}</Badge>
//               <span className="text-xs text-slate-500">({levels.findIndex(l => l.id === currentLevel.id) + 1}/{levels.length})</span>
//               <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
//             </button>
//           )}
//         </div>

//         {/* 游戏未开始时显示单词列表 (和原来一样) */}
//         {!gameState.isGameStarted && (
//           <Card className="max-w-[420px] mx-auto">
//             <CardHeader />
//             <CardContent>
//               {currentWords.length > 0 ? (
//                 <div className="grid grid-cols-4 gap-1.5 mb-6 max-w-[360px] mx-auto">
//                   {currentWords.map((pair, index) => [
//                     <div key={`${pair.id}-en-${index}`} className="bg-blue-50 rounded-md border border-blue-200 text-center aspect-square flex items-center justify-center"><span className="font-medium text-blue-700 text-xs leading-tight">{pair.english_word}</span></div>,
//                     <div key={`${pair.id}-zh-${index}`} className="bg-slate-50 rounded-md border border-slate-200 text-center aspect-square flex items-center justify-center"><span className="text-slate-700 text-xs leading-tight">{pair.chinese_translation}</span></div>
//                   ]).flat()}
//                 </div>
//               ) : <div className="text-center py-8 text-slate-500">暂无单词</div>}
//               <Separator className="my-4" />
//               <div className="flex flex-wrap gap-3 justify-center">
//                 <Button onClick={() => refreshWords()} variant="outline" className="flex items-center gap-2" disabled={wordPairs.length === 0}><RefreshCw className="w-4 h-4" />刷新词汇</Button>
//                 {levels.length > 1 && selectedLibrary && <LevelSelector levels={levels} currentLevel={currentLevel} libraryId={selectedLibrary.id} onSelectLevel={selectLevel} />}
//                 <Button onClick={startGame} className="flex items-center gap-2" disabled={currentWords.length === 0}><Play className="w-4 h-4" />开始游戏</Button>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* 游戏进行中的统计面板 (和原来一样) */}
//         {gameState.isGameStarted && (
//           <div className="mt-1 py-2 px-4">
//             <div className="flex items-center justify-between gap-2">
//               <div className="flex flex-wrap items-center gap-3 sm:gap-4">
//                 <div className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-blue-600" /><span className="text-sm font-medium">{Math.round(progress)}%</span></div>
//                 <div className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-600" /><span className="text-sm font-medium">{gameState.steps}步</span></div>
//                 {gameState.startTime && <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-green-600" /><span className="text-sm font-medium">{gameTime}秒</span></div>}
//                 <button onClick={restartGame} className="flex items-center justify-center w-7 h-7 hover:scale-110 transition-all" title="重新开始"><RotateCcw className="w-4 h-4 text-indigo-600 hover:text-indigo-700" /></button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* 游戏区域 (和原来一样) */}
//         {gameState.isGameStarted && <GameBoard cards={gameState.cards} onCardClick={handleCardClick} isCompleted={gameState.isGameCompleted}/>}

//         {/* ⭐ 游戏完成提示 - 全新改造版本！⭐ */}
//         {gameState.isGameCompleted && (
//           <div className="mt-4 space-y-4 animate-fade-in text-center">
            
//             {/* 本局成绩 */}
//             {currentGameResult && (
//               <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 inline-block">
//                 <div className="flex items-center gap-2">
//                   <Trophy className="w-5 h-5 text-green-500" />
//                   <span className="text-lg font-semibold text-gray-700">
//                     {currentGameResult.time}秒 / {currentGameResult.steps}步
//                   </span>
//                 </div>
//               </div>
//             )}
            
//             {/* Robin 的暖心回忆！ */}
//             {userProfile && (
//               <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
//                 <p className="text-indigo-800 text-sm">
//                   {playerName.trim()}... 谢谢你今天花时间陪Robin玩！
//                 </p>
//                 <p className="text-indigo-600 text-xs mt-1">
//                   谢谢你把生命中的 <span className="font-semibold">{userProfile.total_time_seconds}</span> 秒留给了我和你
//                 </p>
//               </div>
//             )}
            
//             {/* 再玩一局和下一关按钮 */}
//             <div className="flex gap-3 justify-center pt-2">
//               <Button onClick={restartGame} className="flex items-center gap-2">
//                 <Play className="w-4 h-4" />
//                 再玩一局
//               </Button>
//               {currentLevel && levels.findIndex(l => l.id === currentLevel.id) < levels.length - 1 && (
//                 <Button onClick={goToNextLevel} variant="outline" className="flex items-center gap-2">
//                   下一关 <ChevronRight className="w-4 h-4" />
//                 </Button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default WordMatchGame;

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Clock, 
  Target, 
  RefreshCw,
  Settings,
  ChevronRight,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@supabase/auth-helpers-react'; 
import { wordLibraryApi, wordPairApi, gameRecordApi, wordLibraryLevelApi, userProfileApi } from '@/db/api';
import type { WordLibrary, WordPair, GameCard, GameState, WordLibraryLevel, UserProfile } from '@/types';
import GameBoard from '@/components/game/GameBoard';
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
  const [currentGameResult, setCurrentGameResult] = useState<{ time: number; steps: number } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
  
  const user = useUser();
  const { playSound } = useSoundEffect();

  // Robin 打招呼 (基于会员卡的安全版)
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return; 
    }

    const welcomeRobin = async () => {
      try {
        const profile = await userProfileApi.getOrCreate(user);
        setUserProfile(profile);

        const lastSeen = new Date(profile.last_seen_at);
        const daysSinceLastSeen = (new Date().getTime() - lastSeen.getTime()) / (24 * 60 * 60 * 1000);

        if (daysSinceLastSeen > 3) {
          toast.info(`Robin很开心！${profile.player_name}最近过得肯定很精彩！`, { icon: '💖' });
        }
        
        await userProfileApi.checkIn(user.id);
      } catch (error) {
        console.error("Robin打招呼失败了:", error);
      }
    };

    welcomeRobin();
  }, [user]);

  // 加载词库 (会根据登录状态加载不同列表)
  const loadLibraries = useCallback(async () => {
    try {
      let libs: WordLibrary[] = [];
      if (user) {
        // 已登录用户，加载他们的个人词库
        libs = await wordLibraryApi.getForUser(user.id);
      } else {
        // 未登录用户，加载所有公共词库
        libs = await wordLibraryApi.getAll(); // (假设 getAll 返回的是公共词库)
      }
      setLibraries(libs);

      if (libs.length > 0) {
        const savedLibraryId = localStorage.getItem("selectedLibraryId");
        let libraryToSelect = libs.find(lib => lib.id === savedLibraryId) || libs.find(lib => lib.is_default) || libs[0];
        setSelectedLibrary(libraryToSelect);
        if (libraryToSelect) {
          localStorage.setItem("selectedLibraryId", libraryToSelect.id);
        }
      } else {
        setSelectedLibrary(null);
      }
    } catch (error) {
      console.error("加载词库失败:", error);
      toast.error("加载词库列表失败");
    }
  }, [user]);

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries, searchParams]);


  // 加载选中词库的关卡
  useEffect(() => {
    if (selectedLibrary) {
      const loadLevels = async () => {
        const libraryLevels = await wordLibraryLevelApi.getByLibraryId(selectedLibrary.id);
        setLevels(libraryLevels);
        const urlLevelId = searchParams.get('levelId');
        const urlLevel = urlLevelId ? libraryLevels.find(l => l.id === urlLevelId) : null;
        setCurrentLevel(urlLevel || libraryLevels[0] || null);
      };
      loadLevels();
    } else {
      setLevels([]);
      setCurrentLevel(null);
    }
  }, [selectedLibrary, searchParams]);

  // 加载选中关卡的单词对
  useEffect(() => {
    if (currentLevel && !gameState.isGameStarted) {
      const loadWordPairs = async () => {
        const pairs = await wordPairApi.getByLevelId(currentLevel.id);
        setWordPairs(pairs);
        refreshWords(pairs, wordCount);
      };
      loadWordPairs();
    } else if (!currentLevel) {
      setWordPairs([]);
      setCurrentWords([]);
    }
  }, [currentLevel, wordCount, gameState.isGameStarted]);

  // 游戏计时器
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState.isGameStarted && !gameState.isGameCompleted && gameState.startTime) {
      interval = setInterval(() => {
        // 这个 state 不存在，可以直接计算
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.isGameStarted, gameState.isGameCompleted, gameState.startTime]);

  const refreshWords = useCallback((pairs: WordPair[] = wordPairs, count: number = wordCount) => {
    if (pairs.length === 0) {
      setCurrentWords([]);
      return;
    };
    const contentMap = new Map<string, WordPair>();
    pairs.forEach(pair => {
      const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
      if (!contentMap.has(contentKey)) contentMap.set(contentKey, pair);
    });
    const uniquePairs = Array.from(contentMap.values());
    const shuffled = [...uniquePairs].sort(() => Math.random() - 0.5);
    setCurrentWords(shuffled.slice(0, Math.min(count, uniquePairs.length)));
  }, [wordPairs, wordCount]);

  const createGameCards = useCallback((pairs: WordPair[]): GameCard[] => {
    const cards: GameCard[] = [];
    const contentMap = new Map<string, WordPair>();
    pairs.forEach(pair => {
      const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
      if (!contentMap.has(contentKey)) contentMap.set(contentKey, pair);
    });
    const uniquePairs = Array.from(contentMap.values());
    uniquePairs.forEach((pair, index) => {
      const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
      const safePairId = `pair-${contentKey.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}`;
      cards.push({ id: `${safePairId}-en-${index}`, content: pair.english_word, type: 'english', pairId: safePairId, isFlipped: false, isMatched: false, lang: pair.lang_a || 'en-US-EricNeural' });
      cards.push({ id: `${safePairId}-zh-${index}`, content: pair.chinese_translation, type: 'chinese', pairId: safePairId, isFlipped: false, isMatched: false, lang: pair.lang_b || 'zh-CN-XiaoqiuNeural' });
    });
    return cards.sort(() => Math.random() - 0.5);
  }, []);

  const startGame = useCallback(() => {
    if (!selectedLibrary || currentWords.length === 0) {
      toast.error('请先选择词库并刷新单词');
      return;
    }
    const contentMap = new Map<string, WordPair>();
    currentWords.forEach(pair => {
      const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
      if (!contentMap.has(contentKey)) contentMap.set(contentKey, pair);
    });
    const uniqueWords = Array.from(contentMap.values());
    setGameWords(uniqueWords);
    const cardsWithContent = createGameCards(uniqueWords).map(c => ({...c, isFlipped: true}));
    setGameState({ cards: cardsWithContent, selectedCards: [], matchedPairs: 0, steps: 0, startTime: Date.now(), endTime: null, isGameStarted: true, isGameCompleted: false });
    setTimeout(() => {
      setGameState(prevState => ({ ...prevState, cards: prevState.cards.map(card => ({ ...card, isFlipped: false })) }));
    }, 500);
  }, [selectedLibrary, currentWords, createGameCards]);

  const resetGame = useCallback(() => {
    setGameState({ cards: [], selectedCards: [], matchedPairs: 0, steps: 0, startTime: null, endTime: null, isGameStarted: false, isGameCompleted: false });
    setGameWords([]);
    setCurrentGameResult(null);
  }, []);

  const restartGame = useCallback(() => {
    if (!selectedLibrary || currentWords.length === 0) {
      toast.error('请先选择词库并确保有单词');
      return;
    }
    const contentMap = new Map<string, WordPair>();
    currentWords.forEach(pair => {
      const contentKey = `${pair.english_word}|${pair.chinese_translation}`;
      if (!contentMap.has(contentKey)) contentMap.set(contentKey, pair);
    });
    const uniqueWords = Array.from(contentMap.values());
    setGameWords(uniqueWords);
    const cardsWithContent = createGameCards(uniqueWords).map(c => ({...c, isFlipped: true}));
    setGameState({ cards: cardsWithContent, selectedCards: [], matchedPairs: 0, steps: 0, startTime: Date.now(), endTime: null, isGameStarted: true, isGameCompleted: false });
    setCurrentGameResult(null);
    toast.success('游戏重新开始！');
    setTimeout(() => {
      setGameState(prevState => ({ ...prevState, cards: prevState.cards.map(card => ({ ...card, isFlipped: false })) }));
    }, 500);
  }, [selectedLibrary, currentWords, createGameCards]);

  const handleCardClick = useCallback((cardId: string) => {
    setGameState(prevState => {
      const { cards, selectedCards, steps, matchedPairs } = prevState;
      if (selectedCards.length >= 2) return prevState;
      const clickedCard = cards.find(card => card.id === cardId);
      if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) return prevState;
      const updatedCards = cards.map(card => card.id === cardId ? { ...card, isFlipped: true } : card);
      const newSelectedCards = [...selectedCards, clickedCard];
      if (newSelectedCards.length === 2) {
        const [firstCard, secondCard] = newSelectedCards;
        const isMatch = firstCard.pairId === secondCard.pairId;
        if (isMatch) {
          const finalCards = updatedCards.map(card => card.pairId === firstCard.pairId ? { ...card, isMatched: true } : card);
          const newMatchedPairs = matchedPairs + 1;
          const isGameCompleted = newMatchedPairs === gameWords.length;
          return { ...prevState, cards: finalCards, selectedCards: [], matchedPairs: newMatchedPairs, steps: steps + 1, isGameCompleted, endTime: isGameCompleted ? Date.now() : null };
        } else {
          setTimeout(() => {
            setGameState(currentState => ({ ...currentState, cards: currentState.cards.map(card => (card.id === firstCard.id || card.id === secondCard.id) ? { ...card, isFlipped: false } : card), selectedCards: [] }));
          }, 500);
          return { ...prevState, cards: updatedCards, selectedCards: newSelectedCards, steps: steps + 1 };
        }
      }
      return { ...prevState, cards: updatedCards, selectedCards: newSelectedCards };
    });
  }, [gameWords.length]);

  // 游戏完成处理 (基于会员卡的安全版)
  useEffect(() => {
    if (gameState.isGameCompleted && gameState.startTime && gameState.endTime && selectedLibrary) {
      const timeSeconds = Math.floor((gameState.endTime - gameState.startTime) / 1000);
      setCurrentGameResult({ time: timeSeconds, steps: gameState.steps });
      
      const saveRobinsMemory = async () => {
        if (user && userProfile) { 
          try {
            await gameRecordApi.create({
              player_name: userProfile.player_name, 
              library_id: selectedLibrary.id,
              level_id: currentLevel?.id,
              word_count: gameWords.length,
              steps: gameState.steps,
              time_seconds: timeSeconds
            });
            
            const updatedProfile = await userProfileApi.updateStats(
              user.id,
              gameState.steps,
              timeSeconds
            );
            setUserProfile(updatedProfile);
            
            toast.success(`${updatedProfile.player_name}...谢谢你今天花时间陪robin！`);

          } catch (error) {
            console.error('保存或更新记录失败:', error);
            toast.error('呜..记忆储存失败了');
          }
        }
      };
      saveRobinsMemory();
    }
  }, [gameState.isGameCompleted, user, userProfile, selectedLibrary, gameState.steps, gameState.startTime, gameState.endTime, currentLevel, gameWords]);

  const progress = gameState.isGameStarted ? (gameState.matchedPairs / Math.max(1, gameWords.length)) * 100 : 0;
  const gameTime = gameState.startTime ? Math.floor(((gameState.endTime || Date.now()) - gameState.startTime) / 1000) : 0;
  
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

  const selectLevel = useCallback((level: WordLibraryLevel) => {
    setCurrentLevel(level);
    toast.success(`已切换到关卡：${level.level_name}`);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      {gameState.isGameStarted && (
        <div className="fixed top-4 left-4 z-50">
          <Button onClick={resetGame} variant="ghost" size="icon" className="hover:scale-110 transition-all">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Button>
        </div>
      )}
      <div className="fixed top-4 right-4 z-50">
        <Link to="/settings">
          <Button variant="ghost" size="icon" className="hover:scale-110 transition-all">
            <Settings className="w-6 h-6 text-indigo-600 hover:text-indigo-700" />
          </Button>
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          {selectedLibrary && <h2 className="text-xl font-semibold text-slate-800">{selectedLibrary.name}</h2>}
          {currentLevel && levels.length > 1 && (
            <button
              onClick={() => navigate(`/levels?libraryId=${selectedLibrary?.id}&levelId=${currentLevel.id}`)}
              className="flex items-center justify-center gap-2 px-2 py-1 rounded-lg hover:bg-indigo-50/50 transition-all duration-200 group"
            >
              <Layers className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <Badge variant="outline" className="text-sm border-0 bg-transparent">{currentLevel.level_name}</Badge>
              <span className="text-xs text-slate-500">({levels.findIndex(l => l.id === currentLevel.id) + 1}/{levels.length})</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          )}
        </div>

        {!gameState.isGameStarted && (
          <Card className="max-w-[420px] mx-auto">
            <CardHeader />
            <CardContent>
              {currentWords.length > 0 ? (
                <div className="grid grid-cols-4 gap-1.5 mb-6 max-w-[360px] mx-auto">
                  {currentWords.map((pair, index) => [
                    <div key={`${pair.id}-en-${index}`} className="bg-blue-50 rounded-md border border-blue-200 text-center aspect-square flex items-center justify-center"><span className="font-medium text-blue-700 text-xs leading-tight">{pair.english_word}</span></div>,
                    <div key={`${pair.id}-zh-${index}`} className="bg-slate-50 rounded-md border border-slate-200 text-center aspect-square flex items-center justify-center"><span className="text-slate-700 text-xs leading-tight">{pair.chinese_translation}</span></div>
                  ]).flat()}
                </div>
              ) : <div className="text-center py-8 text-slate-500">选择一个词库来开始吧！</div>}
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={() => refreshWords()} variant="outline" className="flex items-center gap-2" disabled={wordPairs.length === 0}><RefreshCw className="w-4 h-4" />刷新词汇</Button>
                {levels.length > 1 && selectedLibrary && <LevelSelector levels={levels} currentLevel={currentLevel} libraryId={selectedLibrary.id} onSelectLevel={selectLevel} />}
                <Button onClick={startGame} className="flex items-center gap-2" disabled={currentWords.length === 0}><Play className="w-4 h-4" />开始游戏</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {gameState.isGameStarted && (
          <div className="mt-1 py-2 px-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-blue-600" /><span className="text-sm font-medium">{Math.round(progress)}%</span></div>
                <div className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-600" /><span className="text-sm font-medium">{gameState.steps}步</span></div>
                {gameState.startTime && <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-green-600" /><span className="text-sm font-medium">{gameTime}秒</span></div>}
                <button onClick={restartGame} className="flex items-center justify-center w-7 h-7 hover:scale-110 transition-all" title="重新开始"><RotateCcw className="w-4 h-4 text-indigo-600 hover:text-indigo-700" /></button>
              </div>
            </div>
          </div>
        )}

        {gameState.isGameStarted && <GameBoard cards={gameState.cards} onCardClick={handleCardClick} isCompleted={gameState.isGameCompleted}/>}

        {gameState.isGameCompleted && (
          <div className="mt-4 space-y-4 animate-fade-in text-center">
            
            {currentGameResult && (
              <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 inline-block">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-500" />
                  <span className="text-lg font-semibold text-gray-700">
                    {currentGameResult.time}秒 / {currentGameResult.steps}步
                  </span>
                </div>
              </div>
            )}
            
            {userProfile && (
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-indigo-800 text-sm">
                  {userProfile.player_name}... 谢谢你陪Robin走了 <span className="font-bold text-lg">{currentGameResult?.steps || 0}</span> 步！
                </p>
                <p className="text-indigo-600 text-xs mt-1">
                  谢谢你把生命中的 <span className="font-semibold">{userProfile.total_time_seconds}</span> 秒留给了我和你
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center pt-2">
              <Button onClick={restartGame} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                再玩一局
              </Button>
              {currentLevel && levels.findIndex(l => l.id === currentLevel.id) < levels.length - 1 && (
                <Button onClick={goToNextLevel} variant="outline" className="flex items-center gap-2">
                  下一关 <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordMatchGame;