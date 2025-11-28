// src/pages/LoginPage.tsx (手动驾驶版 - 稳如老狗)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/db/supabase';
import { Loader2, Github } from 'lucide-react'; // 假设你装了lucide-react，没有的话可以用文字代替

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [loading, setLoading] = useState(false);

  // ✨ 1. 精确计算回家地址
  // 确保 vite.config.ts 里的 base 是 '/word-matching/'
  
  const redirectUrl = window.location.origin + import.meta.env.BASE_URL;

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // ✨ 2. 手动控制登录逻辑
  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      const fixedRedirectUrl = 'https://sushiyoha.github.io/word-matching'; 
      console.log("正在尝试登录，强制目标地址:", fixedRedirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          // 👇 这里是我们手动指定的，Supabase 绝对不敢忽略它
          redirectTo: fixedRedirectUrl,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("登录失败:", error.message);
      alert("登录出错了: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-2">欢迎来到 Robin 的世界</h2>
        <p className="text-sm text-gray-600 mb-8">
          登录后，开启您的词库之旅
        </p>

        {/* 自定义登录按钮 */}
        <button
          onClick={handleGithubLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#24292F] hover:bg-[#24292F]/90 text-white font-medium py-2.5 px-4 rounded-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            // 如果没有安装 lucide-react 图标库，可以直接写 "GitHub"
            <svg
              height="20"
              viewBox="0 0 16 16"
              width="20"
              fill="currentColor"
              className="mr-2"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          )}
          {loading ? '正在跳转...' : '使用 GitHub 登录'}
        </button>
        
        <p className="mt-6 text-xs text-gray-400">
          点击登录即代表您同意我们的服务条款
        </p>
      </div>
    </div>
  );
};

export default LoginPage;