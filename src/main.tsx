// src/main.tsx (修复版)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

console.log("--- 环境检查 ---");
// 这里的 BASE_URL 会自动读取你在 vite.config.ts 里配置的 base
console.log("BASE_URL:", import.meta.env.BASE_URL); 

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename="/word-matching">
      <App />
    </BrowserRouter>
  // </React.StrictMode>
);