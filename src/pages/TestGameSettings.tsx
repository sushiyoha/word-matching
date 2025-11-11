import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import GameSettings from '@/components/game/GameSettings';
import { wordLibraryApi } from '@/db/api';
import type { WordLibrary } from '@/types';

const TestGameSettings: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [libraries, setLibraries] = useState<WordLibrary[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<WordLibrary | null>(null);
  const [playerName, setPlayerName] = useState('测试玩家');

  useEffect(() => {
    loadLibraries();
  }, []);

  const loadLibraries = async () => {
    try {
      const data = await wordLibraryApi.getAll();
      setLibraries(data);
      
      // 选择默认词库
      const defaultLibrary = data.find(lib => lib.is_default);
      if (defaultLibrary) {
        setSelectedLibrary(defaultLibrary);
      }
    } catch (error) {
      console.error('Error loading libraries:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回主页
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">游戏设置功能测试</h1>
        </div>

        {/* 功能说明 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-blue-600">新增词库管理功能</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600">✅ 已实现功能</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 词库删除：可删除非默认词库</li>
                  <li>• 词库查看：查看词库中的所有单词对</li>
                  <li>• 单词搜索：在词库中搜索特定单词</li>
                  <li>• 单词编辑：修改词库中的单词和翻译</li>
                  <li>• 单词删除：删除不需要的单词对</li>
                  <li>• 添加词对：向现有词库添加新的单词对</li>
                  <li>• Excel批量添加：支持上传Excel文件批量添加单词对</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-600">🎯 使用方法</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>1. 点击下方"打开游戏设置"按钮</li>
                  <li>2. 在"词库选择"区域选择一个词库</li>
                  <li>3. 点击"查看词库"按钮查看内容</li>
                  <li>4. 使用搜索框搜索单词</li>
                  <li>5. 点击"添加词对"按钮添加新单词</li>
                  <li>6. 选择手动添加或Excel批量添加</li>
                  <li>7. 点击编辑/删除按钮管理单词</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 当前状态 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>当前状态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">词库总数：</span>
                <span className="text-blue-600">{libraries.length} 个</span>
              </div>
              <div>
                <span className="font-medium">当前选中：</span>
                <span className="text-green-600">{selectedLibrary?.name || '未选择'}</span>
              </div>
              <div>
                <span className="font-medium">玩家名称：</span>
                <span className="text-purple-600">{playerName}</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📚 内置词库</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>• 游戏术语词库：包含FPS、MOBA等游戏相关词汇</div>
                <div>• 高考3500词：高考英语大纲词汇表，适合高中生学习 ⭐ 新增</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 测试按钮 */}
        <div className="text-center">
          <Button
            onClick={() => setShowSettings(true)}
            size="lg"
            className="flex items-center gap-2"
          >
            <Settings className="w-5 h-5" />
            打开游戏设置
          </Button>
          
          <p className="text-sm text-gray-600 mt-4">
            点击按钮打开游戏设置对话框，测试新增的词库管理功能
          </p>
        </div>

        {/* 游戏设置对话框 */}
        <GameSettings
          open={showSettings}
          onOpenChange={setShowSettings}
          libraries={libraries}
          selectedLibrary={selectedLibrary}
          onLibraryChange={setSelectedLibrary}
          playerName={playerName}
          onPlayerNameChange={setPlayerName}
        />
      </div>
    </div>
  );
};

export default TestGameSettings;