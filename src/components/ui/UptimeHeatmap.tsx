'use client';
import { GlassCard } from "./GlassCard";

// Generate 90 days of mock data
const generateHeatmapData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    // Simulate some realistic random outages
    const randomVal = Math.random();
    let status: 'uptime' | 'degraded' | 'outage' = 'uptime';
    if (randomVal > 0.98) status = 'outage';
    else if (randomVal > 0.95) status = 'degraded';

    data.push({
      date: d.toLocaleDateString(),
      status,
    });
  }
  return data;
};

export function UptimeHeatmap() {
  const data = generateHeatmapData();
  
  const statusColors = {
    uptime: "bg-brand-cyan shadow-[0_0_8px_#00F5FF30] hover:shadow-[0_0_12px_#00F5FF80]",
    degraded: "bg-amber-400 shadow-[0_0_8px_#fbbf2430] hover:shadow-[0_0_12px_#fbbf2480]",
    outage: "bg-brand-purple shadow-[0_0_8px_#9D00FF30] hover:shadow-[0_0_12px_#9D00FF80]",
  };

  return (
    <GlassCard glowColor="none" className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-medium">90-Day Uptime History</h3>
        <span className="text-white/60 text-sm">99.8%</span>
      </div>
      
      {/* Scrollable container for smaller screens */}
      <div className="overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex flex-wrap gap-[6px] min-w-[max-content]">
          {data.map((day, i) => (
            <div 
              key={i} 
              className={`w-4 h-8 rounded-sm transition-all cursor-pointer group relative ${statusColors[day.status]}`}
            >
              {/* Tooltip */}
              <div className="hidden group-hover:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded text-xs text-white border border-white/10 whitespace-nowrap z-50">
                <span>{day.date} - {day.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-4 text-xs text-white/50 justify-end">
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-brand-cyan"></div> Uptime</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-400"></div> Degraded</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-brand-purple"></div> Outage</span>
      </div>
    </GlassCard>
  );
}
