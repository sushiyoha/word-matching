import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const LibraryManagerSimple: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">词库管理</h1>
            <p className="text-slate-600">管理您的单词词库</p>
          </div>
        </div>

        {/* 功能说明 */}
        <Card>
          <CardHeader>
            <CardTitle>词库管理功能</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-slate-600">
                词库管理功能正在开发中，敬请期待！
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">📚 创建词库</h3>
                  <p className="text-blue-600 text-sm">创建自定义单词词库</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">📝 编辑词库</h3>
                  <p className="text-green-600 text-sm">修改现有词库内容</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-800 mb-2">📊 导入导出</h3>
                  <p className="text-purple-600 text-sm">Excel文件导入导出</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-orange-800 mb-2">🗂️ 词库管理</h3>
                  <p className="text-orange-600 text-sm">删除和组织词库</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LibraryManagerSimple;