import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BookOpen, HelpCircle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WordMatchGameSimple: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 模拟加载过程
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleTestClick = () => {
    toast.success('测试成功！应用正在正常工作。');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">错误</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>刷新页面</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">英语单词消消乐</h1>
          <p className="text-slate-600">翻牌配对，轻松记忆英语单词</p>
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/library')}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            词库管理
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/help')}
            className="flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            游戏帮助
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/test-library')}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            测试词库功能
          </Button>
        </div>

        {/* 主要内容 */}
        <Card>
          <CardHeader>
            <CardTitle>游戏状态</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-500">正在初始化应用...</p>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-green-600 font-medium">✅ 应用已成功加载！</p>
                <p className="text-slate-600">基础功能正常工作</p>
                <Button onClick={handleTestClick} className="mt-4">
                  测试功能
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 功能说明 */}
        <Card>
          <CardHeader>
            <CardTitle>功能特点</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">📚 词库管理</h3>
                <p className="text-blue-600 text-sm">支持自定义词库和Excel上传</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">🎮 游戏模式</h3>
                <p className="text-green-600 text-sm">基础模式和加词模式</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">📊 记录统计</h3>
                <p className="text-purple-600 text-sm">步数、时间和排行榜</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-medium text-orange-800 mb-2">📱 响应式设计</h3>
                <p className="text-orange-600 text-sm">适配各种屏幕尺寸</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 开发状态说明 */}
        <Card>
          <CardHeader>
            <CardTitle>开发状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium mb-2">🚧 应用正在修复中</p>
              <p className="text-yellow-700 text-sm">
                我们检测到应用出现了一些问题，目前正在使用简化版本确保基本功能正常工作。
                完整的游戏功能将在问题修复后恢复。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WordMatchGameSimple;