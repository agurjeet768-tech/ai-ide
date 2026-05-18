const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7860";

export const api = {
  base: BASE,

  // ── Health ────────────────────────────────────────────────────────────────
  async health() {
    const r = await fetch(`${BASE}/health`);
    return r.json();
  },

  async hfHealth() {
    const r = await fetch(`${BASE}/hf/health`);
    return r.json();
  },

  // ── Models ────────────────────────────────────────────────────────────────
  async getModels() {
    const r = await fetch(`${BASE}/models`);
    return r.json();
  },

  // ── Chat ──────────────────────────────────────────────────────────────────
  async chat(message: string, model: string, history: any[] = [], systemPrompt?: string) {
    const r = await fetch(`${BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, model, history, system_prompt: systemPrompt }),
    });
    if (!r.ok) throw new Error(`Chat error: ${r.status}`);
    return r.json();
  },

  // ── Code Generation ───────────────────────────────────────────────────────
  async generate(prompt: string, model: string, language?: string, task = "generate") {
    const r = await fetch(`${BASE}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model, language, task }),
    });
    if (!r.ok) throw new Error(`Generate error: ${r.status}`);
    return r.json();
  },

  // ── Files ─────────────────────────────────────────────────────────────────
  async listFiles(path = "") {
    const r = await fetch(`${BASE}/files?path=${encodeURIComponent(path)}`);
    return r.json();
  },

  async readFile(path: string) {
    const r = await fetch(`${BASE}/files/read?path=${encodeURIComponent(path)}`);
    if (!r.ok) throw new Error("File not found");
    return r.json();
  },

  async createFile(path: string, content = "") {
    const r = await fetch(`${BASE}/files/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content }),
    });
    return r.json();
  },

  async saveFile(path: string, content: string) {
    const r = await fetch(`${BASE}/files/edit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content }),
    });
    return r.json();
  },

  async deleteFile(path: string) {
    const r = await fetch(`${BASE}/files/delete?path=${encodeURIComponent(path)}`, {
      method: "DELETE",
    });
    return r.json();
  },

  // ── Logs ──────────────────────────────────────────────────────────────────
  async getLogs(limit = 100, level?: string) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (level) params.append("level", level);
    const r = await fetch(`${BASE}/logs?${params}`);
    return r.json();
  },

  async clearLogs() {
    const r = await fetch(`${BASE}/logs`, { method: "DELETE" });
    return r.json();
  },

  // ── WebSocket for Live Logs ───────────────────────────────────────────────
  connectLogs(onLog: (log: any) => void, onHistory: (logs: any[]) => void) {
    const wsUrl = BASE.replace("https://", "wss://").replace("http://", "ws://");
    const ws = new WebSocket(`${wsUrl}/ws/logs`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "history") onHistory(data.logs);
      else if (data.type === "log") onLog(data.log);
    };

    ws.onerror = () => console.warn("WebSocket error - falling back to polling");
    return ws;
  },
};

export type LogEntry = {
  id: number;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  message: string;
  source: string;
};

export type FileEntry = {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  modified: string;
};

export type Model = {
  id: string;
  name: string;
  type: string;
  description: string;
  max_tokens: number;
};
