# 词库管理功能文档

## 功能概述

本文档描述了英语单词消消乐游戏中新增的词库管理功能，包括查看、搜索、编辑、删除词库和单词对，以及添加新词对的功能。

## 已实现功能

### 1. 词库查看功能
- **位置**: 游戏设置对话框 → 词库选择区域 → "查看词库"按钮
- **功能**: 在弹出对话框中显示选中词库的所有单词对
- **界面**: 表格形式展示，包含英语单词、中文翻译和操作按钮

### 2. 单词搜索功能
- **位置**: 词库详情对话框顶部的搜索框
- **功能**: 实时搜索词库中的单词和翻译
- **特性**: 支持英文和中文搜索，不区分大小写

### 3. 单词编辑功能
- **位置**: 词库详情对话框 → 每行单词的"编辑"按钮
- **功能**: 修改单词的英文和中文翻译
- **界面**: 弹出编辑表单，包含英文和中文输入框

### 4. 单词删除功能
- **位置**: 词库详情对话框 → 每行单词的"删除"按钮
- **功能**: 删除不需要的单词对
- **安全性**: 删除前会弹出确认对话框

### 5. 词库删除功能
- **位置**: 游戏设置对话框 → 词库选择区域 → "删除词库"按钮
- **功能**: 删除整个词库（默认词库除外）
- **限制**: 默认词库不能删除，按钮会被禁用

### 6. 添加词对功能 ⭐ 新增
- **位置**: 词库详情对话框 → "添加词对"按钮
- **功能**: 向现有词库添加新的单词-翻译对
- **方式**: 
  - **手动添加**: 单个输入英文单词和中文翻译
  - **Excel批量添加**: 上传Excel文件批量导入单词对 ⭐ 最新功能
- **界面**: 弹出添加表单，支持选择添加方式
- **验证**: 确保输入内容完整且有效
- **Excel格式**: 第一列为英语单词，第二列为中文翻译，支持.xlsx和.xls格式

## 技术实现

### 状态管理
```typescript
// 词库管理相关状态
const [showLibraryDetails, setShowLibraryDetails] = useState(false);
const [viewingLibrary, setViewingLibrary] = useState<WordLibrary | null>(null);
const [libraryWords, setLibraryWords] = useState<any[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [editingWord, setEditingWord] = useState<any>(null);
const [showEditDialog, setShowEditDialog] = useState(false);
const [showAddWordDialog, setShowAddWordDialog] = useState(false); // 新增
const [isDeleting, setIsDeleting] = useState(false);
const [isAddingWord, setIsAddingWord] = useState(false); // 新增
```

### 核心处理函数

#### 1. 查看词库
```typescript
const handleViewLibrary = async (library: WordLibrary) => {
  // 获取词库中的所有单词对并显示在对话框中
}
```

#### 2. 删除词库
```typescript
const handleDeleteLibrary = async (library: WordLibrary) => {
  // 删除整个词库（带确认对话框）
}
```

#### 3. 编辑单词
```typescript
const handleEditWord = (word: any) => {
  // 打开编辑对话框
}

const handleSaveEditWord = async (english: string, chinese: string) => {
  // 保存编辑后的单词
}
```

#### 4. 删除单词
```typescript
const handleDeleteWord = async (wordId: string) => {
  // 删除单词对（带确认对话框）
}
```

#### 5. 添加词对 ⭐ 新增
```typescript
const handleAddWord = async (english: string, chinese: string) => {
  // 向当前词库添加单个单词对
  // 包含输入验证和错误处理
}

const handleBatchAddWords = async (wordPairs: Array<{english: string, chinese: string}>) => {
  // 批量添加多个单词对
  // 支持Excel文件解析和批量处理
  // 提供详细的成功/失败统计
}
```

### 组件结构

#### 主要对话框
1. **词库详情对话框**: 显示词库内容，包含搜索和管理功能
2. **编辑单词对话框**: 编辑现有单词的表单
3. **添加词对对话框**: 添加新单词的表单 ⭐ 新增

#### 表单组件
1. **EditWordForm**: 编辑单词的表单组件
2. **AddWordForm**: 添加新词对的表单组件 ⭐ 新增
   - 支持选择添加方式（手动/Excel批量）
   - 手动添加：单个单词输入表单
   - Excel批量添加：文件上传和解析功能

## API 接口

### 使用的 API 方法
- `wordLibraryApi.getAll()`: 获取所有词库
- `wordLibraryApi.delete(id)`: 删除词库
- `wordPairApi.getByLibraryId(libraryId)`: 获取词库中的单词
- `wordPairApi.update(id, data)`: 更新单词
- `wordPairApi.delete(id)`: 删除单词
- `wordPairApi.create(data)`: 创建新单词对 ⭐ 新增

### 数据字段映射
- 英语单词: `english_word`
- 中文翻译: `chinese_translation`
- 词库ID: `library_id`

## 用户界面

### 词库选择区域
- 词库下拉选择器
- "查看词库"按钮
- "删除词库"按钮（非默认词库）

### 词库详情对话框
- 搜索框（支持实时搜索）
- "添加词对"按钮 ⭐ 新增
- 单词列表表格
  - 英语单词列
  - 中文翻译列
  - 操作列（编辑、删除按钮）

### 添加词对对话框 ⭐ 新增
- 添加方式选择（单选按钮）
  - 手动添加：英语单词和中文翻译输入框
  - Excel批量添加：文件上传区域
- 取消/添加按钮
- 加载状态显示
- Excel格式说明文字

## 测试页面

创建了专门的测试页面 `TestGameSettings.tsx` 用于验证所有词库管理功能：

### 访问路径
- URL: `/test-settings`
- 从主游戏页面点击"测试设置功能"按钮

### 测试内容
- 显示当前词库状态
- 提供功能说明和使用方法
- 一键打开游戏设置对话框进行测试
- 测试手动添加和Excel批量添加功能

## 错误处理

### 输入验证
- 添加词对时检查英文和中文是否为空
- 编辑时确保输入内容有效
- Excel文件格式验证和内容解析错误处理

### 网络错误
- API 调用失败时显示友好的错误提示
- 使用 toast 通知用户操作结果
- 批量添加时提供详细的成功/失败统计

### 用户确认
- 删除操作前显示确认对话框
- 防止误操作导致数据丢失

## 使用流程

### 查看和管理词库
1. 打开游戏设置
2. 选择要管理的词库
3. 点击"查看词库"按钮
4. 在弹出的对话框中进行各种管理操作

### 添加新词对 ⭐ 新增
1. 在词库详情对话框中点击"添加词对"按钮
2. 选择添加方式：
   - **手动添加**：在表单中输入英语单词和中文翻译
   - **Excel批量添加**：上传Excel文件批量导入单词对
3. 点击"添加"按钮保存（手动添加）或选择Excel文件（批量添加）
4. 新词对会立即显示在词库列表中

#### Excel批量添加格式要求
- 支持 .xlsx 和 .xls 格式
- 第一列：英语单词
- 第二列：中文翻译
- 第一行可以是标题行（会被自动跳过）
- 确保每行都有完整的单词对数据

**Excel文件示例格式：**
```
English Word    Chinese Translation
apple          苹果
banana         香蕉
orange         橙子
computer       电脑
phone          手机
```

### 编辑现有词对
1. 在词库详情对话框中找到要编辑的单词
2. 点击该行的"编辑"按钮
3. 在弹出的表单中修改内容
4. 点击"保存"按钮确认修改

### 删除词对
1. 在词库详情对话框中找到要删除的单词
2. 点击该行的"删除"按钮
3. 在确认对话框中点击"确定"

## 注意事项

1. **默认词库保护**: 默认词库不能被删除，相关按钮会被禁用
2. **数据同步**: 所有修改会立即反映在界面上，无需刷新页面
3. **搜索功能**: 搜索是实时的，支持英文和中文内容搜索
4. **输入验证**: 添加和编辑时会验证输入内容的完整性
5. **错误提示**: 操作失败时会显示具体的错误信息

## 更新日志

### v1.2 - Excel批量添加功能 ⭐ 最新
- 新增Excel批量添加功能
- 更新 `AddWordForm` 组件支持添加方式选择
- 新增 `handleBatchAddWords` 处理函数
- 新增Excel文件解析和批量处理逻辑
- 增强错误处理和成功/失败统计
- 更新测试页面和文档说明

### v1.1 - 添加词对功能 ⭐
- 新增添加词对功能
- 新增 `AddWordForm` 组件
- 新增 `handleAddWord` 处理函数
- 新增 `showAddWordDialog` 和 `isAddingWord` 状态
- 更新词库详情对话框界面，添加"添加词对"按钮
- 更新测试页面说明文档

### v1.0 - 基础词库管理功能
- 实现词库查看功能
- 实现单词搜索功能  
- 实现单词编辑功能
- 实现单词删除功能
- 实现词库删除功能
- 创建测试页面