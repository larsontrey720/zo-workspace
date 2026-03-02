import type { Context } from "hono";
import { readFileSync, writeFileSync, existsSync } from "fs";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CONV_FILE = "/home/workspace/telegram-chat.md";

async function sendTyping(chatId: number) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  });
}

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function sendPhoto(chatId: number, photoUrl: string, caption?: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption: caption || undefined,
    }),
  });
}

function extractImagePaths(text: string): string[] {
  const paths: string[] = [];
  
  const localMatch = text.match(/!\\[([^\\]]*)\\]\\(([^)]+)\\)/g);
  if (localMatch) {
    for (const match of localMatch) {
      const pathMatch = match.match(/!\\[[^\\]]*\\]\\(([^)]+)\\)/);
      if (pathMatch) paths.push(pathMatch[1]);
    }
  }
  
  const fileMatch = text.match(/file\\s+['\"]([^'\"]+\\.(png|jpg|jpeg|gif|webp))['\"]/gi);
  if (fileMatch) {
    for (const match of fileMatch) {
      const filePathMatch = match.match(/file\\s+['\"]([^'\"]+)['\"]/i);
      if (filePathMatch) {
        const filePath = filePathMatch[1];
        if (!filePath.startsWith('/')) {
          paths.push(`/home/workspace/${filePath}`);
        } else {
          paths.push(filePath);
        }
      }
    }
  }
  
  const absMatch = text.match(/(\\/home\\/workspace\\/[^\\s]+\\.(png|jpg|jpeg|gif|webp))/gi);
  if (absMatch) {
    paths.push(...absMatch);
  }
  
  const urlPatterns = [
    /https?:\\/\\/[^\\s]+.(png|jpg|jpeg|gif|webp)/gi,
    /https?:\\/\\/static\\.z\\.computer\\/img[^\\s]*/gi,
    /https?:\\/\\/georgeo\\.zo\\.space\\/images\\/[^\\s]*/gi,
  ];
  
  for (const pattern of urlPatterns) {
    const matches = text.match(pattern);
    if (matches) paths.push(...matches);
  }
  
  return [...new Set(paths)];
}

async function convertToPublicUrl(localPath: string): Promise<string | null> {
  if (localPath.startsWith('http')) return localPath;
  
  const filename = localPath.split('/').pop();
  if (!filename) return null;
  
  try {
    const uploadRes = await fetch(`https://georgeo.zo.space/api/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_file: localPath,
        asset_path: `/images/${filename}`
      }),
    });
    
    if (uploadRes.ok) {
      return `https://georgeo.zo.space/images/${filename}`;
    }
  } catch (e) {
    console.error("Upload error:", e);
  }
  
  return null;
}

function removeImageRefs(text: string): string {
  return text.replace(/!\\[([^\\]]*)\\]\\(([^)]+)\\)/g, "").trim();
}

function loadHistory(): string {
  try {
    if (existsSync(CONV_FILE)) {
      return readFileSync(CONV_FILE, "utf-8");
    }
  } catch (e) { console.error("Load error:", e); }
  return "";
}

function saveHistory(content: string) {
  try {
    writeFileSync(CONV_FILE, content);
  } catch (e) { console.error("Save error:", e); }
}

async function processMessage(chatId: number, text: string) {
  try {
    const zoKey = process.env.ZO_API_KEY;
    if (!zoKey) {
      await sendMessage(chatId, "ZO_API_KEY not set. Add it in Settings > Advanced.");
      return;
    }

    const history = loadHistory();
    await sendTyping(chatId);

    const prompt = history 
      ? `Previous conversation:\\n${history}\\n\\n---\\n\\nUser's new message: ${text}`
      : text;

    const zoRes = await fetch("https://api.zo.computer/zo/ask", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${zoKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: prompt,
        model_name: "openrouter:minimax/minimax-m2.5",
      }),
    });

    const zoData = await zoRes.json();
    const reply = zoData.output || zoData.response || "Got your message!";

    const imagePaths = extractImagePaths(reply);
    const publicUrls: string[] = [];
    
    for (const path of imagePaths) {
      const url = await convertToPublicUrl(path);
      if (url) publicUrls.push(url);
    }

    const cleanReply = removeImageRefs(reply);
    const newHistory = history 
      ? `${history}\\n\\nUser: ${text}\\nAssistant: ${reply}`
      : `User: ${text}\\nAssistant: ${reply}`;
    saveHistory(newHistory);

    for (const url of publicUrls) {
      await sendPhoto(chatId, url);
    }

    if (cleanReply) {
      await sendMessage(chatId, cleanReply);
    }

  } catch (error) {
    console.error("Background processing error:", error);
    await sendMessage(chatId, "Sorry, something went wrong.");
  }
}

export default async (c: Context) => {
  // Handle GET requests for warming (health checks)
  if (c.req.method === "GET") {
    return c.json({ status: "warm", ok: true });
  }

  if (!TELEGRAM_BOT_TOKEN) {
    return c.json({ error: "TELEGRAM_BOT_TOKEN not configured" }, 500);
  }

  const update = await c.req.json();
  const message = update.message;
  if (!message || !message.text || !message.chat) {
    return c.json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = message.text;

  if (text === "/start") {
    saveHistory("");
    await sendMessage(chatId, "Hey! I'm your Zo assistant. Send me any message and I'll respond. /clear to start fresh.");
    return c.json({ ok: true });
  }

  if (text === "/clear") {
    saveHistory("");
    await sendMessage(chatId, "Conversation cleared! Start fresh.");
    return c.json({ ok: true });
  }

  // Process in background (fire and forget) but before returning
  processMessage(chatId, text);
  
  // Respond immediately to prevent Telegram retries
  return c.json({ ok: true });
};
