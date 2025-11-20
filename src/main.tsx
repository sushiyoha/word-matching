// src/main.tsx (最终升级版)

import React from 'react';
import ReactDOM from 'react-dom/client';
// ✨ 1. 我们从这里引入 BrowserRouter！✨
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'; // 或者您的全局样式文件


// ✨✨✨ 在这里加上我们的“科学实验”代码！ ✨✨✨
console.log("--- Vite 环境变量终极测试 ---");
console.log("直接读取 VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("查看 Vite 加载的所有环境变量:", import.meta.env);
console.log("-------------------------------");

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  //   {/* ✨ 2. 用 BrowserRouter 来包裹我们的 App！✨ */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </React.StrictMode>
);

// 注册 Service Worker
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then((registration) => {
//         console.log("Service Worker 注册成功:", registration);
//       })
//       .catch((error) => {
//         console.log("Service Worker 注册失败:", error);
//       });
//   });
// }
