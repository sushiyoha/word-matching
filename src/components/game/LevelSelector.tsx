import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { gameRecordApi } from '@/db/api';
import type { WordLibraryLevel, GameRecord } from '@/types';

interface LevelSelectorProps {
  levels: WordLibraryLevel[];
  currentLevel: WordLibraryLevel | null;
  libraryId: string;
  onSelectLevel: (level: WordLibraryLevel) => void;
  trigger?: React.ReactNode;
}

interface LevelStats {
  bestTime?: number;
  bestSteps?: number;
  playCount: number;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  levels,
  currentLevel,
  libraryId,
  onSelectLevel,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [levelStats, setLevelStats] = useState<Map<string, LevelStats>>(new Map());
  const [loading, setLoading] = useState(false);

  // 加载关卡统计数据
  useEffect(() => {
    if (open && levels.length > 0) {
      loadLevelStats();
    }
  }, [open, levels]);

  const loadLevelStats = async () => {
    setLoading(true);
    try {
      const statsMap = new Map<string, LevelStats>();
      
      for (const level of levels) {
        const records = await gameRecordApi.getLeaderboard(libraryId, 10, level.id);
        
        if (records.length > 0) {
          const bestRecord = records[0];
          statsMap.set(level.id, {
            bestTime: bestRecord.time_seconds,
            bestSteps: bestRecord.steps,
            playCount: records.length
          });
        } else {
          statsMap.set(level.id, {
            playCount: 0
          });
        }
      }
      
      setLevelStats(statsMap);
    } catch (error) {
      console.error('加载关卡统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLevel = (level: WordLibraryLevel) => {
    onSelectLevel(level);
    setOpen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <></>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Layers className="w-5 h-5 text-blue-500" />
            关卡选择
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">加载中...</div>
            </div>
          ) : levels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Layers className="w-12 h-12 mb-4 opacity-50" />
              <p>暂无关卡</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {levels.map((level, index) => {
                const stats = levelStats.get(level.id);
                const isCurrentLevel = currentLevel?.id === level.id;
                
                return (
                  <div
                    key={level.id}
                    className={`
                      relative group cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
                      ${isCurrentLevel 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'border-border hover:border-blue-300 hover:bg-accent'
                      }
                    `}
                    onClick={() => handleSelectLevel(level)}
                  >
                    {/* 关卡序号标签 */}
                    <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                      {index + 1}
                    </div>

                    {/* 当前关卡标记 */}
                    {isCurrentLevel && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-green-500 text-white shadow-lg">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          当前
                        </Badge>
                      </div>
                    )}

                    {/* 关卡名称 */}
                    <div className="mt-2 mb-3">
                      <h3 className="font-semibold text-lg truncate pr-8">
                        {level.level_name}
                      </h3>
                    </div>

                    {/* 统计信息 */}
                    {stats && (
                      <div className="space-y-2 text-sm">
                        {stats.bestTime !== undefined && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span>最佳: {formatTime(stats.bestTime)}</span>
                          </div>
                        )}
                        
                        {stats.bestSteps !== undefined && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>步数: {stats.bestSteps}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-xs">
                            {stats.playCount > 0 
                              ? `已挑战 ${stats.playCount} 次` 
                              : '未挑战'
                            }
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 悬停效果 */}
                    <div className={`
                      absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                      ${isCurrentLevel ? 'opacity-100' : ''}
                    `} />
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            共 {levels.length} 个关卡
          </div>
          <Button variant="outline" onClick={() => setOpen(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelSelector;
