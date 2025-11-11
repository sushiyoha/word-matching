import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trophy, Clock, Target, Medal, Crown, Award } from 'lucide-react';
import { gameRecordApi } from '@/db/api';
import type { WordLibrary, GameRecord, WordLibraryLevel } from '@/types';

interface LeaderboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLibrary: WordLibrary | null;
  currentLevel?: WordLibraryLevel | null;
  wordCount: number;
  refreshKey?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  open,
  onOpenChange,
  selectedLibrary,
  currentLevel,
  wordCount,
  refreshKey,
}) => {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && selectedLibrary) {
      loadLeaderboard();
    }
  }, [open, selectedLibrary, currentLevel, wordCount, refreshKey]);

  const loadLeaderboard = async () => {
    if (!selectedLibrary) return;

    setLoading(true);
    try {
      const data = await gameRecordApi.getLeaderboard(
        selectedLibrary.id, 
        wordCount, 
        currentLevel?.id, 
        20
      );
      setRecords(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-500">
          {rank}
        </span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return 'default';
      case 2:
        return 'secondary';
      case 3:
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            排行榜
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 当前设置信息 */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">词库:</span>
                  <Badge variant="secondary">
                    {selectedLibrary?.name || '未选择'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">单词数量:</span>
                  <Badge variant="outline">{wordCount}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 排行榜列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">最佳成绩</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">
                  加载中...
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  暂无记录，快来创造第一个记录吧！
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record, index) => {
                    const rank = index + 1;
                    return (
                      <div
                        key={record.id}
                        className={`
                          flex items-center gap-4 p-3 rounded-lg border transition-colors
                          ${rank <= 3 
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                            : 'bg-slate-50 border-slate-200'
                          }
                        `}
                      >
                        {/* 排名 */}
                        <div className="flex items-center gap-2">
                          {getRankIcon(rank)}
                          <Badge variant={getRankBadgeVariant(rank)} className="min-w-[2rem] justify-center">
                            #{rank}
                          </Badge>
                        </div>

                        {/* 玩家信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800 truncate">
                            {record.player_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatDate(record.completed_at)}
                          </div>
                        </div>

                        {/* 成绩信息 */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-blue-600">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{formatTime(record.time_seconds)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600">
                            <Target className="w-4 h-4" />
                            <span className="font-medium">{record.steps}步</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 统计信息 */}
          {records.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">统计信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatTime(records[0].time_seconds)}
                    </div>
                    <div className="text-sm text-slate-600">最快时间</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.min(...records.map(r => r.steps))}
                    </div>
                    <div className="text-sm text-slate-600">最少步数</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(records.reduce((sum, r) => sum + r.time_seconds, 0) / records.length)}s
                    </div>
                    <div className="text-sm text-slate-600">平均时间</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {records.length}
                    </div>
                    <div className="text-sm text-slate-600">总记录数</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Leaderboard;