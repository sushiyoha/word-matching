import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Play, 
  Target, 
  Trophy, 
  BookOpen,
  Clock,
  Users,
  Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';

const GameHelp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 标题和导航 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              游戏帮助
            </h1>
            <p className="text-slate-600">
              了解英语单词消消乐的玩法和规则
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回游戏
            </Button>
          </Link>
        </div>

        {/* 游戏介绍 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              游戏介绍
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">
              英语单词消消乐是一款寓教于乐的记忆配对游戏。通过翻牌配对的方式，
              帮助你记忆英语单词及其中文翻译，在游戏中提升英语词汇量。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800">丰富词库</h3>
                <p className="text-sm text-blue-600">
                  内置游戏术语词库，支持自定义词库
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800">记忆训练</h3>
                <p className="text-sm text-green-600">
                  通过配对游戏加深单词记忆
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-800">竞技排行</h3>
                <p className="text-sm text-purple-600">
                  记录成绩，挑战最佳时间
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 游戏规则 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              游戏规则
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="mt-1">1</Badge>
                <div>
                  <h4 className="font-semibold">选择词库和单词数量</h4>
                  <p className="text-sm text-slate-600">
                    从可用词库中选择一个，设置游戏中的单词数量（默认10个）
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="mt-1">2</Badge>
                <div>
                  <h4 className="font-semibold">开始游戏</h4>
                  <p className="text-sm text-slate-600">
                    点击"开始游戏"后，所有卡牌会翻到背面并随机打乱
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="mt-1">3</Badge>
                <div>
                  <h4 className="font-semibold">翻牌配对</h4>
                  <p className="text-sm text-slate-600">
                    点击卡牌翻开，寻找英语单词和对应中文翻译的配对
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="mt-1">4</Badge>
                <div>
                  <h4 className="font-semibold">完成游戏</h4>
                  <p className="text-sm text-slate-600">
                    成功配对所有单词后游戏结束，系统会记录你的成绩
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 游戏模式 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              游戏模式
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">基础模式</h4>
                <p className="text-sm text-slate-600 mb-3">
                  固定10个英语单词进行游戏，适合初学者
                </p>
                <Badge variant="secondary">推荐新手</Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">加词模式</h4>
                <p className="text-sm text-slate-600 mb-3">
                  可选择增加单词数量，每次增加5个单词，挑战更高难度
                </p>
                <Badge variant="outline">进阶挑战</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 计分规则 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              计分规则
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium">完成时间</span>
                <span className="text-sm text-slate-600">越短越好</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium">翻牌步数</span>
                <span className="text-sm text-slate-600">越少越好</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium">排行榜</span>
                <span className="text-sm text-slate-600">按时间和步数排序</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 游戏技巧 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              游戏技巧
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">记忆策略</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• 记住已翻开卡牌的位置</li>
                  <li>• 优先配对已知的单词对</li>
                  <li>• 利用单词的特征进行记忆</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">操作技巧</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• 从边角开始翻牌</li>
                  <li>• 避免重复翻同一张牌</li>
                  <li>• 保持专注，减少失误</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 词库管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              词库管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">
              你可以创建自定义词库来学习特定主题的单词：
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">1</Badge>
                <span className="text-sm">点击"词库管理"进入管理页面</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">2</Badge>
                <span className="text-sm">点击"创建词库"添加新词库</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">3</Badge>
                <span className="text-sm">按格式输入单词对：英文,中文</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">4</Badge>
                <span className="text-sm">保存后即可在游戏中使用</span>
              </div>
            </div>
            <Separator />
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-1">格式示例</h5>
              <code className="text-sm text-blue-700">
                apple,苹果<br />
                banana,香蕉<br />
                orange,橙子
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameHelp;