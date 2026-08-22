import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, Loader2, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateAssistantPdf } from "@/utils/generateAssistantPdf";

const AGENT_NAME = "aircraft_knowledge";

const LOGO_URL = "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png";
const WATERMARK_URL = "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/ced38d2ea_cd-fav.png";

const SUGGESTIONS = [
  "1967 Piper PA-28-180",
  "Cessna 182Q – brief me for a time-builder call",
  "Common issues on Beechcraft Baron 58",
  "Key talking points for a first-time complex airplane buyer looking at a Cessna 210",
];

const PROSE_CLASS = "prose prose-invert prose-sm max-w-none prose-headings:font-semibold prose-headings:text-slate-100 prose-li:my-0.5 prose-p:my-1.5 prose-strong:text-white [&_p]:my-1.5 [&_h1]:text-[0.94rem] [&_h2]:text-[0.84rem] [&_h3]:text-[0.75rem] [&_h4]:text-[0.66rem] [&_h5]:text-[0.66rem] [&_h6]:text-[0.66rem] [&_h1]:text-slate-50 [&_h2]:text-slate-50 [&_h3]:text-slate-100 [&_h4]:text-slate-100 [&_h5]:text-slate-200 [&_h6]:text-slate-200 [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:mt-3 [&_h2]:mb-1 [&_ul]:list-none [&_ul]:pl-0 [&_ul]:my-2 [&_ul]:space-y-1.5 [&_li]:relative [&_li]:pl-4 [&_li]:leading-snug [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.6em] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-sky-400 [&_strong]:text-white [&_a]:text-sky-400";

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "order-2" : ""}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-semibold text-slate-400">Aircraft Knowledge Assistant</span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm shadow-lg shadow-primary/20"
              : "bg-white/5 border border-white/10 text-slate-100 rounded-bl-sm backdrop-blur-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className={PROSE_CLASS}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || ""}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AircraftAssistant() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const hasResponses = messages.some(m => m.role === "assistant" && m.content && m.content.trim());

  const handleDownload = async () => {
    if (!hasResponses || downloading) return;
    setDownloading(true);
    try {
      await generateAssistantPdf(messages);
    } catch (e) {
      console.error("PDF download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  const unsubRef = useRef(() => {});

  const startConversation = async () => {
    try {
      unsubRef.current?.();
      setLoading(true);
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: "Aircraft Knowledge Assistant" },
      });
      setConversation(conv);
      setMessages(conv.messages || []);
      unsubRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
      });
    } catch (e) {
      console.error("Failed to start conversation:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startConversation();
    return () => unsubRef.current?.();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text) => {
    const content = (text ?? input).trim();
    if (!content || !conversation || sending) return;
    setInput("");
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content });
    } catch (e) {
      console.error("Send failed:", e);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastIsAssistant = messages.length > 0 && messages[messages.length - 1].role === "assistant";

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-[#070b14] text-slate-100">
      {/* Watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <img src={WATERMARK_URL} alt="" className="w-[58%] max-w-[680px] opacity-[0.08] select-none" />
      </div>

      {/* Header */}
      <div className="relative z-10 shrink-0 border-b border-white/10 bg-black/30 backdrop-blur px-4 lg:px-8 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-11 px-2 shrink-0 rounded-xl bg-black ring-1 ring-white/10 overflow-hidden">
            <img src={WATERMARK_URL} alt="ClearBlue Aero" className="h-10 w-auto brightness-[500%] contrast-125 saturate-0" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-white truncate">Aircraft Knowledge Assistant</h1>
            <p className="text-xs text-slate-400 truncate">Sales-ready info on makes &amp; models — specs, strengths, issues, talking points.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!hasResponses || downloading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 shadow-sm hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              type="button"
              onClick={startConversation}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 shadow-sm hover:bg-white/10 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Starting conversation…
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="max-w-2xl mx-auto text-center py-10">
                <div className="inline-flex items-center justify-center bg-black rounded-2xl p-4 ring-1 ring-white/10 mb-5">
                  <img src={LOGO_URL} alt="ClearBlue Aero" className="h-20 w-auto brightness-[500%] contrast-125 saturate-0" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-1.5">Ask about any aircraft</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Get a quick overview, key specs, strengths, common issues, and sales talking points.
                </p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-left text-sm px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:border-sky-400/50 hover:bg-sky-400/10 hover:text-white transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}

            {sending && !lastIsAssistant && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-white/5 border border-white/10 rounded-bl-sm backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="relative z-10 shrink-0 border-t border-white/10 bg-black/40 backdrop-blur px-4 lg:px-8 py-4">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about an aircraft make/model, specs, issues, or talking points…"
            className="resize-none min-h-[44px] max-h-40 text-sm bg-white/5 border-white/10 text-white placeholder:text-white"
            rows={1}
          />
          <Button
            onClick={() => handleSend()}
            className="h-11 px-4 bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/30"
          >
            <Send className="w-4 h-4 mr-1.5" /> Send
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          The assistant can be uncertain on exact ADs, service bulletins, or market values — always verify airworthiness and numbers against FAA TCDS, manufacturer data, and logbooks.
        </p>
      </div>
    </div>
  );
}