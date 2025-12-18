// ✨ 这是整理干净后的 CreateLibraryPage.tsx ✨

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
import { supabase } from '@/db/supabase';

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
  const [excelLangB, setExcelLangB] = useState('zh-CN-YunxiNeural');
  const form = useForm<CreateLibraryForm>({
    defaultValues: {
      langA: 'en-US-EricNeural',
      langB: 'zh-CN-YunxiNeural',
    },
  });

  // ✨ 这是整理干净的 handleCreateLibrary 函数 ✨
  const handleCreateLibrary = async (data: CreateLibraryForm) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.info("感谢您的热情！为记录您的贡献，请先登录哦！", {
        action: {
          label: "去登录",
          onClick: () => navigate('/login'),
        },
      });
      return;
    }

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
        setIsCreating(false);
        return;
      }

      const library = await wordLibraryApi.create({
        name: data.name,
        description: data.description || '',
        uploader_id: user.id,
      });

      if (!library) {
        toast.error('创建词库失败，请重试');
        setIsCreating(false);
        return;
      }

      const level = await wordLibraryLevelApi.create({
        library_id: library.id,
        level_name: '默认关卡',
        level_order: 1,
      });

      if (!level) {
        toast.error('创建关卡失败，请重试');
        setIsCreating(false); // 在返回前重置状态
        return;
      }

      const langA = data.langA;
      const langB = data.langB;

      await Promise.all(
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

      toast.success(`词库 "${data.name}" 创建成功！`);
      navigate('/settings');
    } catch (error) {
      console.error('创建词库失败:', error);
      toast.error('创建词库失败，请重试');
    } finally {
      setIsCreating(false);
    }
  };



  // ✨ 请只用这个新版本替换旧的 handleExcelUpload 函数 ✨
const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.info("为记录您的贡献，请先登录哦！", {
      action: {
        label: "去登录",
        onClick: () => navigate('/login'),
      },
    });
    e.target.value = '';
    return;
  }

  try {
    setIsCreating(true);
    
    const fileData = await file.arrayBuffer();
    const workbook = XLSX.read(fileData);
    
    // ✨ 精准修复点在这里！确保 libraryName 永远有效 ✨
    const libraryName = file.name.replace(/\.(xlsx|xls|csv)$/i, '').trim();
    if (!libraryName) {
      toast.error("文件名不合法，无法作为词库名称");
      setIsCreating(false);
      e.target.value = ''; // 清空选择
      return;
    }

    const library = await wordLibraryApi.create({
      name: libraryName,
      description: `从文件 ${file.name} 导入`,
      uploader_id: user.id,
    });

    if (!library) {
      // 之前的代码在这里缺少了 setIsCreating(false)，已补上
      toast.error('创建词库失败，请重试');
      setIsCreating(false);
      return;
    }

    let totalWordPairs = 0;
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

      const wordPairsData = jsonData
        .filter(row => row && row[0] && row[1]) // 增加对 row 的检查，更健壮
        .map(row => ({
          english: String(row[0]).trim(),
          chinese: String(row[1]).trim(),
        }));

      if (wordPairsData.length === 0) continue;

      const level = await wordLibraryLevelApi.create({
        library_id: library.id,
        level_name: sheetName,
        level_order: workbook.SheetNames.indexOf(sheetName) + 1,
      });

      if (!level) continue;

      await Promise.all(
        wordPairsData.map((pair) =>
          wordPairApi.create({
            library_id: library.id,
            level_id: level.id,
            english_word: pair.english,
            chinese_translation: pair.chinese,
            lang_a: excelLangA,
            lang_b: excelLangB,
          })
        )
      );
      totalWordPairs += wordPairsData.length;
    }

    toast.success(`词库 "${libraryName}" 导入成功！共添加 ${totalWordPairs} 个单词对`);
    navigate('/settings');
  } catch (error) {
    console.error('导入Excel失败:', error);
    toast.error('导入Excel失败，请检查文件格式或内容');
  } finally {
    setIsCreating(false);
    e.target.value = '';
  }
};

  // // ✨ 这是整理干净的 handleExcelUpload 函数 ✨
  // const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0]; // 使用 [0] 而不是 .
  //   if (!file) return;

  //   const { data: { user } } = await supabase.auth.getUser();

  //   if (!user) {
  //     toast.info("感谢您的热情！为记录您的贡献，请先登录哦！", {
  //       action: {
  //         label: "去登录",
  //         onClick: () => navigate('/login'),
  //       },
  //     });
  //     e.target.value = '';
  //     return;
  //   }

  //   try {
  //     setIsCreating(true);
      
  //     const fileData = await file.arrayBuffer();
  //     const workbook = XLSX.read(fileData);
  //     const libraryName = file.name.replace(/\.(xlsx|xls)$/, '');

  //     const library = await wordLibraryApi.create({
  //       name: libraryName,
  //       description: `从 ${file.name} 导入`,
  //       uploader_id: user.id,
  //     });

  //     if (!library) {
  //       toast.error('创建词库失败，请重试');
  //       setIsCreating(false);
  //       return;
  //     }

  //     let totalWordPairs = 0;
  //     for (let i = 0; i < workbook.SheetNames.length; i++) {
  //       const sheetName = workbook.SheetNames[i];
  //       const worksheet = workbook.Sheets[sheetName];
  //       const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

  //       const wordPairsData = jsonData
  //         .filter(row => row[0] && row[1])
  //         .map(row => ({
  //           english: String(row[0]).trim(),
  //           chinese: String(row[1]).trim(),
  //         }));

  //       if (wordPairsData.length === 0) continue;

  //       const level = await wordLibraryLevelApi.create({
  //         library_id: library.id,
  //         level_name: sheetName,
  //         level_order: i + 1,
  //       });

  //       if (!level) continue;

  //       const results = await Promise.all(
  //         wordPairsData.map((pair) =>
  //           wordPairApi.create({
  //             library_id: library.id,
  //             level_id: level.id,
  //             english_word: pair.english,
  //             chinese_translation: pair.chinese,
  //             lang_a: excelLangA,
  //             lang_b: excelLangB,
  //           })
  //         )
  //       );
  //       totalWordPairs += results.filter(r => r !== null).length;
  //     }

  //     toast.success(`词库 "${libraryName}" 导入成功！共添加 ${totalWordPairs} 个单词对`);
  //     navigate('/settings');
  //   } catch (error) {
  //     console.error('导入Excel失败:', error);
  //     toast.error('导入Excel失败，请检查文件格式');
  //   } finally {
  //     setIsCreating(false);
  //     e.target.value = '';
  //   }
  // };

  // JSX 部分保持不变
  return (
    <div className="max-w-[420px] mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
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
            <h1 className="text-xl font-bold text-slate-800">创建新词库</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>上传方式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-4 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setUploadMethod('text')}
                className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${uploadMethod === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-200'}`}
              >
                手动输入
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('excel')}
                className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${uploadMethod === 'excel' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-200'}`}
              >
                Excel上传
              </button>
            </div>

            {uploadMethod === 'text' ? (
              <form onSubmit={form.handleSubmit(handleCreateLibrary)} className="space-y-4">
                <div>
                  <Input {...form.register('name', { required: "词库名称不能为空" })} placeholder="词库名称" className="mt-1" />
                  {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Input {...form.register('description')} placeholder="词库描述（可选）" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">语言A</label>
                    <Select value={form.watch('langA')} onValueChange={(value) => form.setValue('langA', value)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((lang) => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">语言B</label>
                    <Select value={form.watch('langB')} onValueChange={(value) => form.setValue('langB', value)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((lang) => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <textarea
                    {...form.register('wordPairs', { required: "单词对不能为空" })}
                    rows={8}
                    placeholder="每行一个单词对, 用英文逗号分隔&#10;例如:&#10;hello,你好&#10;world,世界"
                    className="mt-1 w-full rounded-md border bg-slate-50 p-2 text-sm"
                  />
                  {form.formState.errors.wordPairs && <p className="text-red-500 text-xs mt-1">{form.formState.errors.wordPairs.message}</p>}
                </div>
                <Button type="submit" disabled={isCreating} className="w-full py-3 mt-4">
                  {isCreating ? '正在创建...' : '创建词库'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">第一列语言（如：英文）</label>
                  <Select value={excelLangA} onValueChange={setExcelLangA}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((lang) => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <label className="block text-sm font-medium mb-2">第二列语言（如：中文）</label>
                  <Select value={excelLangB} onValueChange={setExcelLangB}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((lang) => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">选择Excel文件 (.xlsx, .xls)</label>
                  <Input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="mt-1" disabled={isCreating} />
                </div>
                <p className="text-xs text-slate-500">提示：Excel文件的每一页(sheet)都会被当作一个独立的关卡哦！</p>
                {isCreating && <p className="text-sm text-blue-600 text-center">正在努力上传和处理中，请稍候...</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}