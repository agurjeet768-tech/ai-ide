"use client";

import { useIDEStore } from "@/lib/store";
import { api } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { Terminal, Trash2, Copy, Check, Filter, RefreshCw, Download } from "lucide-react";
import clsx from "clsx";
import { format } from "date-fns";

const LEVELS = ["ALL", "INFO", "WARN", "ERROR", "DEBUG"];

const levelStyle: Record<string, string> = {
  INFO: "text-slate-400",
  WARN: "text-yellow-400",
  ERROR: "text-red-400",
  DEBUG: "text-purple-400",
};

const levelBg: Record<string, string> = {
  INFO: "bg-slate-500/10 border-slate-500/20 text-slate-400",
  WARN: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  ERROR: "bg-red-500/10 border-red-500/20 text-red-400",
  DEBUG: "bg-purple-500/10 border-purple-500/20 text-purple-400",
};

const sourceColor: Record<string, string> = {
  chat: "text-blue-400",
  hf: "text-orange-400",
  files: "text-green-400",
  system: "text-cyan-400",
  ws: "text-purple-400",
  api: "text-pink-400",
  codegen: "text-indigo-400",
};

export function LogsPanel() {
  const { logs, addLog, setLogs, clearLogs, logFilter, setLogFilter } = useIDEStore();
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logFilter === "ALL" ? logs : logs.filter((l) => l.level === logFilter);

  const copyAll = async () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.source}] ${l.message}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = async () => {
    clearLogs();
    try { await api.clearLogs(); } catch {}
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const { logs } = await api.getLogs(200);
      setLogs(logs);
    } catch {}
    setLoading(false);
  };

  const downloadLogs = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.level}] [${l.source}] ${l.message}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-ide-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  const formatTime = (ts: string) => {
    try { return format(new Date(ts), "HH:mm:ss.SSS"); }
    catch { return ts; }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0f14]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#13161e] border-b border-[#1f2333] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-green-400" />
          <span className="text-[13px] font-semibold text-white">Logs Terminal</span>
          <span className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
            {filteredLogs.length} entries
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={refresh} className={clsx("p-1.5 text-slate-500 hover:text-slate-300 transition-colors", loading && "animate-spin")}>
            <RefreshCw size={14} />
          </button>
          <button onClick={copyAll} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors" title="Copy all logs">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
          <button onClick={downloadLogs} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors" title="Download logs">
            <Download size={14} />
          </button>
          <button onClick={handleClear} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" title="Clear logs">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#13161e] border-b border-[#1f2333] overflow-x-auto flex-shrink-0">
        <Filter size={12} className="text-slate-500 flex-shrink-0" />
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => setLogFilter(level)}
            className={clsx(
              "px-2.5 py-1 rounded text-[11px] font-medium flex-shrink-0 transition-colors border",
              logFilter === level
                ? level === "ALL" ? "bg-slate-500/20 border-slate-500/40 text-slate-300" : levelBg[level]
                : "border-transparent text-slate-600 hover:text-slate-400"
            )}
          >
            {level}
          </button>
        ))}
        <div className="flex-1" />
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="w-3 h-3"
          />
          Auto-scroll
        </label>
      </div>

      {/* Log entries */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto font-mono text-[12px] px-2 py-2 space-y-0.5"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600">
            <Terminal size={32} className="mb-3 opacity-30" />
            <p className="text-[13px]">No logs yet</p>
            <p className="text-[11px] mt-1">Logs appear here as you use the IDE</p>
          </div>
        ) : (
          filteredLogs.map((log, i) => (
            <div
              key={log.id || i}
              className="flex items-start gap-2 px-2 py-1 rounded hover:bg-[#1a1e2a] group transition-colors"
            >
              <span className="text-slate-600 flex-shrink-0 tabular-nums">
                {formatTime(log.timestamp)}
              </span>
              <span className={clsx("flex-shrink-0 w-[42px] text-center text-[10px] font-semibold", levelStyle[log.level] || "text-slate-400")}>
                {log.level}
              </span>
              <span className={clsx("flex-shrink-0 w-16 text-[11px]", sourceColor[log.source] || "text-slate-500")}>
                [{log.source}]
              </span>
              <span className="text-slate-300 flex-1 break-all leading-relaxed">{log.message}</span>
              <button
                onClick={() => navigator.clipboard.writeText(log.message)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-400 flex-shrink-0 transition-all"
              >
                <Copy size={10} />
              </button>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 px-4 py-2 bg-[#13161e] border-t border-[#1f2333] text-[11px] text-slate-600 flex-shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 status-online" />
          <span>Live</span>
        </div>
        <span>Total: {logs.length}</span>
        <span>Errors: {logs.filter((l) => l.level === "ERROR").length}</span>
        <span>Warnings: {logs.filter((l) => l.level === "WARN").length}</span>
      </div>
    </div>
  );
}
