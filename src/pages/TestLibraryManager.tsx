import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BookOpen, Search, Edit, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const TestLibraryManager: React.FC = () => {
  const features = [
    {
      name: '词库列表显示',
      description: '显示所有词库，包括默认词库标识',
      icon: BookOpen,
      status: 'implemented'
    },
    {
      name: '词库删除功能',
      description: '可删除非默认词库，带确认对话框',
      icon: Trash2,
      status: 'implemented'
    },
    {
      name: '词库查看功能',
      description: '点击查看按钮打开词库详情对话框',
      icon: BookOpen,
      status: 'implemented'
    },
    {
      name: '单词搜索功能',
      description: '在词库详情中搜索英语单词或中文翻译',
      icon: Search,
      status: 'implemented'
    },
    {
      name: '单词编辑功能',
      description: '可编辑单词对的英语单词和中文翻译',
      icon: Edit,
      status: 'implemented'
    },
    {
      name: '添加新单词',
      description: '在词库中添加新的单词对',
      icon: Plus,
      status: 'implemented'
    },
    {
      name: '删除单词对',
      description: '删除词库中的单词对，带确认对话框',
      icon: Trash2,
      status: 'implemented'
    },
    {
      name: '创建新词库',
      description: '创建新的自定义词库',
      icon: Plus,
      status: 'implemented'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge className="bg-green-100 text-green-800">已实现</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">部分完成</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">待开发</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">词库管理功能测试</h1>
          <p className="text-slate-600">验证词库管理的各项功能是否正常工作</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              功能实现状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(feature.status)}
                    <feature.icon className="w-5 h-5 text-slate-500" />
                    <div>
                      <h3 className="font-medium">{feature.name}</h3>
                      <p className="text-sm text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(feature.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>测试说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">✅ 已实现的功能</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• 词库可以删除（非默认词库）</li>
                  <li>• 词库可以查看，显示所有单词对</li>
                  <li>• 查看词库时支持搜索功能</li>
                  <li>• 单词对可以编辑（英语单词和中文翻译）</li>
                  <li>• 可以添加新的单词对到词库</li>
                  <li>• 可以删除词库中的单词对</li>
                  <li>• 可以创建新的自定义词库</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">🎯 测试步骤</h3>
                <ol className="text-green-700 text-sm space-y-1">
                  <li>1. 点击下方按钮进入词库管理页面</li>
                  <li>2. 查看现有词库列表</li>
                  <li>3. 点击"查看"按钮打开词库详情</li>
                  <li>4. 在搜索框中输入关键词测试搜索功能</li>
                  <li>5. 点击编辑按钮修改单词对</li>
                  <li>6. 添加新的单词对</li>
                  <li>7. 删除单词对（测试确认对话框）</li>
                  <li>8. 创建新词库</li>
                  <li>9. 删除自定义词库（测试确认对话框）</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Link to="/library">
            <Button size="lg" className="mr-4">
              进入词库管理
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg">
              返回主页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestLibraryManager;