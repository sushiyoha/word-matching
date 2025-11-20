// src/App.tsx (最终的、正确的版本！)

import React from 'react';
// ✨ 注意：我们不再需要从这里 import BrowserRouter 啦！
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import routes from './routes';
import { supabase } from './db/supabase'; 
import { SessionContextProvider } from '@supabase/auth-helpers-react';

const App: React.FC = () => {
  console.log("--- App.tsx 变电站检查 ---");
  console.log("接收到的 Supabase Client:", supabase);
  console.log("--------------------------");
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          {/* ✨ 我们把多余的 <BrowserRouter> 包装盒拆掉了！✨ */}
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={route.element}
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </SessionContextProvider>
  );
};

export default App;