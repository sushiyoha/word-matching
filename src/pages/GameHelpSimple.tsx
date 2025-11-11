import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const GameHelpSimple: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">游戏帮助</h1>
            <p className="text-slate-600">了解如何玩英语单词消消乐</p>
          </div>
        </div>

        {/* 游戏规则 */}
        <Card>
          <CardHeader>
            <CardTitle>🎮 游戏规则</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">1. 游戏目标</h3>
                <p className="text-blue-600 text-sm">
                  通过翻牌找到英语单词和对应中文翻译的配对，消除所有卡牌完成游戏。
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">2. 操作方法</h3>
                <p className="text-green-600 text-sm">
                  点击卡牌翻开，找到匹配的英语单词和中文翻译。匹配成功的卡牌会消失。
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">3. 计分规则</h3>
                <p className="text-purple-600 text-sm">
                  游戏记录您的完成步数和用时，步数越少、用时越短，成绩越好。
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-medium text-orange-800 mb-2">4. 游戏模式</h3>
                <p className="text-orange-600 text-sm">
                  基础模式：固定10个单词；加词模式：可增加单词数量，每次增加2个单词。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 功能介绍 */}
        <Card>
          <CardHeader>
            <CardTitle>✨ 功能特点</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-1">📚 多词库支持</h4>
                <p className="text-sm text-slate-600">内置游戏术语词库，支持自定义词库</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-1">📊 Excel导入</h4>
                <p className="text-sm text-slate-600">支持Excel文件批量导入单词</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-1">🏆 排行榜</h4>
                <p className="text-sm text-slate-600">记录最佳成绩，与其他玩家比较</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-1">📱 响应式设计</h4>
                <p className="text-sm text-slate-600">适配手机、平板、电脑等设备</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameHelpSimple;