import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Layers, Trophy, Clock, Target } from "lucide-react";
import { wordLibraryApi, wordLibraryLevelApi, wordPairApi, gameRecordApi } from "@/db/api";
import type { WordLibrary, WordLibraryLevel, GameRecord } from "@/types";

export default function LevelSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const libraryId = searchParams.get("libraryId");
  const currentLevelId = searchParams.get("levelId");

  const [library, setLibrary] = useState<WordLibrary | null>(null);
  const [levels, setLevels] = useState<WordLibraryLevel[]>([]);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [levelWordCounts, setLevelWordCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!libraryId) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        
        // 加载词库信息
        const libs = await wordLibraryApi.getAll();
        const lib = libs.find(l => l.id === libraryId);
        if (!lib) {
          navigate("/");
          return;
        }
        setLibrary(lib);

        // 加载关卡列表
        const levelsData = await wordLibraryLevelApi.getByLibraryId(libraryId);
        setLevels(levelsData);

        // 加载所有单词对并计算每个关卡的单词数量
        const wordPairs = await wordPairApi.getByLibraryId(libraryId);
        const counts: Record<string, number> = {};
        levelsData.forEach(level => {
          counts[level.id] = wordPairs.filter(wp => wp.level_id === level.id).length;
        });
        setLevelWordCounts(counts);

        // 加载游戏记录
        const recordsData = await gameRecordApi.getByLibraryId(libraryId);
        setRecords(recordsData);
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [libraryId, navigate]);

  // 获取关卡的最佳记录
  const getLevelBestRecord = (levelId: string) => {
    const levelRecords = records.filter(r => r.level_id === levelId);
    if (levelRecords.length === 0) return null;
    
    return levelRecords.reduce((best, current) => {
      if (!best || current.time_seconds < best.time_seconds) {
        return current;
      }
      return best;
    });
  };

  // 选择关卡
  const selectLevel = (levelId: string) => {
    navigate(`/?libraryId=${libraryId}&levelId=${levelId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!library) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="hover:scale-110 transition-all duration-200 w-10 h-10 p-0 flex items-center justify-center"
          >
            <span className="text-indigo-600 text-2xl">←</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{library.name}</h1>

          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        </div>

        {/* 关卡列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {levels.map((level, index) => {
            const bestRecord = getLevelBestRecord(level.id);
            const isCurrentLevel = level.id === currentLevelId;

            return (
              <Card
                key={level.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  isCurrentLevel
                    ? "border-2 border-indigo-500 bg-indigo-50/50"
                    : "border-slate-200 hover:border-indigo-300"
                }`}
                onClick={() => selectLevel(level.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        bestRecord
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{level.level_name}</h3>
                        <p className="text-sm text-slate-600">{levelWordCounts[level.id] || 0} 个单词</p>
                      </div>
                    </div>
                    {isCurrentLevel && (
                      <Badge variant="default" className="bg-indigo-600">
                        当前关卡
                      </Badge>
                    )}
                    {bestRecord && !isCurrentLevel && (
                      <Badge variant="outline" className="border-green-600 text-green-700">
                        <Trophy className="w-3 h-3 mr-1" />
                        已完成
                      </Badge>
                    )}
                  </div>

                  {bestRecord && (
                    <div className="flex items-center gap-4 text-sm text-slate-600 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{bestRecord.time_seconds}秒</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{bestRecord.steps}步</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {levels.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无关卡</p>
          </div>
        )}
      </div>
    </div>
  );
}
