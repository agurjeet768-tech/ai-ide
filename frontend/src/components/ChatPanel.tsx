"use client";

import { useIDEStore } from "@/lib/store";
import { api } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, Copy, Check, Code, Wand2, Bug, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  elapsed?: number;
  loading?: boolean;
};

const QUICK_PROMPTS = [
  { icon: Code, label: "Explain code", prompt: "Explain this code step by step:" },
  { icon: Bug, label: "Fix bug", prompt: "Find and fix bugs in this code:" },
  { icon: Wand2, label: "Refactor", prompt: "Refactor this code for better readability:" },
  { icon: RefreshCw, label: "Convert", prompt: "Convert this to TypeScript:" },
];

export function ChatPanel() {
  const { selectedModel } = useIDEStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `👋 Hi! I'm your AI coding assistant powered by **${selectedModel}** on HuggingFace.\n\nI can help you:\n- 🔧 Write and debug code\n- 📖 Explain concepts\n- 🔄 Refactor your code\n- 💡 Answer programming questions\n\nWhat are you working on?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg };
    const loadingMsg: Message = { id: "loading", role: "assistant", content: "", loading: true };
    setMessages((m) => [...m, userMsg, loadingMsg]);
    setLoading(true);

    try {
      const history = messages.filter((m) => m.role !== "assistant" || !m.loading)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await api.chat(msg, selectedModel, history);
      const assistantMsg: Message = {
        id: Date.now().toString() + "a",
        role: "assistant",
        content: res.response || "No response",
        model: res.model_name,
        elapsed: res.elapsed,
      };
      setMessages((m) => [...m.filter((x) => x.id !== "loading"), assistantMsg]);
    } catch (e: any) {
      setMessages((m) => [
        ...m.filter((x) => x.id !== "loading"),
        {
          id: "err",
          role: "assistant",
          content: `❌ Error: ${e.message}\n\nMake sure your backend is running and HF API key is set.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyMsg = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Chat cleared. How can I help you?",
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0f14]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#13161e] border-b border-[#1f2333] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-purple-400" />
          <span className="text-[13px] font-semibold text-white">AI Chat</span>
          <span className="text-[11px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
            {selectedModel}
          </span>
        </div>
        <button onClick={clearChat} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" title="Clear chat">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 px-4 py-2 bg-[#13161e] border-b border-[#1f2333] overflow-x-auto flex-shrink-0">
        {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            onClick={() => send(prompt)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1e2a] border border-[#252a3a] rounded-full text-[11px] text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors flex-shrink-0"
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={clsx("flex gap-3 group", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            {/* Avatar */}
            <div className={clsx(
              "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
              msg.role === "user" ? "bg-blue-500/20" : "bg-purple-500/20"
            )}>
              {msg.role === "user" ? <User size={13} className="text-blue-400" /> : <Bot size={13} className="text-purple-400" />}
            </div>

            {/* Bubble */}
            <div className={clsx(
              "flex-1 max-w-[85%] rounded-2xl px-4 py-3 text-[13px] relative",
              msg.role === "user"
                ? "bg-blue-500/10 border border-blue-500/20 text-slate-200 ml-auto"
                : "bg-[#1a1e2a] border border-[#252a3a] text-slate-200"
            )}>
              {msg.loading ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-purple-400"
                        style={{ animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                  <span className="text-[12px]">Thinking...</span>
                </div>
              ) : (
                <div className="chat-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              )}

              {/* Meta */}
              {msg.role === "assistant" && !msg.loading && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#252a3a]">
                  <div className="flex items-center gap-2">
                    {msg.model && <span className="text-[10px] text-slate-600">{msg.model}</span>}
                    {msg.elapsed && <span className="text-[10px] text-slate-600">{msg.elapsed}s</span>}
                  </div>
                  <button
                    onClick={() => copyMsg(msg.id, msg.content)}
                    className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {copied === msg.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                    {copied === msg.id ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-[#13161e] border-t border-[#1f2333] flex-shrink-0">
        <div className="flex gap-2 bg-[#1a1e2a] border border-[#252a3a] rounded-xl p-2 focus-within:border-blue-500/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask AI anything... (Enter to send, Shift+Enter for newline)"
            rows={2}
            className="flex-1 bg-transparent text-[13px] text-white placeholder-slate-600 outline-none resize-none leading-relaxed"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="self-end p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex-shrink-0"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 text-center">
          Powered by HuggingFace • Free & Unlimited
        </p>
      </div>
    </div>
  );
}
