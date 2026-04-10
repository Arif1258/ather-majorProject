import { Globe2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export function RegionAndIncidents({ regionData, lastIncident }: { regionData: any, lastIncident: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Region Snapshot */}
      <GlassCard className="p-5 flex flex-col" glowColor="none">
        <div className="flex items-center gap-2 mb-6">
          <Globe2 className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold flex-1">Region Snapshot</h3>
          <span className="text-xs text-white/50 tracking-wider">AVG LATENCY</span>
        </div>
        <div className="space-y-4 flex-1">
           {Object.entries(regionData).map(([region, latency]) => {
             const val = parseInt(latency as string);
             const isHigh = val > 150;
             const width = Math.min(100, Math.max(10, (val / 300) * 100)); // normalized to 300ms
             return (
               <div key={region} className="space-y-1">
                 <div className="flex justify-between text-sm">
                   <span className="text-white/80">{region}</span>
                   <span className={`font-mono ${isHigh ? 'text-yellow-400' : 'text-white'}`}>{String(latency)}</span>
                 </div>
                 <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                   <div 
                     className={`h-full rounded-full transition-all duration-1000 ${isHigh ? 'bg-yellow-500' : 'bg-brand-cyan'}`}
                     style={{ width: `${width}%` }}
                   />
                 </div>
               </div>
             );
           })}
        </div>
      </GlassCard>

      {/* Incident Summary */}
      <GlassCard className="p-5 flex flex-col" glowColor="none">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <h3 className="text-white font-semibold flex-1">Latest Incident</h3>
          {lastIncident?.status === 'Resolved' && (
             <span className="bg-green-500/10 text-green-400 flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-green-500/30">
               <CheckCircle2 className="w-3 h-3" /> Resolved
             </span>
          )}
          {lastIncident?.status === 'Active' && (
             <span className="bg-red-500/10 text-red-400 flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-red-500/30 animate-pulse">
               Active
             </span>
          )}
        </div>
        <div className="flex-1 bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col justify-center">
            {lastIncident ? (
               <>
                  <div className="text-sm font-semibold text-white/90 mb-1">{lastIncident.websiteName}</div>
                  <p className="text-lg font-light text-white mb-3">"{lastIncident.message}"</p>
                  <div className="text-xs text-white/40 font-mono tracking-wider">
                     {new Date(lastIncident.timestamp).toLocaleString()}
                  </div>
               </>
            ) : (
               <div className="text-center text-white/50">
                  No incident data available.
               </div>
            )}
        </div>
      </GlassCard>

    </div>
  );
}
