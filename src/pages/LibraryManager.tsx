import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  ArrowLeft,
  Upload,
  Search,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { wordLibraryApi, wordPairApi } from '@/db/api';
import type { WordLibrary, WordPair } from '@/types';

const LibraryManager: React.FC = () => {
  const [libraries, setLibraries] = useState<WordLibrary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLibrary, setSelectedLibrary] = useState<WordLibrary | null>(null);
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [filteredWordPairs, setFilteredWordPairs] = useState<WordPair[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPair, setEditingPair] = useState<WordPair | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // 新建词库表单
  const [newLibrary, setNewLibrary] = useState({
    name: '',
    description: ''
  });

  // 新建单词对表单
  const [newWordPair, setNewWordPair] = useState({
    english_word: '',
    chinese_translation: ''
  });

  // 加载词库列表
  const loadLibraries = async () => {
    try {
      setIsLoading(true);
      const data = await wordLibraryApi.getAll();
      setLibraries(data);
    } catch (error) {
      console.error('加载词库失败:', error);
      toast.error('加载词库失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 加载词库中的单词对
  const loadWordPairs = async (libraryId: string) => {
    try {
      const data = await wordPairApi.getByLibraryId(libraryId);
      setWordPairs(data);
      setFilteredWordPairs(data);
    } catch (error) {
      console.error('加载单词对失败:', error);
      toast.error('加载单词对失败');
    }
  };

  // 搜索功能
  useEffect(() => {
    if (!searchTerm) {
      setFilteredWordPairs(wordPairs);
    } else {
      const filtered = wordPairs.filter(pair => 
        pair.english_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pair.chinese_translation.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWordPairs(filtered);
    }
  }, [searchTerm, wordPairs]);

  // 删除词库
  const handleDeleteLibrary = async (library: WordLibrary) => {
    try {
      await wordLibraryApi.delete(library.id);
      toast.success('词库删除成功');
      loadLibraries();
    } catch (error) {
      console.error('删除词库失败:', error);
      toast.error('删除词库失败');
    }
  };

  // 查看词库
  const handleViewLibrary = async (library: WordLibrary) => {
    setSelectedLibrary(library);
    await loadWordPairs(library.id);
    setSearchTerm('');
    setIsViewDialogOpen(true);
  };

  // 创建新词库
  const handleCreateLibrary = async () => {
    if (!newLibrary.name.trim()) {
      toast.error('请输入词库名称');
      return;
    }

    try {
      await wordLibraryApi.create(newLibrary);
      toast.success('词库创建成功');
      setNewLibrary({ name: '', description: '' });
      setIsCreateDialogOpen(false);
      loadLibraries();
    } catch (error) {
      console.error('创建词库失败:', error);
      toast.error('创建词库失败');
    }
  };

  // 编辑单词对
  const handleEditPair = (pair: WordPair) => {
    setEditingPair({ ...pair });
    setIsEditDialogOpen(true);
  };

  // 保存编辑的单词对
  const handleSaveEditPair = async () => {
    if (!editingPair || !editingPair.english_word.trim() || !editingPair.chinese_translation.trim()) {
      toast.error('请填写完整的单词和翻译');
      return;
    }

    try {
      await wordPairApi.update(editingPair.id, {
        english_word: editingPair.english_word,
        chinese_translation: editingPair.chinese_translation
      });
      toast.success('单词对更新成功');
      setIsEditDialogOpen(false);
      setEditingPair(null);
      if (selectedLibrary) {
        await loadWordPairs(selectedLibrary.id);
      }
    } catch (error) {
      console.error('更新单词对失败:', error);
      toast.error('更新单词对失败');
    }
  };

  // 删除单词对
  const handleDeletePair = async (pairId: string) => {
    try {
      await wordPairApi.delete(pairId);
      toast.success('单词对删除成功');
      if (selectedLibrary) {
        await loadWordPairs(selectedLibrary.id);
      }
    } catch (error) {
      console.error('删除单词对失败:', error);
      toast.error('删除单词对失败');
    }
  };

  // 添加新单词对
  const handleAddWordPair = async () => {
    if (!newWordPair.english_word.trim() || !newWordPair.chinese_translation.trim()) {
      toast.error('请填写完整的单词和翻译');
      return;
    }

    if (!selectedLibrary) {
      toast.error('请先选择词库');
      return;
    }

    try {
      await wordPairApi.create({
        library_id: selectedLibrary.id,
        english_word: newWordPair.english_word,
        chinese_translation: newWordPair.chinese_translation
      });
      toast.success('单词对添加成功');
      setNewWordPair({ english_word: '', chinese_translation: '' });
      await loadWordPairs(selectedLibrary.id);
    } catch (error) {
      console.error('添加单词对失败:', error);
      toast.error('添加单词对失败');
    }
  };

  useEffect(() => {
    loadLibraries();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">正在加载词库...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 标题栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">词库管理</h1>
              <p className="text-slate-600">管理您的单词词库</p>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                新建词库
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新词库</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">词库名称</label>
                  <Input
                    value={newLibrary.name}
                    onChange={(e) => setNewLibrary({ ...newLibrary, name: e.target.value })}
                    placeholder="请输入词库名称"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">词库描述</label>
                  <Textarea
                    value={newLibrary.description}
                    onChange={(e) => setNewLibrary({ ...newLibrary, description: e.target.value })}
                    placeholder="请输入词库描述（可选）"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleCreateLibrary}>
                    创建
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 词库列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              词库列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            {libraries.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">暂无词库，点击上方按钮创建新词库</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {libraries.map((library) => (
                  <Card key={library.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{library.name}</CardTitle>
                          {library.description && (
                            <p className="text-sm text-slate-600 mt-1">{library.description}</p>
                          )}
                        </div>
                        {library.is_default && (
                          <Badge variant="secondary">默认</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewLibrary(library)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          查看
                        </Button>
                        
                        {!library.is_default && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                                <Trash2 className="w-3 h-3" />
                                删除
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除词库</AlertDialogTitle>
                                <AlertDialogDescription>
                                  您确定要删除词库 "{library.name}" 吗？此操作将同时删除词库中的所有单词，且无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteLibrary(library)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  确认删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 查看词库对话框 */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {selectedLibrary?.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden flex flex-col space-y-4">
              {/* 搜索和添加 */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="搜索单词或翻译..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 添加新单词对 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">添加新单词</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="英语单词"
                      value={newWordPair.english_word}
                      onChange={(e) => setNewWordPair({ ...newWordPair, english_word: e.target.value })}
                    />
                    <Input
                      placeholder="中文翻译"
                      value={newWordPair.chinese_translation}
                      onChange={(e) => setNewWordPair({ ...newWordPair, chinese_translation: e.target.value })}
                    />
                    <Button onClick={handleAddWordPair} className="flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                      添加
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 单词列表 */}
              <div className="flex-1 overflow-auto">
                {filteredWordPairs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">
                      {searchTerm ? '未找到匹配的单词' : '此词库暂无单词'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>英语单词</TableHead>
                        <TableHead>中文翻译</TableHead>
                        <TableHead className="w-24">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWordPairs.map((pair) => (
                        <TableRow key={pair.id}>
                          <TableCell className="font-medium">{pair.english_word}</TableCell>
                          <TableCell>{pair.chinese_translation}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPair(pair)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>确认删除单词</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      您确定要删除单词 "{pair.english_word}" 吗？此操作无法撤销。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeletePair(pair.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      确认删除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 编辑单词对话框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑单词对</DialogTitle>
            </DialogHeader>
            {editingPair && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">英语单词</label>
                  <Input
                    value={editingPair.english_word}
                    onChange={(e) => setEditingPair({ ...editingPair, english_word: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">中文翻译</label>
                  <Input
                    value={editingPair.chinese_translation}
                    onChange={(e) => setEditingPair({ ...editingPair, chinese_translation: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleSaveEditPair} className="flex items-center gap-1">
                    <Save className="w-4 h-4" />
                    保存
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LibraryManager;