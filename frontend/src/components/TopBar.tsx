"use client";

import { useIDEStore } from "@/lib/store";
import { api } from "@/lib/api";
import {
  Code2, MessageSquare, FolderOpen, Terminal, Activity,
  Menu, Cpu, Save, Plus, ChevronDown
} from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";

const NAV = [
  { id: "editor", icon: Code2, label: "Editor" },
  { id: "chat", icon: MessageSquare, label: "AI Chat" },
  { id: "files", icon: FolderOpen, label: "Files" },
  { id: "logs", icon: Terminal, label: "Logs" },
  { id: "health", icon: Activity, label: "Health" },
] as const;

export function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { activePanel, setActivePanel, selectedModel, setSelectedModel, backendHealth, openFiles, activeFile, updateFileContent } = useIDEStore();
  const [models, setModels] = useState<Record<string, any>>({});
  const [showModels, setShowModels] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getModels().then((d) => setModels(d.models || {})).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!activeFile) return;
    const file = openFiles.find((f) => f.path === activeFile);
    if (!file || !file.dirty) return;
    setSaving(true);
    try {
      await api.saveFile(activeFile, file.content);
      useIDEStore.setState((s) => ({
        openFiles: s.openFiles.map((f) => f.path === activeFile ? { ...f, dirty: false } : f),
      }));
    } catch (e) {
      alert("Save failed: " + e);
    } finally {
      setSaving(false);
    }
  };

  const currentFile = openFiles.find((f) => f.path === activeFile);
  const isOnline = backendHealth?.status === "healthy";

  return (
    <header className="flex items-center gap-2 px-3 h-11 bg-[#13161e] border-b border-[#1f2333] flex-shrink-0 z-50">
      {/* Logo */}
      <button onClick={onToggleSidebar} className="flex items-center gap-2 mr-2 hover:opacity-80 transition-opacity">
        <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Cpu size={14} className="text-white" />
        </div>
        <span className="text-[13px] font-semibold text-white hidden sm:block">AI IDE</span>
      </button>

      {/* Status dot */}
      <div className="flex items-center gap-1.5 mr-2">
        <div className={clsx("w-2 h-2 rounded-full", isOnline ? "bg-green-500 status-online" : "bg-red-500")} />
        <span className="text-[11px] text-slate-500 hidden sm:block">{isOnline ? "Connected" : "Offline"}</span>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-0.5 flex-1">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id as any)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-all",
              activePanel === id
                ? "bg-[#1a1e2a] text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1e2a]/50"
            )}
          >
            <Icon size={13} />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </nav>

      {/* Model Selector */}
      <div className="relative">
        <button
          onClick={() => setShowModels((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1e2a] border border-[#252a3a] rounded text-[12px] text-slate-300 hover:border-blue-500/50 transition-colors"
        >
          <span className="hidden md:block max-w-[120px] truncate">
            {models[selectedModel]?.name || selectedModel}
          </span>
          <ChevronDown size={12} />
        </button>

        {showModels && (
          <div className="absolute right-0 top-full mt-1 w-64 bg-[#1a1e2a] border border-[#252a3a] rounded-lg shadow-2xl z-50 overflow-hidden panel-fade">
            {Object.entries(models).map(([key, model]: any) => (
              <button
                key={key}
                onClick={() => { setSelectedModel(key); setShowModels(false); }}
                className={clsx(
                  "w-full flex flex-col items-start px-4 py-3 text-left hover:bg-[#252a3a] transition-colors border-b border-[#1f2333] last:border-0",
                  selectedModel === key && "bg-blue-500/10 border-l-2 border-l-blue-500"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-white">{model.name}</span>
                  <span className={clsx(
                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                    model.type === "code" ? "bg-blue-500/20 text-blue-400" :
                    model.type === "chat" ? "bg-purple-500/20 text-purple-400" :
                    "bg-slate-500/20 text-slate-400"
                  )}>{model.type}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5">{model.description}</span>
              </button>
            ))}
            {Object.keys(models).length === 0 && (
              <div className="px-4 py-3 text-[12px] text-slate-500">Loading models...</div>
            )}
          </div>
        )}
      </div>

      {/* Save button */}
      {currentFile?.dirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded text-[12px] text-white font-medium transition-colors"
        >
          <Save size={12} />
          <span>{saving ? "Saving..." : "Save"}</span>
        </button>
      )}
    </header>
  );
}
