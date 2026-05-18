"use client";

import { useState } from "react";
import { useIDEStore } from "@/lib/store";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { EditorPanel } from "./EditorPanel";
import { ChatPanel } from "./ChatPanel";
import { LogsPanel } from "./LogsPanel";
import { HealthPanel } from "./HealthPanel";
import { FileManagerPanel } from "./FileManagerPanel";

export function IDELayout() {
  const { activePanel } = useIDEStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-[#0d0f14] overflow-hidden">
      <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && <Sidebar />}

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor always visible */}
          <div
            className={`flex-1 overflow-hidden ${activePanel !== "editor" ? "hidden lg:flex lg:flex-col" : "flex flex-col"}`}
          >
            <EditorPanel />
          </div>

          {/* Right Panel */}
          {activePanel !== "editor" && (
            <div className="flex-1 overflow-hidden border-l border-[#1f2333] flex flex-col panel-fade">
              {activePanel === "chat" && <ChatPanel />}
              {activePanel === "files" && <FileManagerPanel />}
              {activePanel === "logs" && <LogsPanel />}
              {activePanel === "health" && <HealthPanel />}
            </div>
          )}

          {/* Side panel on large screens */}
          {activePanel !== "editor" && (
            <div className="hidden lg:flex flex-col w-[420px] border-l border-[#1f2333] overflow-hidden flex-shrink-0">
              {activePanel === "chat" && <ChatPanel />}
              {activePanel === "files" && <FileManagerPanel />}
              {activePanel === "logs" && <LogsPanel />}
              {activePanel === "health" && <HealthPanel />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
