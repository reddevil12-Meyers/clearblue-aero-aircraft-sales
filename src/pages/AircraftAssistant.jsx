import { useState, useEffect, useRef } from "react";
import { supabase } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAssistantPdf } from "@/utils/generateAssistantPdf";

const LOGO_URL = "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/1c49af472_logo-01.png";
const WATERMARK_URL = "https://media.base44.com/images/public/69c80400f629e8d863dc8b6c/ced38d2ea_cd-fav.png";

const PROSE_CLASS = "prose prose-invert prose-sm max-w-none prose-headings:font-semibold prose-headings:text-slate-100 prose-li:my-0.5 prose-p:my-1.5 prose-strong:text-white [&_p]:my-1.5 [&_h1]:text-[0.94rem] [&_h2]:text-[0.84rem] [&_h3]:text-[0.75rem] [&_h4]:text-[0.66rem] [&_h5]:text-[0.66rem] [&_h6]:text-[0.66rem] [&_h1]:text-slate-50 [&_h2]:text-slate-50 [&_h3]:text-slate-100 [&_h4]:text-slate-100 [&_h5]:text-slate-200 [&_h6]:text-slate-200 [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:mt-3 [&_h2]:mb-1 [&_ul]:list-none [&_ul]:pl-0 [&_ul]:my-2 [&_ul]:space-y-1.5 [&_li]:relative [&_li]:pl-4 [&_li]:leading-snug [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.6em] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-sky-400 [&_strong]:text-white [&_a]:text-sky-400";

export default function AircraftAssistant() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const isAdmin = userProfile?.role === "admin";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateAssistantPdf([]);
    } catch (e) {
      console.error("PDF download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  const handleGenerateBriefings = () => {
    toast({ title: "Coming soon", description: "Inventory briefing generation will be available shortly." });
  };

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
            <p className="text-xs text-slate-400 truncate">Sales-ready info on makes &amp; models: specs, strengths, issues, talking points.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <button
                type="button"
                onClick={handleGenerateBriefings}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 shadow-sm hover:bg-white/10 hover:text-white transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Inventory Briefings</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 shadow-sm hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Coming Soon Body */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center bg-black rounded-2xl p-6 ring-1 ring-white/10 mb-6">
            <img src={LOGO_URL} alt="ClearBlue Aero" className="h-20 w-auto brightness-[500%] contrast-125 saturate-0" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Aircraft Assistant</h2>
          <p className="text-slate-400 text-sm mb-6">
            The AI aircraft knowledge assistant is coming soon. Ask about any make or model to get specs,
            strengths, common issues, and sales talking points.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-sm">
            <Sparkles className="w-4 h-4" />
            Coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
