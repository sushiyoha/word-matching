import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, BookOpen, Users, Clock, Plus } from 'lucide-react';
import GameSettings from '@/components/game/GameSettings';
import { wordLibraryApi } from '@/db/api';
import type { WordLibrary } from '@/types';

const TestPublicLibraries: React.FC = () => {
  const [libraries, setLibraries] = useState<WordLibrary[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<WordLibrary | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [playerName, setPlayerName] = useState('测试用户');

  useEffect(() => {
    loadLibraries();
  }, []);

  const loadLibraries = async () => {
    try {
      const data = await wordLibraryApi.getAll();
      setLibraries(data);
      if (data.length > 0 && !selectedLibrary) {
        setSelectedLibrary(data[0]);
      }
    } catch (error) {
      console.error('Error loading libraries:', error);
    }
  };

  const handleLibraryChange = (library: WordLibrary) => {
    setSelectedLibrary(library);
  };

  const handlePlayerNameChange = (name: string) => {
    setPlayerName(name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Globe className="w-8 h-8 text-blue-600" />
            公共词库浏览功能测试
          </h1>
          <p className="text-gray-600">
            测试查看所有用户上传的词库，并添加到自己词库的功能
          </p>
        </div>

        {/* 功能说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              功能说明
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-green-700">✅ 已实现功能</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 浏览所有公共词库</li>
                  <li>• 搜索词库名称和描述</li>
                  <li>• 预览词库内容</li>
                  <li>• 复制词库到个人词库</li>
                  <li>• 响应式界面设计</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-blue-700">🔧 使用方法</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 点击"游戏设置"按钮</li>
                  <li>• 在词库选择区域点击"浏览公共词库"</li>
                  <li>• 点击"加载公共词库"查看所有词库</li>
                  <li>• 使用搜索框筛选词库</li>
                  <li>• 点击"添加到我的词库"复制词库</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 当前状态 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-medium">词库总数</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {libraries.length}
              </div>
              <div className="text-sm text-gray-500">
                包含默认和用户创建的词库
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-medium">公共词库</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {libraries.filter(lib => !lib.is_default).length}
              </div>
              <div className="text-sm text-gray-500">
                用户上传的可共享词库
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="font-medium">当前选择</span>
              </div>
              <div className="text-lg font-bold text-purple-600 truncate">
                {selectedLibrary?.name || '未选择'}
              </div>
              <div className="text-sm text-gray-500">
                {selectedLibrary?.is_default ? '默认词库' : '用户词库'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 词库列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              当前词库列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {libraries.map((library) => (
                <div
                  key={library.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    selectedLibrary?.id === library.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <h3 className="font-medium">{library.name}</h3>
                        {library.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            默认
                          </Badge>
                        )}
                      </div>
                      
                      {library.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {library.description}
                        </p>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        创建时间: {new Date(library.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Button
                      variant={selectedLibrary?.id === library.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleLibraryChange(library)}
                    >
                      {selectedLibrary?.id === library.id ? '已选择' : '选择'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 测试按钮 */}
        <div className="flex justify-center">
          <Button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-8 py-3 text-lg"
          >
            <Plus className="w-5 h-5" />
            打开游戏设置 - 测试公共词库功能
          </Button>
        </div>

        {/* 使用提示 */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">测试步骤</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. 点击上方"打开游戏设置"按钮</li>
                  <li>2. 在词库选择区域找到"浏览公共词库"按钮（蓝色图标）</li>
                  <li>3. 点击"浏览公共词库"打开公共词库浏览对话框</li>
                  <li>4. 点击"加载公共词库"查看所有可用的公共词库</li>
                  <li>5. 使用搜索框筛选感兴趣的词库</li>
                  <li>6. 点击"预览"查看词库内容，点击"添加到我的词库"复制词库</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 游戏设置对话框 */}
      <GameSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        libraries={libraries}
        selectedLibrary={selectedLibrary}
        onLibraryChange={handleLibraryChange}
        playerName={playerName}
        onPlayerNameChange={handlePlayerNameChange}
      />
    </div>
  );
};

export default TestPublicLibraries;