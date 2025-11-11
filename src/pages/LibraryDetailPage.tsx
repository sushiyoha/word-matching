import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckSquare,
  Square
} from 'lucide-react';
import { wordLibraryApi, wordPairApi } from '@/db/api';
import type { WordLibrary, WordPair } from '@/types';

const LibraryDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { libraryId } = useParams<{ libraryId: string }>();
  const [library, setLibrary] = useState<WordLibrary | null>(null);
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [editingPair, setEditingPair] = useState<WordPair | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ english_word: '', chinese_translation: '' });
  
  // 长按相关状态
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [pressedCardId, setPressedCardId] = useState<string | null>(null);

  useEffect(() => {
    loadLibraryData();
  }, [libraryId]);

  const loadLibraryData = async () => {
    if (!libraryId) return;
    
    try {
      const [libraryData, pairs] = await Promise.all([
        wordLibraryApi.getById(libraryId),
        wordPairApi.getByLibraryId(libraryId)
      ]);
      
      setLibrary(libraryData);
      setWordPairs(pairs);
    } catch (error) {
      console.error('Error loading library data:', error);
      toast.error('加载词库数据失败');
    }
  };

  // 长按开始
  const handlePressStart = (pairId: string) => {
    setPressedCardId(pairId);
    longPressTimer.current = setTimeout(() => {
      // 长按触发选择模式
      setIsSelectionMode(true);
      setSelectedIds(new Set([pairId]));
      toast.info('已进入选择模式');
    }, 500); // 500ms 触发长按
  };

  // 长按结束
  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressedCardId(null);
  };

  // 切换选择状态
  const toggleSelection = (pairId: string) => {
    if (!isSelectionMode) return;
    
    const newSelected = new Set(selectedIds);
    if (newSelected.has(pairId)) {
      newSelected.delete(pairId);
    } else {
      newSelected.add(pairId);
    }
    setSelectedIds(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === wordPairs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(wordPairs.map(p => p.id)));
    }
  };

  // 退出选择模式
  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  // 编辑词对
  const handleEdit = (pair: WordPair) => {
    setEditingPair(pair);
    setEditForm({ english_word: pair.english_word, chinese_translation: pair.chinese_translation });
    setShowEditDialog(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingPair) return;
    
    if (!editForm.english_word.trim() || !editForm.chinese_translation.trim()) {
      toast.error('词对内容不能为空');
      return;
    }

    try {
      await wordPairApi.update(editingPair.id, {
        english_word: editForm.english_word.trim(),
        chinese_translation: editForm.chinese_translation.trim()
      });
      
      toast.success('词对已更新');
      setShowEditDialog(false);
      setEditingPair(null);
      loadLibraryData();
    } catch (error) {
      console.error('Error updating word pair:', error);
      toast.error('更新词对失败');
    }
  };

  // 删除选中的词对
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个词对吗？`)) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedIds).map(id => wordPairApi.delete(id))
      );
      
      toast.success(`已删除 ${selectedIds.size} 个词对`);
      exitSelectionMode();
      loadLibraryData();
    } catch (error) {
      console.error('Error deleting word pairs:', error);
      toast.error('删除词对失败');
    }
  };

  // 删除单个词对
  const handleDeleteSingle = async (pair: WordPair) => {
    if (!confirm(`确定要删除词对"${pair.english_word} - ${pair.chinese_translation}"吗？`)) {
      return;
    }

    try {
      await wordPairApi.delete(pair.id);
      toast.success('词对已删除');
      loadLibraryData();
    } catch (error) {
      console.error('Error deleting word pair:', error);
      toast.error('删除词对失败');
    }
  };

  // 删除整个词库
  const handleDeleteLibrary = async () => {
    if (!library) return;
    
    if (!confirm(`确定要删除词库"${library.name}"吗？这将删除该词库下的所有词对，此操作不可恢复！`)) {
      return;
    }

    try {
      const success = await wordLibraryApi.delete(library.id);
      if (success) {
        toast.success('词库已删除');
        navigate('/settings');
      } else {
        toast.error('删除词库失败');
      }
    } catch (error) {
      console.error('Error deleting library:', error);
      toast.error('删除词库失败');
    }
  };

  return (
    <div className="max-w-[420px] mx-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-2xl font-bold text-slate-800">
            {library?.name || '词库详情'}
          </h1>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteLibrary}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>

        {/* 词库信息 */}
        {library && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{library.description || '暂无描述'}</p>
                  <p className="text-xs text-slate-500 mt-1">共 {wordPairs.length} 个词对</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 操作栏 */}
        {isSelectionMode && (
          <Card className="mb-4">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-1"
                  >
                    {selectedIds.size === wordPairs.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    {selectedIds.size === wordPairs.length ? '取消全选' : '全选'}
                  </Button>
                  <span className="text-sm text-slate-600">
                    已选择 {selectedIds.size} 个
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exitSelectionMode}
                  >
                    取消
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.size === 0}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除选中
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 词对卡牌网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
          {wordPairs.map((pair) => (
            <Card
              key={pair.id}
              className={`
                group relative cursor-pointer transition-all duration-200
                ${pressedCardId === pair.id ? 'scale-95' : 'hover:scale-105'}
                ${selectedIds.has(pair.id) ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''}
                ${isSelectionMode ? 'select-none' : ''}
              `}
              onMouseDown={() => handlePressStart(pair.id)}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={() => handlePressStart(pair.id)}
              onTouchEnd={handlePressEnd}
              onClick={() => {
                if (isSelectionMode) {
                  toggleSelection(pair.id);
                }
              }}
            >
              {/* 选择模式下的复选框 */}
              {isSelectionMode && (
                <div className="absolute top-1.5 right-1.5 z-10">
                  <Checkbox
                    checked={selectedIds.has(pair.id)}
                    onCheckedChange={() => toggleSelection(pair.id)}
                  />
                </div>
              )}

              <CardContent className="p-3 flex flex-col items-center justify-center min-h-[100px]">
                <div className="text-center space-y-1.5 w-full">
                  <div className="text-base font-bold text-slate-800 break-words">
                    {pair.english_word}
                  </div>
                  <div className="h-px bg-slate-200"></div>
                  <div className="text-xs text-slate-600 break-words">
                    {pair.chinese_translation}
                  </div>
                </div>

                {/* 非选择模式下的操作按钮 */}
                {!isSelectionMode && (
                  <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(pair);
                      }}
                      className="h-7 px-2"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSingle(pair);
                      }}
                      className="h-7 px-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 空状态 */}
        {wordPairs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">该词库暂无词对</p>
            </CardContent>
          </Card>
        )}

        {/* 编辑对话框 */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑词对</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block">英文单词</label>
                <Input
                  value={editForm.english_word}
                  onChange={(e) => setEditForm({ ...editForm, english_word: e.target.value })}
                  placeholder="输入英文单词"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">中文翻译</label>
                <Input
                  value={editForm.chinese_translation}
                  onChange={(e) => setEditForm({ ...editForm, chinese_translation: e.target.value })}
                  placeholder="输入中文翻译"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                取消
              </Button>
              <Button onClick={handleSaveEdit}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LibraryDetailPage;
