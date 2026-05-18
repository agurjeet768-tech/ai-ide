import { create } from "zustand";
import { LogEntry, FileEntry } from "./api";

interface IDEStore {
  // Active panel
  activePanel: "editor" | "chat" | "files" | "logs" | "health";
  setActivePanel: (p: IDEStore["activePanel"]) => void;

  // Editor
  openFiles: { path: string; content: string; dirty: boolean }[];
  activeFile: string | null;
  openFile: (path: string, content: string) => void;
  closeFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  setActiveFile: (path: string) => void;

  // Model
  selectedModel: string;
  setSelectedModel: (m: string) => void;

  // Logs
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
  setLogs: (logs: LogEntry[]) => void;
  clearLogs: () => void;
  logFilter: string;
  setLogFilter: (f: string) => void;

  // Health
  backendHealth: any;
  hfHealth: any;
  setBackendHealth: (h: any) => void;
  setHfHealth: (h: any) => void;

  // Sidebar
  files: FileEntry[];
  setFiles: (f: FileEntry[]) => void;
}

export const useIDEStore = create<IDEStore>((set, get) => ({
  activePanel: "editor",
  setActivePanel: (p) => set({ activePanel: p }),

  openFiles: [],
  activeFile: null,
  openFile: (path, content) => {
    const exists = get().openFiles.find((f) => f.path === path);
    if (!exists) {
      set((s) => ({ openFiles: [...s.openFiles, { path, content, dirty: false }] }));
    }
    set({ activeFile: path });
  },
  closeFile: (path) => {
    const files = get().openFiles.filter((f) => f.path !== path);
    const active = get().activeFile === path ? (files[0]?.path ?? null) : get().activeFile;
    set({ openFiles: files, activeFile: active });
  },
  updateFileContent: (path, content) => {
    set((s) => ({
      openFiles: s.openFiles.map((f) => (f.path === path ? { ...f, content, dirty: true } : f)),
    }));
  },
  setActiveFile: (path) => set({ activeFile: path }),

  selectedModel: "deepseek-coder-7b",
  setSelectedModel: (m) => set({ selectedModel: m }),

  logs: [],
  addLog: (log) => set((s) => ({ logs: [...s.logs.slice(-499), log] })),
  setLogs: (logs) => set({ logs }),
  clearLogs: () => set({ logs: [] }),
  logFilter: "ALL",
  setLogFilter: (f) => set({ logFilter: f }),

  backendHealth: null,
  hfHealth: null,
  setBackendHealth: (h) => set({ backendHealth: h }),
  setHfHealth: (h) => set({ hfHealth: h }),

  files: [],
  setFiles: (f) => set({ files: f }),
}));
