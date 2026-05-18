"use client";

import { useEffect } from "react";
import { IDELayout } from "@/components/IDELayout";
import { useIDEStore } from "@/lib/store";
import { api } from "@/lib/api";

export default function Home() {
  const { setBackendHealth, setHfHealth, setFiles, addLog, setLogs } = useIDEStore();

  useEffect(() => {
    // Initial health check
    const checkHealth = async () => {
      try {
        const h = await api.health();
        setBackendHealth(h);
      } catch (e) {
        setBackendHealth({ status: "unreachable", error: String(e) });
      }
    };

    // Load files
    const loadFiles = async () => {
      try {
        const { files } = await api.listFiles();
        setFiles(files);
      } catch (e) {
        console.warn("Could not load files:", e);
      }
    };

    // Load initial logs
    const loadLogs = async () => {
      try {
        const { logs } = await api.getLogs(100);
        setLogs(logs);
      } catch (e) {
        console.warn("Could not load logs:", e);
      }
    };

    checkHealth();
    loadFiles();
    loadLogs();

    // WebSocket for live logs
    let ws: WebSocket | null = null;
    try {
      ws = api.connectLogs(
        (log) => addLog(log),
        (logs) => setLogs(logs)
      );
    } catch (e) {
      // Fallback to polling
      const poll = setInterval(async () => {
        try {
          const { logs } = await api.getLogs(100);
          setLogs(logs);
        } catch {}
      }, 3000);
      return () => clearInterval(poll);
    }

    // Health polling every 30s
    const healthPoll = setInterval(checkHealth, 30000);

    return () => {
      ws?.close();
      clearInterval(healthPoll);
    };
  }, []);

  return <IDELayout />;
}
