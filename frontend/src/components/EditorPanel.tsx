"use client";

import { useIDEStore } from "@/lib/store";
import { api } from "@/lib/api";
import dynamic from "next/dynamic";
import { Code2, Save, Wand2, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

// Lazy load Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

function getLanguage(filename: string) {
  const ext = filename?.split(".").pop() || "";
  const map: Record<string, string> = {
    py: "python", js: "javascript", ts: "typescript", tsx: "typescriptreact",
    jsx: "javascriptreact", json: "json", md: "markdown", css: "css",
    html: "html", sh: "shell", bash: "shell", yml: "yaml", yaml: "yaml",
    rs: "rust", go: "go", java: "java", cpp: "cpp", c: "c",
  };
  return map[ext] || "plaintext";
}

export function EditorPanel() {
  const { openFiles, activeFile, updateFileContent, setActiveFile, closeFile, selectedModel } = useIDEStore();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiBar, setShowAiBar] = useState(false);

  const currentFile = openFiles.find((f) => f.path === activeFile);

  const handleSave = async () => {
    if (!activeFile || !currentFile) return;
    try {
      await api.saveFile(activeFile, currentFile.content);
      useIDEStore.setState((s) => ({
        openFiles: s.openFiles.map((f) => f.path === activeFile ? { ...f, dirty: false } : f),
      }));
    } catch (e) {
      alert("Save failed: " + e);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const lang = activeFile ? getLanguage(activeFile) : undefined;
      const res = await api.generate(aiPrompt, selectedModel, lang, "generate");
      if (res.response && activeFile) {
        const current = currentFile?.content || "";
        updateFileContent(activeFile, current + "\n\n" + res.response);
      }
    } catch (e) {
      alert("AI Error: " + e);
    } finally {
      setAiLoading(false);
      setAiPrompt("");
      setShowAiBar(false);
    }
  };

  if (!activeFile || !currentFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d0f14] text-slate-600">
        <Code2 size={48} className="mb-4 opacity-30" />
        <p className="text-[14px] font-medium mb-1">No file open</p>
        <p className="text-[12px]">Open a file from the sidebar or create a new one</p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-[11px]">
          {["Ctrl+S", "Ctrl+`"].map((k) => (
            <div key={k} className="flex items-center gap-2 text-slate-600">
              <kbd className="px-2 py-1 bg-[#1a1e2a] border border-[#252a3a] rounded text-[10px]">{k}</kbd>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#0d0f14]">
      {/* Tab bar */}
      <div className="flex items-center gap-0 bg-[#13161e] border-b border-[#1f2333] overflow-x-auto flex-shrink-0">
        {openFiles.map((f) => (
          <div
            key={f.path}
            onClick={() => setActiveFile(f.path)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 border-r border-[#1f2333] cursor-pointer group transition-colors text-[12px] flex-shrink-0",
              activeFile === f.path
                ? "bg-[#0d0f14] text-white border-t border-t-blue-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1e2a]"
            )}
          >
            <span className="max-w-[120px] truncate">{f.path.split("/").pop()}</span>
            {f.dirty && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
            <button
              onClick={(e) => { e.stopPropagation(); closeFile(f.path); }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all ml-1"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        <div className="flex-1" />

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-2">
          <button
            onClick={() => setShowAiBar((v) => !v)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-colors"
          >
            <Wand2 size={12} />
            <span>AI Generate</span>
          </button>
          {currentFile?.dirty && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
            >
              <Save size={12} />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Generate bar */}
      {showAiBar && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#13161e] border-b border-[#1f2333] panel-fade">
          <Wand2 size={14} className="text-purple-400 flex-shrink-0" />
          <input
            autoFocus
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAiGenerate(); if (e.key === "Escape") setShowAiBar(false); }}
            placeholder="Describe what code to generate and insert..."
            className="flex-1 bg-transparent text-[13px] text-white placeholder-slate-600 outline-none"
          />
          <button
            onClick={handleAiGenerate}
            disabled={aiLoading}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-[12px] text-white font-medium transition-colors"
          >
            {aiLoading ? "Generating..." : "Generate"}
          </button>
          <button onClick={() => setShowAiBar(false)} className="text-slate-500 hover:text-slate-300">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language={getLanguage(activeFile)}
          value={currentFile.content}
          onChange={(value) => updateFileContent(activeFile, value || "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            glyphMargin: false,
            folding: true,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 16, bottom: 16 },
            cursorBlinking: "smooth",
            smoothScrolling: true,
            renderLineHighlight: "line",
            suggest: { showKeywords: true },
          }}
          onMount={(editor, monaco) => {
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
              handleSave();
            });
          }}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-1 bg-[#13161e] border-t border-[#1f2333] text-[11px] text-slate-500">
        <span>{getLanguage(activeFile)}</span>
        <span>{currentFile.content.split("\n").length} lines</span>
        <span>{currentFile.content.length} chars</span>
        {currentFile.dirty && <span className="text-blue-400">● Modified</span>}
      </div>
    </div>
  );
}
