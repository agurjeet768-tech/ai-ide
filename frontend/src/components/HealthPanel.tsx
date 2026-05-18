"use client";

import { useIDEStore } from "@/lib/store";
import { api } from "@/lib/api";
import { useState } from "react";
import { Activity, RefreshCw, Server, Cpu, CheckCircle, XCircle, Clock, Database, Wifi } from "lucide-react";
import clsx from "clsx";

export function HealthPanel() {
  const { backendHealth, hfHealth, setBackendHealth, setHfHealth } = useIDEStore();
  const [loading, setLoading] = useState(false);
  const [hfLoading, setHfLoading] = useState(false);

  const checkBackend = async () => {
    setLoading(true);
    try {
      const h = await api.health();
      setBackendHealth(h);
    } catch (e) {
      setBackendHealth({ status: "unreachable", error: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const checkHF = async () => {
    setHfLoading(true);
    try {
      const h = await api.hfHealth();
      setHfHealth(h);
    } catch (e) {
      setHfHealth({ error: String(e) });
    } finally {
      setHfLoading(false);
    }
  };

  const StatusIcon = ({ ok }: { ok: boolean }) =>
    ok ? <CheckCircle size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />;

  const StatCard = ({ icon: Icon, label, value, color = "blue" }: any) => (
    <div className="bg-[#1a1e2a] border border-[#252a3a] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={`text-${color}-400`} />
        <span className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-[15px] font-semibold text-white truncate">{value ?? "—"}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#0d0f14] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#13161e] border-b border-[#1f2333] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" />
          <span className="text-[13px] font-semibold text-white">System Health</span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Backend Health */}
        <div className="bg-[#13161e] border border-[#1f2333] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2333]">
            <div className="flex items-center gap-2">
              <Server size={14} className="text-blue-400" />
              <span className="text-[12px] font-semibold text-white">Backend (HF Space)</span>
              {backendHealth && (
                <span className={clsx(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium",
                  backendHealth.status === "healthy"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}>
                  {backendHealth.status}
                </span>
              )}
            </div>
            <button
              onClick={checkBackend}
              disabled={loading}
              className={clsx("flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1e2a] border border-[#252a3a] rounded text-[11px] text-slate-300 hover:border-blue-500/50 transition-colors", loading && "opacity-50")}
            >
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {backendHealth ? (
            <div className="p-4">
              {backendHealth.error ? (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[12px] text-red-400">
                  <XCircle size={14} />
                  Backend unreachable: {backendHealth.error}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={Wifi} label="Status" value={backendHealth.status} color="green" />
                  <StatCard icon={Database} label="Models" value={backendHealth.models_available} color="blue" />
                  <StatCard icon={Clock} label="Logs Stored" value={backendHealth.log_count} color="purple" />
                  <StatCard icon={Cpu} label="HF Key" value={backendHealth.hf_key_set ? "✓ Set" : "✗ Missing"} color={backendHealth.hf_key_set ? "green" : "red"} />
                </div>
              )}
              <div className="mt-3 px-3 py-2 bg-[#1a1e2a] rounded text-[11px] text-slate-500 font-mono truncate">
                {api.base}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-[12px] text-slate-500">Click Refresh to check backend status</p>
            </div>
          )}
        </div>

        {/* HuggingFace Models Health */}
        <div className="bg-[#13161e] border border-[#1f2333] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2333]">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-orange-400" />
              <span className="text-[12px] font-semibold text-white">HuggingFace Models</span>
            </div>
            <button
              onClick={checkHF}
              disabled={hfLoading}
              className={clsx("flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1e2a] border border-[#252a3a] rounded text-[11px] text-slate-300 hover:border-orange-500/50 transition-colors", hfLoading && "opacity-50")}
            >
              <RefreshCw size={11} className={hfLoading ? "animate-spin" : ""} />
              Check
            </button>
          </div>

          {hfHealth ? (
            <div className="p-4 space-y-2">
              {hfHealth.error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[12px] text-red-400">
                  <XCircle size={14} /> {hfHealth.error}
                </div>
              )}
              {hfHealth.models && Object.entries(hfHealth.models).map(([key, m]: any) => (
                <div key={key} className="flex items-center gap-3 p-3 bg-[#1a1e2a] border border-[#252a3a] rounded-lg">
                  <StatusIcon ok={m.status === "online" || m.status === "loading"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-white">{m.model || key}</p>
                    <p className={clsx(
                      "text-[11px]",
                      m.status === "online" ? "text-green-400" :
                      m.status === "loading" ? "text-yellow-400" :
                      "text-red-400"
                    )}>
                      {m.status} {m.http_code && `· HTTP ${m.http_code}`}
                    </p>
                  </div>
                </div>
              ))}
              {hfHealth.timestamp && (
                <p className="text-[10px] text-slate-600 mt-2">
                  Checked at {new Date(hfHealth.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-[12px] text-slate-500 mb-1">Check HuggingFace model availability</p>
              <p className="text-[11px] text-slate-600">This pings the first 3 models to verify they're responsive</p>
            </div>
          )}
        </div>

        {/* Project info */}
        <div className="bg-[#13161e] border border-[#1f2333] rounded-xl p-4">
          <h3 className="text-[12px] font-semibold text-white mb-3">Project Info</h3>
          <div className="space-y-2 text-[12px]">
            {[
              { label: "Frontend", value: "Next.js 14 → Vercel" },
              { label: "Backend", value: "FastAPI → HF Space" },
              { label: "Editor", value: "Monaco (VS Code engine)" },
              { label: "AI", value: "HuggingFace Inference API" },
              { label: "Free Models", value: "DeepSeek, Mistral, Phi-3..." },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-300">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
