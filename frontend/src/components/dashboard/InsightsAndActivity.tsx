import { Zap, Activity, Info, AlertTriangle, XCircle, Plus, Search, BarChart3 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';

export function InsightsAndActivity({ insights, recentActivity }: { insights: string[], recentActivity: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Insights Panel */}
      <GlassCard className="p-5 flex flex-col min-h-[250px]" glowColor="cyan">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-brand-cyan" />
          <h3 className="text-white font-semibold flex-1">Auto-Generated Insights</h3>
          <span className="bg-brand-cyan/20 text-brand-cyan text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-brand-cyan/30 tracking-wider">
            AI Digest
          </span>
        </div>
        <div className="flex-1 space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="mt-0.5">
                   {insight.toLowerCase().includes('spike') || insight.toLowerCase().includes('elevated') ? (
                     <Activity className="w-4 h-4 text-yellow-400" />
                   ) : insight.toLowerCase().includes('downtime') || insight.toLowerCase().includes('anomalies') ? (
                     <AlertTriangle className="w-4 h-4 text-red-400" />
                   ) : (
                     <Info className="w-4 h-4 text-brand-cyan" />
                   )}
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{insight}</p>
              </div>
            ))
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-white/40">
                <Info className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No significant insights generated uniquely.</p>
             </div>
          )}
        </div>
      </GlassCard>

      {/* Recent Activity Feed */}
      <GlassCard className="p-5 flex flex-col min-h-[250px]" glowColor="none">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-brand-purple" />
          <h3 className="text-white font-semibold flex-1">Recent Activity</h3>
        </div>
        <div className="flex-1 space-y-4 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent overflow-y-auto pr-2 custom-scrollbar">
           {recentActivity.map((activity, idx) => (
             <div key={idx} className="relative flex items-start gap-4">
               {/* Timeline Node */}
               <div className={`absolute left-0 mt-1.5 w-8 flex justify-center`}>
                  <div className={`w-2.5 h-2.5 rounded-full border-2 border-[#09090b] ${
                    activity.type === 'error' ? 'bg-red-500' : 
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-brand-cyan'
                  } z-10 shadow-[0_0_8px_rgba(0,0,0,0.8)]`} />
               </div>
               
               <div className="ml-10 bg-black/40 border border-white/5 p-3 rounded-lg flex-1 relative group hover:border-white/10 transition-colors">
                 <p className="text-sm text-white/90 mb-1">{activity.message}</p>
                 <span className="text-[10px] text-white/40 tracking-wider font-mono">
                   {new Date(activity.timestamp).toLocaleTimeString()} • {new Date(activity.timestamp).toLocaleDateString()}
                 </span>
               </div>
             </div>
           ))}
        </div>
      </GlassCard>

    </div>
  );
}

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Link href="/monitoring/add" className="group">
        <GlassCard className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors border border-white/5 group-hover:border-brand-cyan/50" glowColor="none">
          <div className="flex items-center gap-3">
             <div className="bg-brand-cyan/10 p-2 rounded-lg text-brand-cyan group-hover:scale-110 transition-transform">
               <Plus className="w-5 h-5" />
             </div>
             <span className="text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors">Add Website</span>
          </div>
        </GlassCard>
      </Link>
      
      <button onClick={() => window.scrollTo(0, document.body.scrollHeight)} className="group text-left">
        <GlassCard className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors border border-white/5 group-hover:border-purple-500/50" glowColor="none">
          <div className="flex items-center gap-3">
             <div className="bg-brand-purple/10 p-2 rounded-lg text-brand-purple group-hover:scale-110 transition-transform">
               <Search className="w-5 h-5" />
             </div>
             <span className="text-sm font-semibold text-white group-hover:text-brand-purple transition-colors">Quick Check</span>
          </div>
        </GlassCard>
      </button>

      <Link href="/analytics" className="group">
        <GlassCard className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors border border-white/5 group-hover:border-green-500/50" glowColor="none">
          <div className="flex items-center gap-3">
             <div className="bg-green-500/10 p-2 rounded-lg text-green-400 group-hover:scale-110 transition-transform">
               <BarChart3 className="w-5 h-5" />
             </div>
             <span className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors">View Analytics</span>
          </div>
        </GlassCard>
      </Link>
    </div>
  );
}
