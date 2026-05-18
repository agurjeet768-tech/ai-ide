"use client";

import { useIDEStore } from "@/lib/store";
import { api } from "@/lib/api";
import { File, Folder, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export function Sidebar() {
  const { files, setFiles, openFile, activeFile, setActiveFile, openFiles, closeFile } = useIDEStore();
  const [newFile, setNewFile] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const { files } = await api.listFiles();
      setFiles(files);
    } finally {
      setLoading(false);
    }
  };

  const openFileHandler = async (path: string) => {
    try {
      const { content } = await api.readFile(path);
      openFile(path, content);
    } catch (e) {
      alert("Error opening file: " + e);
    }
  };

  const createFile = async () => {
    if (!newFile.trim()) return;
    try {
      await api.createFile(newFile.trim());
      await refresh();
      setNewFile("");
      setCreating(false);
      openFile(newFile.trim(), "");
    } catch (e) {
      alert("Error creating file: " + e);
    }
  };

  const deleteFile = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete ${path}?`)) return;
    try {
      await api.deleteFile(path);
      closeFile(path);
      await refresh();
    } catch (e) {
      alert("Error: " + e);
    }
  };

  const ext = (name: string) => name.split(".").pop() || "";
  const extColor = (name: string) => {
    const e = ext(name);
    const colors: Record<string, string> = {
      py: "text-yellow-400", js: "text-yellow-300", ts: "text-blue-400",
      tsx: "text-blue-300", jsx: "text-blue-300", json: "text-orange-400",
      md: "text-slate-300", css: "text-pink-400", html: "text-orange-300",
      txt: "text-slate-400", sh: "text-green-400",
    };
    return colors[e] || "text-slate-400";
  };

  return (
    <div className="w-52 flex-shrink-0 bg-[#13161e] border-r border-[#1f2333] flex flex-col">
      {/* Open tabs */}
      {openFiles.length > 0 && (
        <div className="border-b border-[#1f2333]">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Open</div>
          {openFiles.map((f) => (
            <div
              key={f.path}
              onClick={() => setActiveFile(f.path)}
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 cursor-pointer group hover:bg-[#1a1e2a] transition-colors",
                activeFile === f.path && "bg-[#1a1e2a] border-l-2 border-l-blue-500"
              )}
            >
              <File size={11} className={extColor(f.path)} />
              <span className="text-[11px] text-slate-300 truncate flex-1">{f.path.split("/").pop()}</span>
              {f.dirty && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
              <button
                onClick={(e) => { e.stopPropagation(); closeFile(f.path); }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File explorer */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Explorer</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setCreating(true)} className="p-1 text-slate-500 hover:text-slate-300 transition-colors" title="New file">
            <Plus size={12} />
          </button>
          <button onClick={refresh} className={clsx("p-1 text-slate-500 hover:text-slate-300 transition-colors", loading && "animate-spin")}>
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {creating && (
        <div className="px-3 pb-2">
          <input
            autoFocus
            value={newFile}
            onChange={(e) => setNewFile(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") createFile(); if (e.key === "Escape") setCreating(false); }}
            placeholder="filename.py"
            className="w-full bg-[#0d0f14] border border-blue-500/50 rounded px-2 py-1 text-[12px] text-white outline-none"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <File size={24} className="text-slate-600 mx-auto mb-2" />
            <p className="text-[11px] text-slate-500">No files yet</p>
            <button onClick={() => setCreating(true)} className="text-[11px] text-blue-400 hover:text-blue-300 mt-1">
              Create one
            </button>
          </div>
        ) : (
          files.map((f) => (
            <div
              key={f.path}
              onClick={() => f.type === "file" && openFileHandler(f.path)}
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 cursor-pointer group hover:bg-[#1a1e2a] transition-colors",
                activeFile === f.path && "bg-[#1a1e2a]"
              )}
            >
              {f.type === "directory" ? (
                <Folder size={12} className="text-blue-400 flex-shrink-0" />
              ) : (
                <File size={12} className={clsx(extColor(f.name), "flex-shrink-0")} />
              )}
              <span className="text-[12px] text-slate-300 truncate flex-1">{f.name}</span>
              {f.type === "file" && (
                <button
                  onClick={(e) => deleteFile(f.path, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
