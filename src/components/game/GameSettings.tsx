import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, BookOpen, FileSpreadsheet, Type, Eye, Trash2, Search, Edit, X, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { wordLibraryApi, wordPairApi } from '@/db/api';
import type { WordLibrary } from '@/types';
import * as XLSX from 'xlsx';

interface GameSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  libraries: WordLibrary[];
  selectedLibrary: WordLibrary | null;
  onLibraryChange: (library: WordLibrary) => void;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
}

interface CreateLibraryForm {
  name: string;
  description: string;
  wordPairs: string;
}

const GameSettings: React.FC<GameSettingsProps> = ({
  open,
  onOpenChange,
  libraries,
  selectedLibrary,
  onLibraryChange,
  playerName,
  onPlayerNameChange,
}) => {
  const [showCreateLibrary, setShowCreateLibrary] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'text' | 'excel'>('text');
  
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

  // 公共词库浏览状态
  const [showPublicLibraries, setShowPublicLibraries] = useState(false);
  const [publicLibraries, setPublicLibraries] = useState<WordLibrary[]>([]);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [publicSearchTerm, setPublicSearchTerm] = useState('');

  const form = useForm<CreateLibraryForm>({
    defaultValues: {
      name: '',
      description: '',
      wordPairs: '',
    },
  });

  const handlePlayerNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('playerName') as string;
    if (name.trim()) {
      onPlayerNameChange(name.trim());
      toast.success('玩家名称已保存');
    }
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error('请选择Excel文件（.xlsx或.xls格式）');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 转换为JSON数组
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        
        // 解析数据并转换为文本格式
        const wordPairs: string[] = [];
        
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.length >= 2 && row[0] && row[1]) {
            // 跳过可能的标题行（如果第一行包含"英语"、"中文"等关键词）
            if (i === 0 && (
              String(row[0]).toLowerCase().includes('english') ||
              String(row[0]).includes('英语') ||
              String(row[0]).includes('单词')
            )) {
              continue;
            }
            
            const english = String(row[0]).trim();
            const chinese = String(row[1]).trim();
            
            if (english && chinese) {
              wordPairs.push(`${english},${chinese}`);
            }
          }
        }
        
        if (wordPairs.length === 0) {
          toast.error('Excel文件中未找到有效的单词对，请确保A列为英语单词，B列为中文翻译');
          return;
        }
        
        // 将解析的数据填入表单
        form.setValue('wordPairs', wordPairs.join('\n'));
        toast.success(`成功解析Excel文件，共找到 ${wordPairs.length} 个单词对`);
        
      } catch (error) {
        console.error('Excel解析错误:', error);
        toast.error('Excel文件解析失败，请检查文件格式');
      }
    };
    
    reader.readAsArrayBuffer(file);
    
    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  };

  const downloadExampleExcel = () => {
    // 创建示例数据
    const exampleData = [
      ['英语单词', '中文翻译'],
      ['apple', '苹果'],
      ['banana', '香蕉'],
      ['orange', '橙子'],
      ['grape', '葡萄'],
      ['watermelon', '西瓜'],
      ['strawberry', '草莓'],
      ['pineapple', '菠萝'],
      ['peach', '桃子'],
      ['pear', '梨'],
      ['cherry', '樱桃']
    ];

    // 创建工作簿和工作表
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exampleData);
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 15 }, // A列宽度
      { wch: 15 }  // B列宽度
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, '单词表');
    
    // 下载文件
    XLSX.writeFile(wb, '单词库模板.xlsx');
    toast.success('示例Excel文件已下载');
  };

  const handleCreateLibrary = async (data: CreateLibraryForm) => {
    if (!data.name.trim()) {
      toast.error('请输入词库名称');
      return;
    }

    if (!data.wordPairs.trim()) {
      toast.error('请输入单词对');
      return;
    }

    setIsCreating(true);

    try {
      // 解析单词对
      const lines = data.wordPairs.split('\n').filter(line => line.trim());
      const pairs: Array<{ english_word: string; chinese_translation: string }> = [];

      for (const line of lines) {
        const parts = line.split(/[,\t]/).map(part => part.trim());
        if (parts.length >= 2) {
          pairs.push({
            english_word: parts[0],
            chinese_translation: parts[1],
          });
        }
      }

      if (pairs.length === 0) {
        toast.error('未找到有效的单词对，请检查格式');
        return;
      }

      // 创建词库
      const library = await wordLibraryApi.create({
        name: data.name.trim(),
        description: data.description.trim()
      });
      if (!library) {
        toast.error('创建词库失败');
        return;
      }

      // 添加单词对
      await wordPairApi.batchCreate(library.id, pairs);

      toast.success(`成功创建词库 "${library.name}"，包含 ${pairs.length} 个单词对`);
      
      // 重置表单
      form.reset();
      setShowCreateLibrary(false);
      
      // 刷新页面以获取最新词库列表
      window.location.reload();
    } catch (error) {
      console.error('Error creating library:', error);
      toast.error('创建词库时发生错误');
    } finally {
      setIsCreating(false);
    }
  };

  // 词库管理函数
  const handleViewLibrary = async (library: WordLibrary) => {
    try {
      setViewingLibrary(library);
      const words = await wordPairApi.getByLibraryId(library.id);
      setLibraryWords(words);
      setShowLibraryDetails(true);
      setSearchTerm('');
    } catch (error) {
      console.error('Error loading library words:', error);
      toast.error('加载词库内容失败');
    }
  };

  const handleDeleteLibrary = async (library: WordLibrary) => {
    if (library.is_default) {
      toast.error('默认词库不能删除');
      return;
    }

    if (!confirm(`确定要删除词库 "${library.name}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await wordLibraryApi.delete(library.id);
      toast.success(`词库 "${library.name}" 已删除`);
      
      // 如果删除的是当前选中的词库，清空选择
      if (selectedLibrary?.id === library.id) {
        const defaultLibrary = libraries.find(lib => lib.is_default);
        if (defaultLibrary) {
          onLibraryChange(defaultLibrary);
        }
      }
      
      // 刷新页面以获取最新词库列表
      window.location.reload();
    } catch (error) {
      console.error('Error deleting library:', error);
      toast.error('删除词库失败');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditWord = (word: any) => {
    setEditingWord(word);
    setShowEditDialog(true);
  };

  const handleSaveEditWord = async (english: string, chinese: string) => {
    if (!editingWord || !english.trim() || !chinese.trim()) {
      toast.error('请填写完整的单词和翻译');
      return;
    }

    try {
      await wordPairApi.update(editingWord.id, {
        english_word: english.trim(),
        chinese_translation: chinese.trim(),
      });
      
      // 更新本地状态
      setLibraryWords(prev => 
        prev.map(word => 
          word.id === editingWord.id 
            ? { ...word, english_word: english.trim(), chinese_translation: chinese.trim() }
            : word
        )
      );
      
      setShowEditDialog(false);
      setEditingWord(null);
      toast.success('单词已更新');
    } catch (error) {
      console.error('Error updating word:', error);
      toast.error('更新单词失败');
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    if (!confirm('确定要删除这个单词对吗？')) {
      return;
    }

    try {
      await wordPairApi.delete(wordId);
      setLibraryWords(prev => prev.filter(word => word.id !== wordId));
      toast.success('单词已删除');
    } catch (error) {
      console.error('Error deleting word:', error);
      toast.error('删除单词失败');
    }
  };

  const handleAddWord = async (english: string, chinese: string) => {
    if (!viewingLibrary || !english.trim() || !chinese.trim()) {
      toast.error('请填写完整的单词和翻译');
      return;
    }

    try {
      setIsAddingWord(true);
      const newWord = await wordPairApi.create({
        library_id: viewingLibrary.id,
        english_word: english.trim(),
        chinese_translation: chinese.trim(),
      });
      
      if (newWord) {
        // 添加到本地状态
        setLibraryWords(prev => [...prev, newWord]);
        setShowAddWordDialog(false);
        toast.success('单词已添加');
      }
    } catch (error) {
      console.error('Error adding word:', error);
      toast.error('添加单词失败');
    } finally {
      setIsAddingWord(false);
    }
  };

  const handleBatchAddWords = async (wordPairs: Array<{english: string, chinese: string}>) => {
    if (!viewingLibrary) {
      toast.error('请先选择词库');
      return;
    }

    try {
      setIsAddingWord(true);
      const newWords = [];
      let successCount = 0;
      let failCount = 0;

      for (const pair of wordPairs) {
        try {
          const newWord = await wordPairApi.create({
            library_id: viewingLibrary.id,
            english_word: pair.english,
            chinese_translation: pair.chinese,
          });
          if (newWord) {
            newWords.push(newWord);
            successCount++;
          }
        } catch (error) {
          console.error('Error adding word pair:', pair, error);
          failCount++;
        }
      }

      // 更新本地状态
      if (newWords.length > 0) {
        setLibraryWords(prev => [...prev, ...newWords]);
      }

      setShowAddWordDialog(false);
      
      if (failCount === 0) {
        toast.success(`成功添加 ${successCount} 个单词对`);
      } else {
        toast.warning(`成功添加 ${successCount} 个单词对，失败 ${failCount} 个`);
      }
    } catch (error) {
      console.error('Error batch adding words:', error);
      toast.error('批量添加失败');
    } finally {
      setIsAddingWord(false);
    }
  };

  // 过滤搜索结果
  const filteredWords = libraryWords.filter(word =>
    word.english_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.chinese_translation.includes(searchTerm)
  );

  // 加载公共词库
  const loadPublicLibraries = async () => {
    setIsLoadingPublic(true);
    try {
      const allLibraries = await wordLibraryApi.getAll();
      // 过滤出非当前用户的词库（这里简化处理，实际应该根据用户ID过滤）
      const publicLibs = allLibraries.filter(lib => !lib.is_default);
      setPublicLibraries(publicLibs);
    } catch (error) {
      console.error('Error loading public libraries:', error);
      toast.error('加载公共词库失败');
    } finally {
      setIsLoadingPublic(false);
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
        setShowPublicLibraries(false);
        
        // 刷新词库列表（这里需要父组件提供刷新方法）
        window.location.reload();
      }
    } catch (error) {
      console.error('Error copying public library:', error);
      toast.error('复制词库失败');
    }
  };

  // 过滤公共词库搜索结果
  const filteredPublicLibraries = publicLibraries.filter(lib =>
    lib.name.toLowerCase().includes(publicSearchTerm.toLowerCase()) ||
    lib.description?.toLowerCase().includes(publicSearchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>游戏设置</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 玩家设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">玩家设置</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePlayerNameSubmit} className="space-y-4">
                <div>
                  <label htmlFor="playerName" className="text-sm font-medium">
                    玩家名称
                  </label>
                  <Input
                    id="playerName"
                    name="playerName"
                    defaultValue={playerName}
                    placeholder="输入你的名称"
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    用于记录游戏成绩和排行榜显示
                  </p>
                </div>
                <Button type="submit" size="sm">
                  保存名称
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 词库选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">词库选择</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedLibrary?.id || ''}
                onValueChange={(value) => {
                  const library = libraries.find(lib => lib.id === value);
                  if (library) {
                    onLibraryChange(library);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择词库" />
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
                    {selectedLibrary.description}
                  </div>
                  
                  {/* 词库管理按钮 */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewLibrary(selectedLibrary)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      查看词库
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPublicLibraries(true)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-4 h-4" />
                      浏览公共词库
                    </Button>
                    
                    {!selectedLibrary.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLibrary(selectedLibrary)}
                        disabled={isDeleting}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除词库
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 自定义词库 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                创建自定义词库
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showCreateLibrary ? (
                <Button
                  variant="outline"
                  onClick={() => setShowCreateLibrary(true)}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  添加新词库
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* 上传方式选择 */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={uploadMethod === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMethod('text')}
                      className="flex items-center gap-1"
                    >
                      <Type className="w-4 h-4" />
                      手动输入
                    </Button>
                    <Button
                      type="button"
                      variant={uploadMethod === 'excel' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMethod('excel')}
                      className="flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel上传
                    </Button>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateLibrary)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>词库名称</FormLabel>
                            <FormControl>
                              <Input placeholder="例如：高考3500词" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>词库描述（可选）</FormLabel>
                            <FormControl>
                              <Input placeholder="简单描述这个词库的内容" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {uploadMethod === 'excel' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Excel文件上传</label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={downloadExampleExcel}
                              className="text-xs"
                            >
                              下载模板
                            </Button>
                          </div>
                          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={handleExcelUpload}
                              className="hidden"
                              id="excel-upload"
                            />
                            <label
                              htmlFor="excel-upload"
                              className="cursor-pointer flex flex-col items-center gap-2"
                            >
                              <FileSpreadsheet className="w-8 h-8 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                点击选择Excel文件
                              </span>
                              <span className="text-xs text-slate-500">
                                支持.xlsx和.xls格式，A列为英语单词，B列为中文翻译
                              </span>
                            </label>
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="wordPairs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {uploadMethod === 'excel' ? '单词对预览' : '单词对'}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={uploadMethod === 'excel' 
                                  ? '上传Excel文件后，单词对将显示在这里...'
                                  : `每行一个单词对，用逗号或制表符分隔，例如：
apple,苹果
banana,香蕉
orange,橙子`}
                                rows={8}
                                {...field}
                                readOnly={uploadMethod === 'excel'}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2">
                        <Button type="submit" disabled={isCreating}>
                          {isCreating ? '创建中...' : '创建词库'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowCreateLibrary(false);
                            setUploadMethod('text');
                            form.reset();
                          }}
                        >
                          取消
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
      
      {/* 词库详情对话框 */}
      <Dialog open={showLibraryDetails} onOpenChange={setShowLibraryDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {viewingLibrary?.name} - 词库详情
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* 搜索框和添加按钮 */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索单词或翻译..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => setShowAddWordDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加词对
              </Button>
            </div>
            
            {/* 单词列表 */}
            <div className="flex-1 overflow-y-auto border rounded-lg">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-4 p-3 bg-gray-50 font-medium border-b">
                <div>英语单词</div>
                <div>中文翻译</div>
                <div>操作</div>
              </div>
              
              {filteredWords.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm ? '未找到匹配的单词' : '暂无单词'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredWords.map((word) => (
                    <div key={word.id} className="grid grid-cols-[1fr_1fr_auto] gap-4 p-3 hover:bg-gray-50">
                      <div className="font-medium">{word.english_word}</div>
                      <div>{word.chinese_translation}</div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditWord(word)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWord(word.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-500 text-center">
              共 {libraryWords.length} 个单词对
              {searchTerm && ` (显示 ${filteredWords.length} 个匹配结果)`}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 编辑单词对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑单词</DialogTitle>
          </DialogHeader>
          
          <EditWordForm
            word={editingWord}
            onSave={handleSaveEditWord}
            onCancel={() => {
              setShowEditDialog(false);
              setEditingWord(null);
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* 添加词对对话框 */}
      <Dialog open={showAddWordDialog} onOpenChange={setShowAddWordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加新词对</DialogTitle>
          </DialogHeader>
          
          <AddWordForm
            onSave={handleAddWord}
            onBatchSave={handleBatchAddWords}
            onCancel={() => setShowAddWordDialog(false)}
            isLoading={isAddingWord}
          />
        </DialogContent>
      </Dialog>
      
      {/* 公共词库浏览对话框 */}
      <Dialog open={showPublicLibraries} onOpenChange={setShowPublicLibraries}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              浏览公共词库
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索词库名称或描述..."
                value={publicSearchTerm}
                onChange={(e) => setPublicSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 加载按钮 */}
            {publicLibraries.length === 0 && !isLoadingPublic && (
              <div className="text-center py-8">
                <Button onClick={loadPublicLibraries} className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  加载公共词库
                </Button>
              </div>
            )}

            {/* 加载状态 */}
            {isLoadingPublic && (
              <div className="text-center py-8 text-gray-500">
                正在加载公共词库...
              </div>
            )}

            {/* 词库列表 */}
            {filteredPublicLibraries.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  找到 {filteredPublicLibraries.length} 个公共词库
                </div>
                
                <div className="grid gap-3">
                  {filteredPublicLibraries.map((library) => (
                    <Card key={library.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <h3 className="font-medium">{library.name}</h3>
                          </div>
                          
                          {library.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {library.description}
                            </p>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            创建时间: {new Date(library.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLibrary(library)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            预览
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleCopyPublicLibrary(library)}
                            className="flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            添加到我的词库
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 无结果提示 */}
            {publicLibraries.length > 0 && filteredPublicLibraries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                没有找到匹配的词库
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

// 编辑单词表单组件
const EditWordForm: React.FC<{
  word: any;
  onSave: (english: string, chinese: string) => void;
  onCancel: () => void;
}> = ({ word, onSave, onCancel }) => {
  const [english, setEnglish] = useState(word?.english_word || '');
  const [chinese, setChinese] = useState(word?.chinese_translation || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(english, chinese);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">英语单词</label>
        <Input
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          placeholder="输入英语单词"
          className="mt-1"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">中文翻译</label>
        <Input
          value={chinese}
          onChange={(e) => setChinese(e.target.value)}
          placeholder="输入中文翻译"
          className="mt-1"
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  );
};

// 添加词对表单组件
const AddWordForm: React.FC<{
  onSave: (english: string, chinese: string) => void;
  onBatchSave: (wordPairs: Array<{english: string, chinese: string}>) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ onSave, onBatchSave, onCancel, isLoading }) => {
  const [addMethod, setAddMethod] = useState<'single' | 'excel'>('single');
  const [english, setEnglish] = useState('');
  const [chinese, setChinese] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(english, chinese);
  };

  const handleCancel = () => {
    setEnglish('');
    setChinese('');
    setAddMethod('single');
    onCancel();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        const wordPairs: Array<{english: string, chinese: string}> = [];
        
        // 跳过标题行，从第二行开始处理
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row.length >= 2 && row[0] && row[1]) {
            wordPairs.push({
              english: String(row[0]).trim(),
              chinese: String(row[1]).trim()
            });
          }
        }

        if (wordPairs.length === 0) {
          toast.error('Excel文件中没有找到有效的单词对');
          return;
        }

        onBatchSave(wordPairs);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Excel文件解析失败，请检查文件格式');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-4">
      {/* 添加方式选择 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">添加方式</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="addMethod"
              value="single"
              checked={addMethod === 'single'}
              onChange={(e) => setAddMethod(e.target.value as 'single' | 'excel')}
              className="w-4 h-4"
            />
            <span className="text-sm">手动添加</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="addMethod"
              value="excel"
              checked={addMethod === 'excel'}
              onChange={(e) => setAddMethod(e.target.value as 'single' | 'excel')}
              className="w-4 h-4"
            />
            <span className="text-sm">Excel批量添加</span>
          </label>
        </div>
      </div>

      {addMethod === 'single' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">英语单词</label>
            <Input
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="输入英语单词"
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">中文翻译</label>
            <Input
              value={chinese}
              onChange={(e) => setChinese(e.target.value)}
              placeholder="输入中文翻译"
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '添加中...' : '添加'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">上传Excel文件</label>
            <div className="mt-2 space-y-2">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500">
                请上传Excel文件，第一列为英语单词，第二列为中文翻译
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              取消
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSettings;