// src/pages/LoginPage.tsx (最终修正版 + 补丁)

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { useUser } from '@supabase/auth-helpers-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/db/supabase';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();

  // ✨✨✨ 1. 计算正确的回家地址 ✨✨✨
  // window.location.origin 是 "https://sushiyoha.github.io"
  // import.meta.env.BASE_URL 是 "/word-matching/" (Vite配置的base)
  // 拼起来就是完整地址！
  const redirectUrl = window.location.origin + import.meta.env.BASE_URL;
  
  console.log("--- 登录重定向地址检查 ---");
  console.log("计划重定向到:", redirectUrl); 
  // 应该是: https://sushiyoha.github.io/word-matching/
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
          // ✨✨✨ 2. 加上这行关键代码！告诉 Auth 组件你要回哪里 ✨✨✨
          redirectTo={redirectUrl}
        />
      </div>
    </div>
  );
};

export default LoginPage;