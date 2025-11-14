// export const fetchTTS = async (text: string, lang: string) => {
//     try {
//       // 如果没有传 lang，默认英语 Eric
//       const voice = lang || "en-US-EricNeural";

      

  
//       const formData = new FormData();
//       formData.append("text", text);
//       formData.append("lang", voice);
  
//       const response = await fetch("https://sushiyoha-wordmatching-rg-csadckfuhthwf7cr.eastasia-01.azurewebsites.net/tts/", {
//         method: "POST",
//         body: formData,
//       });
  
//       if (!response.ok) {
//         console.error("TTS 接口请求失败:", response.statusText);
//         return;
//       }
  
//       const data = await response.json();
//       if (!data.url) {
//         console.error("没有返回语音 URL");
//         return;
//       }
  

  
//       // 播放语音
//       const audio = new Audio(data.url);
//       audio.play();
//     } catch (err) {
//       console.error("TTS 播放出错:", err);
//     }
//   };
  
//   // 完整语言列表
//   export const LANGUAGE_CODES = {
//     '英语': "en-US-EricNeural",
//     '中文': "zh-CN-XiaoxiaoNeural",
//     '日语': "ja-JP-DaichiNeural",
//     '韩语': "ko-KR-BongJinNeural",
//     '法语': "fr-FR-AlainNeural",
//     '德语': "de-DE-AmalaNeural",
//     '西班牙语': "es-ES-NilNeural",
//     '俄语': "ru-RU-DariyaNeural",
//     '意大利语': "it-IT-BenignoNeural",
//     '葡萄牙语': "pt-PT-DuarteNeural",
//     '阿拉伯语': "ar-SA-HamedNeural",
//     '泰语': "th-TH-AcharaNeural",
//     '越南语': "vi-VN-HoaiMyNeural",
//     '印地语': "hi-IN-AaravNeural",
//   } as const;
  
//   export const LANGUAGE_OPTIONS = Object.entries(LANGUAGE_CODES).map(([label, value]) => ({
//     label,
//     value,
//   }));
  


// ✨ 我们的新版 TTS 获取器，带有二级缓存功能！✨
// 
// ✨ 我们的“智能版” TTS 获取器，拥有自我修复能力！✨
export const fetchTTS = async (text: string, lang: string) => {
  try {
    const voice = lang || "en-US-EricNeural";
    const cacheKey = `tts-audio-url-${voice}-${text}`;

    // 1. 先检查“口袋”里有没有！
    const cachedUrl = localStorage.getItem(cacheKey);
    if (cachedUrl) {
      console.log("从浏览器缓存中命中！⚡️", text);
      const audio = new Audio(cachedUrl);
      
      // ✨ 智能修复魔法 ✨
      audio.play().catch(err => {
        console.warn("播放缓存音频失败，可能是链接已失效！", err);
        // 发现链接是坏的，就把它从缓存里删掉！
        localStorage.removeItem(cacheKey);
        console.log("已删除失效的缓存链接，准备重新获取...", text);
        // 然后重新请求一次，获取新的链接！
        fetchTTS(text, lang); 
      });
      return; // 结束本次执行
    }

    console.log("缓存未命中，向服务器请求...", text);
    // 2. 口袋里没有，才去麻烦“档案管理员” (后端)
    const formData = new FormData();
    formData.append("text", text);
    formData.append("lang", voice);

    const response = await fetch("https://sushiyoha-wordmatching-rg-csadckfuhthwf7cr.eastasia-01.azurewebsites.net/tts/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TTS 接口请求失败:", response.status, response.statusText, errorText);
      return;
    }

    const data = await response.json();
    if (!data.url) {
      console.error("服务器没有返回语音 URL");
      return;
    }

    // 3. 拿到新地址后，放进口袋
    localStorage.setItem(cacheKey, data.url);
    console.log("已将新 URL 存入缓存", text);

    // 4. 播放新语音
    const audio = new Audio(data.url);
    audio.play().catch(err => console.error("播放新音频失败:", err));

  } catch (err) {
    console.error("TTS 播放出错 (网络或其他错误):", err);
  }
};

// ... (你下面的 LANGUAGE_CODES 和 LANGUAGE_OPTIONS 保持不变)

// 完整语言列表
export const LANGUAGE_CODES = {
  '英语': "en-US-EricNeural",
  '中文': "zh-CN-XiaoqiuNeural",
  '日语': "ja-JP-DaichiNeural",
  '韩语': "ko-KR-BongJinNeural",
  '法语': "fr-FR-AlainNeural",
  '德语': "de-DE-AmalaNeural",
  '西班牙语': "es-ES-NilNeural",
  '俄语': "ru-RU-DariyaNeural",
  '意大利语': "it-IT-BenignoNeural",
  '葡萄牙语': "pt-PT-DuarteNeural",
  '阿拉伯语': "ar-SA-HamedNeural",
  '泰语': "th-TH-AcharaNeural",
  '越南语': "vi-VN-HoaiMyNeural",
  '印地语': "hi-IN-AaravNeural",
} as const;

export const LANGUAGE_OPTIONS = Object.entries(LANGUAGE_CODES).map(([label, value]) => ({
  label,
  value,
}));