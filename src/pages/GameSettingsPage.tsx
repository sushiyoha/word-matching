import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  BookOpen, 
  Plus, 
  Upload, 
  Eye, 
  Globe, 
  Search,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import { wordLibraryApi, wordPairApi } from '@/db/api';
import type { WordLibrary } from '@/types';

const GameSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [libraries, setLibraries] = useState<WordLibrary[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<WordLibrary | null>(null);
  const [playerName, setPlayerName] = useState('');
  
  // 词库管理状态
  const [showLibraryDetails, setShowLibraryDetails] = useState(false);
  const [viewingLibrary, setViewingLibrary] = useState<WordLibrary | null>(null);
  const [libraryWords, setLibraryWords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingWord, setEditingWord] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddWordDialog, setShowAddWordDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingWord, setIsAddingWord] = useState(false);

  useEffect(() => {
    loadLibraries();
    loadPlayerName();
  }, []);

  const loadLibraries = async () => {
    try {
      const data = await wordLibraryApi.getAll();
      setLibraries(data);
      
      // 尝试从localStorage恢复之前选择的词库
      const savedLibraryId = localStorage.getItem('selectedLibraryId');
      let libraryToSelect = null;
      
      if (savedLibraryId && data.length > 0) {
        libraryToSelect = data.find(lib => lib.id === savedLibraryId);
      }
      
      // 如果没有找到保存的词库，则选择默认词库或第一个词库
      if (!libraryToSelect && data.length > 0) {
        libraryToSelect = data.find(lib => lib.is_default) || data[0];
      }
      
      if (libraryToSelect && !selectedLibrary) {
        setSelectedLibrary(libraryToSelect);
      }
    } catch (error) {
      console.error('Error loading libraries:', error);
      toast.error('加载词库失败');
    }
  };

  const loadPlayerName = () => {
    const saved = localStorage.getItem('playerName');
    if (saved) {
      setPlayerName(saved);
    }
  };

  const handlePlayerNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('playerName') as string;
    if (name.trim()) {
      setPlayerName(name.trim());
      localStorage.setItem('playerName', name.trim());
      toast.success('玩家名称已保存');
    }
  };

  const handleLibraryChange = (library: WordLibrary) => {
    setSelectedLibrary(library);
    // 保存选中的词库ID到localStorage
    localStorage.setItem('selectedLibraryId', library.id);
    
    // 触发自定义事件通知其他页面
    window.dispatchEvent(new CustomEvent('libraryChanged', { 
      detail: { library } 
    }));
    
    toast.success(`已切换到词库：${library.name}，主页面将自动更新`);
  };

  // 查看词库详情
  const handleViewLibrary = async (library: WordLibrary) => {
    setViewingLibrary(library);
    setShowLibraryDetails(true);
    
    try {
      const words = await wordPairApi.getByLibraryId(library.id);
      setLibraryWords(words);
    } catch (error) {
      console.error('Error loading library words:', error);
      toast.error('加载词库内容失败');
    }
  };

  // 过滤搜索结果
  const filteredWords = libraryWords.filter(word =>
    word.english_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.chinese_translation.includes(searchTerm)
  );

  return (
    <div className="max-w-[420px] mx-auto bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </div>
      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 用户设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">用户</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePlayerNameSubmit} className="space-y-4">
              <div>
                <label htmlFor="playerName" className="text-sm font-medium">用户昵称</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="playerName"
                    name="playerName"
                    placeholder="输入你的昵称"
                    defaultValue={playerName}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    确定
                  </Button>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  用于记录游戏成绩和排行榜显示
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
        {/* 词库选择 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">词库</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedLibrary?.id || ''}
              onValueChange={(value) => {
                const library = libraries.find(lib => lib.id === value);
                if (library) handleLibraryChange(library);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择词库">
                  {selectedLibrary && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{selectedLibrary.name}</span>
                      {selectedLibrary.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          默认
                        </Badge>
                      )}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {libraries.map((library) => (
                  <SelectItem key={library.id} value={library.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{library.name}</span>
                      {library.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          默认
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedLibrary && (
              <div className="space-y-3">
                <div className="text-sm text-slate-600">
                  {selectedLibrary.description || '暂无描述'}
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/library/${selectedLibrary.id}`)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    查看词库
                  </Button>
                  
                  <Link to="/public-libraries">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-4 h-4" />
                      浏览公共词库
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* 创建自定义词库 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">上传</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/create-library')}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              添加新词库
            </Button>
          </CardContent>
        </Card>
        {/* 快速操作 */}

      </div>
      {/* 词库详情对话框 */}
      <Dialog open={showLibraryDetails} onOpenChange={setShowLibraryDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {viewingLibrary?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索单词..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 单词列表 */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredWords.map((word) => (
                <div
                  key={word.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{word.english_word}</div>
                    <div className="text-sm text-gray-600">{word.chinese_translation}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-sm text-gray-500 text-center">
              共 {libraryWords.length} 个单词对
              {searchTerm && ` (显示 ${filteredWords.length} 个匹配结果)`}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameSettingsPage;