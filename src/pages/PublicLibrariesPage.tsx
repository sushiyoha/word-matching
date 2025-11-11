import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  BookOpen, 
  Plus, 
  Eye, 
  Globe, 
  Search
} from 'lucide-react';
import { wordLibraryApi, wordPairApi } from '@/db/api';
import type { WordLibrary } from '@/types';

const PublicLibrariesPage: React.FC = () => {
  const navigate = useNavigate();
  const [publicLibraries, setPublicLibraries] = useState<WordLibrary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 词库详情状态
  const [showLibraryDetails, setShowLibraryDetails] = useState(false);
  const [viewingLibrary, setViewingLibrary] = useState<WordLibrary | null>(null);
  const [libraryWords, setLibraryWords] = useState<any[]>([]);
  const [wordSearchTerm, setWordSearchTerm] = useState('');

  useEffect(() => {
    loadPublicLibraries();
  }, []);

  // 加载公共词库
  const loadPublicLibraries = async () => {
    setIsLoading(true);
    try {
      const allLibraries = await wordLibraryApi.getAll();
      // 过滤出非当前用户的词库（这里简化处理，实际应该根据用户ID过滤）
      const publicLibs = allLibraries.filter(lib => !lib.is_default);
      setPublicLibraries(publicLibs);
    } catch (error) {
      console.error('Error loading public libraries:', error);
      toast.error('加载公共词库失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 复制公共词库到自己的词库
  const handleCopyPublicLibrary = async (publicLibrary: WordLibrary) => {
    try {
      // 创建新的词库
      const newLibrary = await wordLibraryApi.create({
        name: `${publicLibrary.name} (副本)`,
        description: `复制自公共词库：${publicLibrary.description}`,
      });

      if (newLibrary) {
        // 获取原词库的所有单词
        const words = await wordPairApi.getByLibraryId(publicLibrary.id);
        
        // 复制所有单词到新词库
        for (const word of words) {
          await wordPairApi.create({
            library_id: newLibrary.id,
            english_word: word.english_word,
            chinese_translation: word.chinese_translation,
          });
        }

        toast.success(`成功复制词库"${publicLibrary.name}"到您的词库中`);
      }
    } catch (error) {
      console.error('Error copying public library:', error);
      toast.error('复制词库失败');
    }
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
  const filteredPublicLibraries = publicLibraries.filter(lib =>
    lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lib.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 过滤词库内单词
  const filteredWords = libraryWords.filter(word =>
    word.english_word.toLowerCase().includes(wordSearchTerm.toLowerCase()) ||
    word.chinese_translation.includes(wordSearchTerm)
  );

  return (
    <div className="max-w-[420px] mx-auto bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">公共词库</h1>
            </div>
          </div>
        </div>
      </div>
      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 搜索区域 */}
        <Card>

          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索词库名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        {/* 词库列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                词库列表
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadPublicLibraries}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {isLoading ? '加载中...' : '刷新'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 加载状态 */}
            {isLoading && (
              <div className="text-center py-8 text-gray-500">
                正在加载公共词库...
              </div>
            )}

            {/* 词库统计 */}
            {!isLoading && filteredPublicLibraries.length > 0 && (
              <div className="mb-4 text-sm text-gray-600">
                找到 {filteredPublicLibraries.length} 个公共词库
                {searchTerm && ` (搜索: "${searchTerm}")`}
              </div>
            )}

            {/* 词库网格 */}
            {!isLoading && filteredPublicLibraries.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {filteredPublicLibraries.map((library) => (
                  <Card key={library.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* 词库标题 */}
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <h3 className="font-medium text-sm">{library.name}</h3>
                        </div>
                        
                        {/* 词库描述 */}
                        {library.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {library.description}
                          </p>
                        )}
                        
                        {/* 创建时间 */}
                        <div className="text-xs text-gray-500">
                          创建时间: {new Date(library.created_at).toLocaleDateString()}
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLibrary(library)}
                            className="flex-1 flex items-center gap-1 text-xs"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleCopyPublicLibrary(library)}
                            className="flex-1 flex items-center gap-1 text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* 无结果提示 */}
            {!isLoading && publicLibraries.length > 0 && filteredPublicLibraries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>没有找到匹配的词库</p>
                <p className="text-sm mt-2">尝试调整搜索关键词</p>
              </div>
            )}

            {/* 空状态 */}
            {!isLoading && publicLibraries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>暂无公共词库</p>
                <p className="text-sm mt-2">等待其他用户分享词库</p>
              </div>
            )}
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
            {/* 词库信息 */}
            {viewingLibrary?.description && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{viewingLibrary.description}</p>
              </div>
            )}

            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索单词..."
                value={wordSearchTerm}
                onChange={(e) => setWordSearchTerm(e.target.value)}
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
              {wordSearchTerm && ` (显示 ${filteredWords.length} 个匹配结果)`}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowLibraryDetails(false)}
              >
                关闭
              </Button>
              <Button
                onClick={() => {
                  if (viewingLibrary) {
                    handleCopyPublicLibrary(viewingLibrary);
                    setShowLibraryDetails(false);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                加入我的词库
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicLibrariesPage;