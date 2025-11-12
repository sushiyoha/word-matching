
// export const fetchTTS = async (text: string, lang: string) => {
//     try {
//       // 如果没有传 lang，默认英语 Eric
//       const voice = lang || "en-US-EricNeural";
  
//       const formData = new FormData();
//       formData.append("text", text);
//       formData.append("lang", voice);
  
//       const response = await fetch("http://127.0.0.1:8000/tts/", {
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
//     英语: "en-US-EricNeural",
//     中文: "zh-CN-XiaoxiaoNeural",
//     日语: "ja-JP-DaichiNeural",
//     韩语: "ko-KR-BongJinNeural",
//     法语: "fr-FR-AlainNeural",
//     德语: "de-DE-AmalaNeural",
//     西班牙语: "es-ES-NilNeural",
//     俄语: "ru-RU-DariyaNeural",
//     意大利语: "it-IT-BenignoNeural",
//     葡萄牙语: "pt-PT-DuarteNeural",
//     阿拉伯语: "ar-SA-HamedNeural",
//     泰语: "th-TH-AcharaNeural",
//     越南语: "vi-VN-HoaiMyNeural",
//     印地语: "hi-IN-AaravNeural",
//   } as const;
  
//   export const LANGUAGE_OPTIONS = Object.entries(LANGUAGE_CODES).map(([label, value]) => ({
//     label,
//     value,
//   }));
  

export const fetchTTS = async (text: string, lang: string) => {
    try {
      // 如果没有传 lang，默认英语 Eric
      const voice = lang || "en-US-EricNeural";

      
      // // 生成唯一的 cache key，确保缓存的是同一个文本和语言的组合
      // const cacheKey = `${voice}-${text}`;
      
      // // 检查缓存中是否已经有该语音的 URL
      // const cachedUrl = localStorage.getItem(cacheKey);
      // if (cachedUrl) {
      //   // 如果缓存有，直接播放
      //   const audio = new Audio(cachedUrl);
      //   audio.play();
      //   return;
      //}
  
      const formData = new FormData();
      formData.append("text", text);
      formData.append("lang", voice);
  
      const response = await fetch("https://word-matching.onrender.com/tts/", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        console.error("TTS 接口请求失败:", response.statusText);
        return;
      }
  
      const data = await response.json();
      if (!data.url) {
        console.error("没有返回语音 URL");
        return;
      }
  
      // 缓存返回的 URL
      // localStorage.setItem(cacheKey, data.url);
  
      // 播放语音
      const audio = new Audio(data.url);
      audio.play();
    } catch (err) {
      console.error("TTS 播放出错:", err);
    }
  };
  
  // 完整语言列表
  export const LANGUAGE_CODES = {
    '英语': "en-US-EricNeural",
    '中文': "zh-CN-XiaoxiaoNeural",
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
  