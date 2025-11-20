import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✨ 3. 在这里加上我们的“电力检测仪”！ ✨
console.log("--- Supabase 发电站检查 ---");
console.log("Supabase URL:", supabaseUrl ? "✅ 已加载" : "❌ 未加载！");
console.log("Supabase Key:", supabaseAnonKey ? "✅ 已加载" : "❌ 未加载！");
console.log("Supabase Client 实例:", supabase);
console.log("--------------------------");