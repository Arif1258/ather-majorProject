import { GlassCard } from "@/components/ui/GlassCard";
import { CheckCircle2, Server } from "lucide-react";
import { UptimeHeatmap } from "@/components/ui/UptimeHeatmap";

export default async function StatusPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  
  return (
    <div className="max-w-4xl mx-auto mt-10 animate-in fade-in zoom-in-95 duration-1000">
      
      <div className="flex flex-col items-center justify-center text-center space-y-6 mb-16">
        <div className="w-20 h-20 bg-brand-cyan/20 rounded-full flex items-center justify-center border border-brand-cyan/30 shadow-[0_0_40px_rgba(0,245,255,0.4)]">
          <Server className="w-10 h-10 text-brand-cyan animate-pulse" />
        </div>
        <div>
          <h1 className="text-4xl font-light text-white mb-2 tracking-tight">
            Status for <span className="font-bold uppercase bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-white">{serviceId}</span>
          </h1>
          <p className="text-brand-cyan tracking-widest text-sm font-medium">ALL SYSTEMS OPERATIONAL</p>
        </div>
      </div>

      <div className="space-y-6 mb-16">
        <GlassCard glowColor="cyan" className="flex flex-col md:flex-row justify-between items-start md:items-center px-8 py-6 gap-4">
          <div>
            <span className="text-white font-medium text-lg tracking-wide block">API Endpoints</span>
            <span className="text-white/50 text-sm">api.myapp.com</span>
          </div>
          <div className="flex items-center gap-2 bg-brand-cyan/10 px-4 py-2 rounded-full border border-brand-cyan/20">
            <CheckCircle2 className="w-5 h-5 text-brand-cyan" />
            <span className="text-brand-cyan text-sm font-semibold tracking-wider">ONLINE</span>
          </div>
        </GlassCard>

        <GlassCard glowColor="cyan" className="flex flex-col md:flex-row justify-between items-start md:items-center px-8 py-6 gap-4">
          <div>
            <span className="text-white font-medium text-lg tracking-wide block">Database Cluster</span>
            <span className="text-white/50 text-sm">db.myapp.com</span>
          </div>
          <div className="flex items-center gap-2 bg-brand-cyan/10 px-4 py-2 rounded-full border border-brand-cyan/20">
            <CheckCircle2 className="w-5 h-5 text-brand-cyan" />
            <span className="text-brand-cyan text-sm font-semibold tracking-wider">ONLINE</span>
          </div>
        </GlassCard>
      </div>

      {/* New Historical Heatmap */}
      <UptimeHeatmap />

      <div className="mt-16 text-center">
        <p className="text-xs text-white/30 tracking-widest font-mono">POWERED BY AETHERMONITOR</p>
      </div>
    </div>
  );
}
