import WordMatchGame from './pages/WordMatchGame';
import LibraryManager from './pages/LibraryManager';
import GameHelp from './pages/GameHelp';
import GameSettingsPage from './pages/GameSettingsPage';
import PublicLibrariesPage from './pages/PublicLibrariesPage';
import LevelSelection from './pages/LevelSelection';
import LibraryDetailPage from './pages/LibraryDetailPage';
import CreateLibraryPage from './pages/CreateLibraryPage';
import TestLibraryManager from './pages/TestLibraryManager';
import TestGameSettings from './pages/TestGameSettings';
import TestPublicLibraries from './pages/TestPublicLibraries';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '英语单词消消乐',
    path: '/',
    element: <WordMatchGame />
  },
  {
    name: '关卡选择',
    path: '/levels',
    element: <LevelSelection />
  },
  {
    name: '游戏设置',
    path: '/settings',
    element: <GameSettingsPage />
  },
  {
    name: '创建词库',
    path: '/create-library',
    element: <CreateLibraryPage />
  },
  {
    name: '词库详情',
    path: '/library/:libraryId',
    element: <LibraryDetailPage />
  },
  {
    name: '公共词库',
    path: '/public-libraries',
    element: <PublicLibrariesPage />
  },
  {
    name: '词库管理',
    path: '/library',
    element: <LibraryManager />
  },
  {
    name: '游戏帮助',
    path: '/help',
    element: <GameHelp />
  },
  {
    name: '测试词库功能',
    path: '/test-library',
    element: <TestLibraryManager />
  },
  {
    name: '测试游戏设置',
    path: '/test-settings',
    element: <TestGameSettings />
  },
  {
    name: '测试公共词库',
    path: '/test-public',
    element: <TestPublicLibraries />
  }
];

export default routes;