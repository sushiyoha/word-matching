import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { HashRouter } from "react-router-dom"; // ✅ HashRouter 导入

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper>
      <HashRouter> {/* ✅ 包裹 App */}
        <App />
      </HashRouter>
    </AppWrapper>
  </StrictMode>
);

// 注册 Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker 注册成功:", registration);
      })
      .catch((error) => {
        console.log("Service Worker 注册失败:", error);
      });
  });
}
