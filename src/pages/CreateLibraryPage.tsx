import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { wordLibraryApi, wordPairApi, wordLibraryLevelApi } from '@/db/api';
import { useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';
import { LANGUAGE_OPTIONS } from '@/utils/tts';

interface CreateLibraryForm {
  name: string;
  description: string;
  wordPairs: string;
  langA: string;
  langB: string;
}

export default function CreateLibraryPage() {
  const navigate = useNavigate();
  const [uploadMethod, setUploadMethod] = useState<'text' | 'excel'>('text');
  const [isCreating, setIsCreating] = useState(false);
  const [excelLangA, setExcelLangA] = useState('en-US-EricNeural');
  const [excelLangB, setExcelLangB] = useState('zh-CN-XiaoqiuNeural');
  const form = useForm<CreateLibraryForm>({
    defaultValues: {
      langA: 'en-US-EricNeural',
      langB: 'zh-CN-XiaoqiuNeural',
    },
  });

  const handleCreateLibrary = async (data: CreateLibraryForm) => {
    try {
      setIsCreating(true);

      const lines = data.wordPairs.trim().split('\n');
      const wordPairsData = lines
        .map(line => {
          const [english, chinese] = line.split(',').map(s => s.trim());
          return { english, chinese };
        })
        .filter(pair => pair.english && pair.chinese);

      if (wordPairsData.length === 0) {
        toast.error('请至少输入一个有效的单词对');
        return;
      }

      const library = await wordLibraryApi.create({
        name: data.name,
        description: data.description || null,
      });

      if (!library) {
        toast.error('创建词库失败，请重试');
        return;
      }

      const level = await wordLibraryLevelApi.create({
        library_id: library.id,
        level_name: '默认关卡',
        level_order: 1,
      });

      if (!level) {
        toast.error('创建关卡失败，请重试');
        return;
      }

      const langA = data.langA; // 完整的语言名称（例如：'en-US-EricNeural'）
      const langB = data.langB; // 完整的语言名称（例如：'zh-CN-XiaoqiuNeural'）

      const results = await Promise.all(
        wordPairsData.map((pair) =>
          wordPairApi.create({
            library_id: library.id,
            level_id: level.id,
            english_word: pair.english,
            chinese_translation: pair.chinese,
            lang_a: langA,
            lang_b: langB,
          })
        )
      );

      const successCount = results.filter(r => r !== null).length;
      console.log(`成功创建 ${successCount}/${wordPairsData.length} 个单词对`);

      toast.success(`词库 "${data.name}" 创建成功！共添加 ${successCount} 个单词对`);
      form.reset();
      navigate('/settings');
    } catch (error) {
      console.error('创建词库失败:', error);
      toast.error('创建词库失败，请重试');
    } finally {
      setIsCreating(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCreating(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      const libraryName = file.name.replace(/\.(xlsx|xls)$/, '');

      const library = await wordLibraryApi.create({
        name: libraryName,
        description: `从 ${file.name} 导入`,
      });

      if (!library) {
        toast.error('创建词库失败，请重试');
        return;
      }

      let totalWordPairs = 0;

      for (let i = 0; i < workbook.SheetNames.length; i++) {
        const sheetName = workbook.SheetNames[i];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        const wordPairsData = jsonData
          .filter(row => row[0] && row[1])
          .map(row => ({
            english: String(row[0]).trim(),
            chinese: String(row[1]).trim(),
          }));

        if (wordPairsData.length === 0) {
          console.log(`跳过空页 "${sheetName}"`);
          continue;
        }

        const level = await wordLibraryLevelApi.create({
          library_id: library.id,
          level_name: sheetName,
          level_order: i + 1,
        });

        if (!level) {
          console.error(`创建关卡 "${sheetName}" 失败`);
          continue;
        }

        const results = await Promise.all(
          wordPairsData.map((pair) =>
            wordPairApi.create({
              library_id: library.id,
              level_id: level.id,
              english_word: pair.english,
              chinese_translation: pair.chinese,
              lang_a: excelLangA, // 使用完整的语言名称
              lang_b: excelLangB, // 使用完整的语言名称
            })
          )
        );

        const successCount = results.filter(r => r !== null).length;
        totalWordPairs += successCount;
        console.log(`关卡 "${sheetName}": 成功创建 ${successCount}/${wordPairsData.length} 个单词对`);
      }

      toast.success(`词库 "${libraryName}" 导入成功！共添加 ${totalWordPairs} 个单词对`);
      navigate('/settings');
    } catch (error) {
      console.error('导入Excel失败:', error);
      toast.error('导入Excel失败，请检查文件格式');
    } finally {
      setIsCreating(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-[420px] mx-auto bg-gradient-to-br from-blue-50 to-indigo-100">
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
            <h1 className="text-2xl font-bold text-slate-800">创建新词库</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>上传方式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-4 p-4 bg-slate-50 rounded-lg">
              <button
                type="button"
                onClick={() => setUploadMethod('text')}
                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 ${uploadMethod === 'text' ? 'bg-neutral-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                手动输入
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('excel')}
                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 ${uploadMethod === 'excel' ? 'bg-neutral-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                Excel上传
              </button>
            </div>

            {uploadMethod === 'text' ? (
              <form onSubmit={form.handleSubmit(handleCreateLibrary)} className="space-y-4">
                <div>
                  <Input {...form.register('name', { required: true })} placeholder="词库名称" className="mt-1" />
                </div>
                <div>
                  <Input {...form.register('description')} placeholder="词库描述（可选）" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">语言A（第一列）</label>
                    <Select value={form.watch('langA')} onValueChange={(value) => form.setValue('langA', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">语言B（第二列）</label>
                    <Select value={form.watch('langB')} onValueChange={(value) => form.setValue('langB', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <textarea
                    {...form.register('wordPairs', { required: true })}
                    rows={10}
                    placeholder="在此输入单词对，每行一个（英文, 中文）"
                    className="mt-1 w-full rounded-md border-2 p-2"
                  />
                </div>
                <Button type="submit" disabled={isCreating} className="w-full py-3 mt-4" variant="primary">
                  {isCreating ? '正在创建...' : '创建词库'}
                </Button>
              </form>
            ) : (
              <div>
                <label className="text-sm font-medium">选择Excel文件</label>
                <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="mt-2" />
                <div className="mt-2">
                  <Select value={excelLangA} onValueChange={setExcelLangA}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-2">
                  <Select value={excelLangB} onValueChange={setExcelLangB}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
