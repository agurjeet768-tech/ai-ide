"use client";

import { useIDEStore } from "@/lib/store";
import { api } from "@/lib/api";
import { useState } from "react";
import { FolderOpen, File, Plus, Trash2, RefreshCw, Edit3, Save, X, Download } from "lucide-react";
import clsx from "clsx";

export function FileManagerPanel() {
  const { files, setFiles, openFile, setActivePanel } = useIDEStore();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
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

  const createFile = async () => {
    if (!newName.trim()) return;
    await api.createFile(newName.trim(), "");
    setNewName("");
    setCreating(false);
    await refresh();
  };

  const deleteFile = async (path: string) => {
    if (!confirm(`Delete "${path}"?`)) return;
    await api.deleteFile(path);
    await refresh();
  };

  const startEdit = async (path: string) => {
    try {
      const { content } = await api.readFile(path);
      setEditContent(content);
      setEditingPath(path);
    } catch (e) {
      alert("Cannot read file: " + e);
    }
  };

  const saveEdit = async () => {
    if (!editingPath) return;
    await api.saveFile(editingPath, editContent);
    setEditingPath(null);
  };

  const openInEditor = async (path: string, type: string) => {
    if (type === "directory") return;
    try {
      const { content } = await api.readFile(path);
      openFile(path, content);
      setActivePanel("editor");
    } catch {}
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  if (editingPath) {
    return (
      <div className="flex flex-col h-full bg-[#0d0f14]">
        <div className="flex items-center justify-between px-4 py-3 bg-[#13161e] border-b border-[#1f2333]">
          <div className="flex items-center gap-2">
            <Edit3 size={14} className="text-blue-400" />
            <span className="text-[12px] font-semibold text-white">{editingPath}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded text-[12px] text-white transition-colors">
              <Save size={12} /> Save
            </button>
            <button onClick={() => setEditingPath(null)} className="p-1.5 text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          </div>
        </div>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="flex-1 bg-[#0d0f14] text-slate-200 font-mono text-[13px] p-4 outline-none resize-none border-0"
          spellCheck={false}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0f14]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#13161e] border-b border-[#1f2333] flex-shrink-0">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-yellow-400" />
          <span className="text-[13px] font-semibold text-white">File Manager</span>
          <span className="text-[11px] px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20">
            {files.length} files
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCreating(true)} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-[11px] text-blue-400 hover:bg-blue-500/20 transition-colors">
            <Plus size={12} /> New
          </button>
          <button onClick={refresh} className={clsx("p-1.5 text-slate-500 hover:text-slate-300 transition-colors", loading && "animate-spin")}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {creating && (
        <div className="flex items-center gap-2 px-4 py-3 bg-[#13161e] border-b border-[#1f2333]">
          <File size={13} className="text-blue-400" />
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") createFile(); if (e.key === "Escape") setCreating(false); }}
            placeholder="filename.py"
            className="flex-1 bg-[#0d0f14] border border-blue-500/50 rounded px-3 py-1.5 text-[13px] text-white outline-none"
          />
          <button onClick={createFile} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded text-[12px] text-white">Create</button>
          <button onClick={() => setCreating(false)} className="text-slate-500 hover:text-slate-300"><X size={14} /></button>
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600">
            <FolderOpen size={40} className="mb-4 opacity-30" />
            <p className="text-[13px] mb-1">Workspace is empty</p>
            <button onClick={() => setCreating(true)} className="text-[12px] text-blue-400 hover:text-blue-300">
              Create your first file
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-slate-600 uppercase tracking-wider bg-[#13161e] border-b border-[#1f2333]">
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-right px-4 py-2 font-medium hidden sm:table-cell">Size</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.path} className="border-b border-[#1f2333]/50 hover:bg-[#1a1e2a] group transition-colors">
                  <td
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => openInEditor(f.path, f.type)}
                  >
                    <div className="flex items-center gap-2">
                      {f.type === "directory" ? (
                        <FolderOpen size={14} className="text-blue-400 flex-shrink-0" />
                      ) : (
                        <File size={14} className="text-slate-400 flex-shrink-0" />
                      )}
                      <span className="text-[13px] text-slate-200 group-hover:text-white transition-colors">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-[11px] text-slate-600 hidden sm:table-cell">
                    {f.type === "file" ? formatSize(f.size) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      {f.type === "file" && (
                        <button onClick={() => openInEditor(f.path, f.type)} className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors" title="Open in editor">
                          <Edit3 size={12} />
                        </button>
                      )}
                      <button onClick={() => deleteFile(f.path)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-[#13161e] border-t border-[#1f2333] text-[11px] text-slate-600">
        /workspace — {files.filter((f) => f.type === "file").length} files, {files.filter((f) => f.type === "directory").length} folders
      </div>
    </div>
  );
}
