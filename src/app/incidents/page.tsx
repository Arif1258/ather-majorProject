import { GlassCard } from "@/components/ui/GlassCard";
import { AlertCircle, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function IncidentsPage() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-1000">
      <div>
        <h1 className="text-4xl font-light tracking-tight text-white mb-2">Incident <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-cyan">Lifecycle</span></h1>
        <p className="text-white/50 text-sm tracking-widest">TRANSPARENT RESOLUTION TRACKING</p>
      </div>

      <div className="space-y-6 max-w-4xl">
        <GlassCard glowColor="purple" className="relative group border-l-4 !border-l-brand-purple">
          <div className="absolute top-6 right-6">
            <span className="px-3 py-1 bg-brand-purple/20 text-brand-purple rounded-full text-xs font-semibold tracking-wider border border-brand-purple/30">
              INVESTIGATING
            </span>
          </div>
          
          <h2 className="text-xl font-medium text-white mb-2">Edge Gateway Latency Spike</h2>
          <p className="text-sm text-white/50 mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Started 45 minutes ago
          </p>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center border border-brand-purple/30">
                  <AlertCircle className="w-4 h-4 text-brand-purple" />
                </div>
                <div className="w-[1px] h-full bg-white/10 my-2" />
              </div>
              <div className="pb-6">
                <p className="text-sm text-white font-medium mb-1">Identified (AI Auto-Detection)</p>
                <p className="text-sm text-white/60">Aether Vision predicted anomaly. High latency on US-East nodes.</p>
                <span className="text-xs text-white/40 mt-1 block">10:45 AM UTC</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-brand-purple/50 flex items-center justify-center border border-brand-purple animate-pulse shadow-[0_0_15px_rgba(157,0,255,0.5)]">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
                <div className="w-[1px] h-full transition-all duration-1000 bg-transparent my-2" />
              </div>
              <div className="pb-6">
                <p className="text-sm text-white font-medium mb-1">Investigating</p>
                <p className="text-sm text-white/60">Engineers are looking into Cloudflare routing issues.</p>
                <span className="text-xs text-white/40 mt-1 block">10:55 AM UTC</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="absolute top-6 right-6">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold tracking-wider border border-green-500/30">
              RESOLVED
            </span>
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Auth API Rate Limit Failure</h2>
          <p className="text-sm text-white/50 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> Resolved yesterday
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
