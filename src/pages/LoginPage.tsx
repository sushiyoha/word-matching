// src/pages/LoginPage.tsx (最终修正版)

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// ✨ 1. 从“积木”工具箱里，我们只拿出 Auth 组件！
import { Auth } from '@supabase/auth-ui-react';
// ✨ 2. 从正确的“大脑”工具箱里，拿出 useUser！
import { useUser } from '@supabase/auth-helpers-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/db/supabase';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser(); // 这个 useUser 现在来自正确的工具箱啦！
  // ✨ 在这里加上“电力检测仪”！ ✨
  console.log("--- LoginPage.tsx 终端检查 ---");
  console.log("接收到的 Supabase Client:", supabase);
  console.log("--------------------------");

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">欢迎来到 Robin 的世界</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          登录后，您就可以上传和分享自己的词库啦！
        </p>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['github']}
          theme="light"
        />
      </div>
    </div>
  );
};

export default LoginPage;