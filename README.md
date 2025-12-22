# 悠哈想说：I want to say
1.大家好！这是悠哈用百度秒哒平台搭建的单词消消乐游戏，是把所有单词卡牌背面朝上打乱顺序后，再进行匹配的消消乐游戏。<br>
2.总之是一个学习单词的游戏！<br>
3.单词有声音，但发音一开始有点慢，多点几次会变快。<br>
4.都来玩！<br>

Hi! This is a word-matching game made with the assistance of artificial intelligence. <br>
You can learn English/Chinese/Spanish/...here.<br>
The words have sounds effect, but need some time.<br>
Have fun!<br>

# 怎么体验？How to play
请直接点击这个链接，然后稍作等待（因为数据库调用好慢啊）！ <br>Click this!<br>
https://sushiyoha.github.io/word-matching/

# 未来功能 What to wait
1. 上传书籍/文献/视频/音频，自动解析词书 Extract words from a file and creat a word library （因为看欧美剧、读英文文献的时候总是觉得要是自己背了这上面的词语就好了）<br>

# You can ignore informations below.
## 🎯 游戏玩法

1. **选择词库**: 从可用词库中选择一个进行游戏
2. **开始游戏**: 点击开始后，卡牌会翻到背面并打乱
3. **翻牌配对**: 点击卡牌寻找英语单词和中文翻译的配对
4. **完成游戏**: 成功配对所有单词后游戏结束

## 🛠 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件**: shadcn/ui + Tailwind CSS
- **数据库**: Supabase
- **路由**: React Router
- **状态管理**: React Hooks
- **图标**: Lucide React
- **后端**：Python + Azure


## 目录结构

```
├── README.md # 说明文档
├── components.json # 组件库配置
├── eslint.config.js # eslint 配置
├── index.html # 入口文件
├── package.json # 包管理
├── postcss.config.js # postcss 配置
├── public # 静态资源目录
│   ├── favicon.png # 图标
│   └── images # 图片资源
├── src # 源码目录
│   ├── App.tsx # 入口文件
│   ├── components # 组件目录
│   ├── context # 上下文目录
│   ├── db # 数据库配置目录
│   ├── hooks # 通用钩子函数目录
│   ├── index.css # 全局样式
│   ├── layout # 布局目录
│   ├── lib # 工具库目录
│   ├── main.tsx # 入口文件
│   ├── routes.tsx # 路由配置
│   ├── pages # 页面目录
│   ├── services  # 数据库交互目录
│   ├── types   # 类型定义目录
├── tsconfig.app.json  # ts 前端配置文件
├── tsconfig.json # ts 配置文件
├── tsconfig.node.json # ts node端配置文件
└── vite.config.ts # vite 配置文件
```

## 技术栈

Vite、TypeScript、React、Supabase、Python

