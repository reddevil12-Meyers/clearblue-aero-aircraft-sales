import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Plane, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const AGENT_NAME = "aircraft_knowledge";

const SUGGESTIONS = [
  "1967 Piper PA-28-180",
  "Cessna 182Q – brief me for a time-builder call",
  "Common issues on Beechcraft Baron 58",
  "Key talking points for a first-time complex airplane buyer looking at a Cessna 210",
];

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "order-2" : ""}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground">Aircraft Knowledge Assistant</span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border border-border text-card-foreground rounded-bl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-li:my-0.5 prose-p:my-1.5 prose-strong:text-foreground [&_h1]:text-[0.94rem] [&_h2]:text-[0.84rem] [&_h3]:text-[0.75rem] [&_h4]:text-[0.66rem] [&_h5]:text-[0.66rem] [&_h6]:text-[0.66rem] [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:mt-3 [&_h2]:mb-1 [&_table]:w-full [&_table]:my-2 [&_table]:border-collapse [&_table]:text-[0.8rem] [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold [&_th]:px-2.5 [&_th]:py-1 [&_th]:border [&_th]:border-border [&_td]:px-2.5 [&_td]:py-1 [&_td]:border [&_td]:border-border [&_td]:align-top [&_tr]:last:[&_tr]:border-0">
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
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: "Aircraft Knowledge Assistant" },
        });
        setConversation(conv);
        setMessages(conv.messages || []);
        unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
          setMessages(data.messages || []);
        });
      } catch (e) {
        console.error("Failed to start conversation:", e);
      } finally {
        setLoading(false);
      }
    })();
    return () => unsub();
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-4 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Plane className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Aircraft Knowledge Assistant</h1>
            <p className="text-sm text-muted-foreground">Quick, sales-ready info on makes &amp; models — specs, strengths, issues, talking points.</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Starting conversation…
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="max-w-2xl mx-auto text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Ask about any aircraft</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Get a quick overview, key specs, strengths, common issues, and sales talking points.
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-left text-sm px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors text-foreground"
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
                <div className="rounded-2xl px-4 py-3 bg-card border border-border rounded-bl-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-card px-4 lg:px-8 py-4">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about an aircraft make/model, specs, issues, or talking points…"
            className="resize-none min-h-[44px] max-h-40 text-sm"
            rows={1}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending || !conversation}
            className="h-11 px-4"
          >
            <Send className="w-4 h-4 mr-1.5" /> Send
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          The assistant can be uncertain on exact ADs, service bulletins, or market values — always verify airworthiness and numbers against FAA TCDS, manufacturer data, and logbooks.
        </p>
      </div>
    </div>
  );
}