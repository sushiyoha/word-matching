// src/hooks/useSoundEffect.ts

export const useSoundEffect = () => {
    const baseNotes = [
      261.63*8/9*8/9, 293.66*8/9*8/9, 329.63*8/9*8/9, 349.23*8/9*8/9, // do re mi fa
      392.00*8/9*8/9, 440.00*8/9*8/9, 493.88*8/9*8/9, 523.25*8/9*8/9, // so la ti do
      587.33*8/9*8/9, 659.26*8/9*8/9, 698.46*8/9*8/9, 783.99*8/9*8/9, // re mi fa so
      880.00*8/9*8/9, 987.77*8/9*8/9, 1046.50*8/9*8/9, 1174.66*8/9*8/9, // la ti do re
      1318.51*8/9*8/9, 1396.91*8/9*8/9, 1567.98*8/9*8/9, 1760.00*8/9*8/9 // mi fa so la
    ];
  
    const playSound = (tone: "piano" | "bell" | "8bit" | "crystal", index: number) => {
        let ctx = (window as any).audioCtx as AudioContext;
        if (!ctx) {
            ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            (window as any).audioCtx = ctx; // ✅ 全局共用一个音频上下文
        }

        // 确保唤醒（有时 resume 需要异步）
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }

      
  
      const note = baseNotes[index % baseNotes.length];
  
      // 统一的退出函数
      const stopAfter = (oscillators: OscillatorNode[], gain: GainNode, duration: number) => {
        oscillators.forEach(o => o.stop(ctx.currentTime + duration));
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      };

      if (tone === "bell") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
  
        osc1.type = "sine";
        osc2.type = "triangle";
        osc1.frequency.value = note;
        osc2.frequency.value = note * 2.02;
  
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
  
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc1.start();
        osc2.start();
        stopAfter([osc1, osc2], gain, 0.6);
      }
  
      else if (tone === "piano") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        // 双振荡器叠加，让钢琴更圆润
        osc1.type = "triangle";
        osc2.type = "sine";

        osc1.frequency.setValueAtTime(note, ctx.currentTime);
        osc2.frequency.setValueAtTime(note * 1.02, ctx.currentTime); // 微微偏高一点制造共鸣

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc1.start();
        osc2.start();
        stopAfter([osc1, osc2], gain, 0.5);
      }


      else if (tone === "8bit") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
      
        // 双方波，一个主音，一个高频和声
        osc1.type = "square";
        osc2.type = "square";
      
        osc1.frequency.value = note;
        osc2.frequency.value = note * 1.5;
      
        // 轻微滑音效果（快速上升半音）
        osc1.frequency.setValueAtTime(note, ctx.currentTime);
        osc1.frequency.linearRampToValueAtTime(note * 1.05, ctx.currentTime + 0.1);
      
        osc2.frequency.setValueAtTime(note * 1.5, ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(note * 1.55, ctx.currentTime + 0.1);
      
        // 轻柔音量衰减
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
      
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.25);
        osc2.stop(ctx.currentTime + 0.25);
      }
      

  
      else if (tone === "crystal") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
  
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.value = note;
        osc2.frequency.value = note * 1.5;
  
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
  
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc1.start();
        osc2.start();
        stopAfter([osc1, osc2], gain, 0.8);
      }
    };
  
    return { playSound };
  };
  