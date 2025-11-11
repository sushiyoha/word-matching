// speech.ts - 终极优化版，首次朗读几乎零延迟

let voicesInitialized = false;
const voiceCache = new Map<string, SpeechSynthesisVoice | null>();

/**
 * 初始化语音列表
 */
export const initVoices = (): Promise<void> => {
  return new Promise((resolve) => {
    if (voicesInitialized) return resolve();

    if (!('speechSynthesis' in window)) {
      console.warn('浏览器不支持语音合成');
      return resolve();
    }

    const handleVoicesLoaded = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesInitialized = true;
        preloadAndWarmUpVoices();
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesLoaded);
        resolve();
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesLoaded);

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesInitialized = true;
      preloadAndWarmUpVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesLoaded);
      resolve();
      return;
    }

    setTimeout(() => {
      voicesInitialized = true;
      preloadAndWarmUpVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesLoaded);
      resolve();
    }, 3000);
  });
};

/**
 * 预加载常用语言语音并静音预热
 */
const preloadAndWarmUpVoices = () => {
  const commonLangs = ['en-UK', 'zh-CN', 'ja-JP', 'ko-KR', 'fr-FR', 'de-DE', 'es-ES'];
  commonLangs.forEach(lang => {
    if (!voiceCache.has(lang)) {
      const voice = getBestVoiceForLang(lang);
      voiceCache.set(lang, voice);
      if (voice) {
        console.log(`预加载语音: ${voice.name} (${lang})`);
        // 静音预热 1-3 次，英语优先多次
        const preheatTimes = lang.startsWith('en') ? 3 : 1;
        for (let i = 0; i < preheatTimes; i++) {
          const utter = new SpeechSynthesisUtterance('Hello');
          utter.voice = voice;
          utter.volume = 0;
          window.speechSynthesis.speak(utter);
        }
      }
    }
  });
};

/**
 * 使用语音朗读
 */
export const speak = (text: string, lang: string = 'zh-CN'): void => {
  if (!('speechSynthesis' in window)) return;

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;

  let voice = voiceCache.get(lang);
  if (voice === undefined) {
    voice = getBestVoiceForLang(lang);
    voiceCache.set(lang, voice);
  }

  if (voice) utter.voice = voice;

  utter.rate = 0.9;
  utter.pitch = 1;
  utter.volume = 1.0;

  utter.onerror = (event) => {
    console.error('语音合成错误:', event.error, event);
  };

  window.speechSynthesis.speak(utter);
};

/**
 * 停止朗读
 */
export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

/**
 * 获取可用语音
 */
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if ('speechSynthesis' in window) return window.speechSynthesis.getVoices();
  return [];
};

/**
 * 调试打印语音
 */
export const logAvailableVoices = async (): Promise<void> => {
  await initVoices();
  const voices = getAvailableVoices();
  console.log(`共有 ${voices.length} 个可用语音:`);
  voices.forEach((v, i) => {
    console.log(`${i + 1}. ${v.name} (${v.lang}) - ${v.localService ? '本地' : '在线'}`);
  });
};

/**
 * 获取最佳语音
 */
export const getBestVoiceForLang = (lang: string): SpeechSynthesisVoice | null => {
  const voices = getAvailableVoices();
  if (!voices.length) return null;

  let voice = voices.find(v => v.lang === lang && v.localService);
  if (!voice) voice = voices.find(v => v.lang === lang);
  if (!voice) voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && v.localService);
  if (!voice) voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
  if (!voice && voices.length) voice = voices[0];

  return voice || null;
};

// 语言代码映射
export const LANGUAGE_CODES = {
  '英语': 'en-UK',
  '中文': 'zh-CN',
  '日语': 'ja-JP',
  '韩语': 'ko-KR',
  '法语': 'fr-FR',
  '德语': 'de-DE',
  '西班牙语': 'es-ES',
  '俄语': 'ru-RU',
  '意大利语': 'it-IT',
  '葡萄牙语': 'pt-PT',
  '阿拉伯语': 'ar-SA',
  '泰语': 'th-TH',
  '越南语': 'vi-VN',
  '印地语': 'hi-IN',
} as const;

export const LANGUAGE_OPTIONS = Object.entries(LANGUAGE_CODES).map(([label, value]) => ({ label, value }));
