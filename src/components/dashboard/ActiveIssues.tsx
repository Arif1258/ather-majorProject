import { AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export function ActiveIssues({ issues }: { issues: any[] }) {
  if (!issues || issues.length === 0) return null;

  return (
    <GlassCard className="p-5 flex flex-col h-full" glowColor="purple">
       <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-white font-semibold flex-1">Active Issues</h3>
          <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/30">
            {issues.length} DETECTED
          </span>
       </div>
       <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
         {issues.map((issue) => (
           <div key={issue.id} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${issue.status === 'DOWN' ? 'bg-red-400' : 'bg-yellow-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${issue.status === 'DOWN' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                </span>
                <div className="flex flex-col truncate">
                   <span className="text-sm font-medium text-white truncate">{issue.url}</span>
                   <span className={`text-xs ${issue.status === 'DOWN' ? 'text-red-400/80' : 'text-yellow-400/80'} uppercase tracking-wide font-semibold`}>{issue.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                 <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3 text-white/40" />
                    <span className="text-xs text-white/70 font-mono tracking-wider">{issue.duration}</span>
                 </div>
                 <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 text-white/50 hover:text-white" />
                 </button>
              </div>
           </div>
         ))}
       </div>
    </GlassCard>
  );
}
