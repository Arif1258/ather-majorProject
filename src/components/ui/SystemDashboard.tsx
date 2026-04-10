'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Cpu, MemoryStick, Clock, Activity, AlertTriangle, ShieldCheck, BarChart2 } from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid
} from 'recharts';

interface SystemData {
  cpuUsage: number;
  perCoreUsage: { core: string, usage: number }[];
  memory: {
    total: number;
    used: number;
    free: number;
  };
  uptime: number;
  loadAverage: number[];
}

type ExtSystemData = SystemData & { time: string };

const formatBytes = (bytes: number) => {
   if (bytes === 0) return '0 B';
   const k = 1024;
   const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatUptime = (seconds: number) => {
   const days = Math.floor(seconds / (3600*24));
   const hrs = Math.floor((seconds % (3600*24)) / 3600);
   const mins = Math.floor((seconds % 3600) / 60);
   return `${days > 0 ? days + 'd ' : ''}${hrs}h ${mins}m`;
};

// Custom tooltip renderer for Recharts to match Glass UI
const CustomTooltip = ({ active, payload, label, formatter }: { active?: boolean, payload?: { name?: string; color?: string; fill?: string; value: number }[], label?: string, formatter?: (val: number) => string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
        <p className="text-white/50 text-xs mb-2 font-mono">{label}</p>
        {payload.map((entry: { name: string; color?: string; fill?: string; value: number }, index: number) => (
          <div key={index} className="flex flex-col">
            <span className="text-[10px] text-white/50 uppercase tracking-wider">{entry.name}</span>
            <span className="text-sm font-bold" style={{ color: entry.color || entry.fill }}>
               {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function SystemDashboard() {
  const [sysHistory, setSysHistory] = useState<ExtSystemData[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/system');
        const d = await res.json();
        if (d.success) {
           const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
           setSysHistory(prev => {
              const next = [...prev, { ...d.data, time: now }];
              if (next.length > 20) return next.slice(-20); // Keep last 60 seconds (20 * 3s)
              return next;
           });
           setError(false);
        } else {
           setError(true);
        }
      } catch (e) {
        setError(true);
      }
    };

    fetchStats();
    const intv = setInterval(fetchStats, 3000);
    return () => clearInterval(intv);
  }, []);

  if (error) {
     return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center text-white/50">
           <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
           <p className="text-lg">Failed to establish OS Telemetry link.</p>
           <p className="text-sm mt-2 text-white/30">Backend metrics daemon may be offline.</p>
        </div>
     );
  }

  if (sysHistory.length === 0) {
     return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center text-white/50">
           <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mb-4" />
           <p className="animate-pulse tracking-widest text-sm uppercase">Acquiring Kernel Metrics...</p>
        </div>
     );
  }

  const latest = sysHistory[sysHistory.length - 1];
  const memPct = Math.round((latest.memory.used / latest.memory.total) * 100);
  
  const isCpuCrit = latest.cpuUsage > 85;
  const isCpuWarn = latest.cpuUsage > 70;
  const cpuColor = isCpuCrit ? '#ef4444' : isCpuWarn ? '#f59e0b' : '#00F5FF';

  const isMemCrit = memPct > 85;
  const isMemWarn = memPct > 70;
  const memColor = isMemCrit ? '#ef4444' : isMemWarn ? '#f59e0b' : '#a855f7';

  // Load Average thresholds (Assuming 1.0 per core is 100% load, but simplify to raw numbers)
  const isLoadWarn = latest.loadAverage[0] > 2;

  // Donut Chart Data
  const memoryDonutData = [
     { name: 'Used', value: latest.memory.used, color: memColor },
     { name: 'Free', value: latest.memory.free, color: 'rgba(255,255,255,0.1)' }
  ];

  return (
     <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-1000 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-white mb-2">Systems <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-brand-purple">Core</span></h1>
            <p className="text-white/50 text-sm tracking-widest">NATIVE OS NODE INFRASTRUCTURE</p>
          </div>
          
          <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
             <span className="text-xs uppercase font-semibold text-white/50 tracking-wider">Live Polling • 3s</span>
          </div>
        </div>

        {/* --- SECTION: CPU --- */}
        <div className="flex items-center gap-2 mb-2">
           <Cpu className="w-5 h-5 text-brand-cyan" />
           <h2 className="text-xl font-semibold text-white tracking-wide">Processor Cluster</h2>
           <span className={`ml-auto text-xs px-2 py-1 rounded border ${isCpuCrit ? 'border-red-500/30 text-red-400 bg-red-500/10' : isCpuWarn ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 'border-brand-cyan/30 text-brand-cyan bg-brand-cyan/10'}`}>
              {isCpuCrit ? 'CPU Load Critical' : isCpuWarn ? 'CPU Load High' : 'CPU Stable'}
           </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            
            {/* 1. CPU Usage Trend */}
            <GlassCard glowColor="none" className="p-6 h-[320px] flex flex-col">
               <h3 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Overall Usage Trend</h3>
               <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sysHistory}>
                       <defs>
                         <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor={cpuColor} stopOpacity={0.3}/>
                           <stop offset="95%" stopColor={cpuColor} stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} />
                       <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} domain={[0, 100]} tickFormatter={v => `${v}%`} width={40} />
                       <RechartsTooltip content={<CustomTooltip formatter={(v: number) => `${v}%`} />} />
                       <Line 
                          type="monotone" 
                          dataKey="cpuUsage" 
                          name="CPU Load"
                          stroke={cpuColor} 
                          strokeWidth={2} 
                          dot={false} 
                          activeDot={{ r: 4, fill: cpuColor, stroke: '#000', strokeWidth: 2 }}
                       />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </GlassCard>

            {/* 2. Per-Core Bar Chart */}
            <GlassCard glowColor="none" className="p-6 h-[320px] flex flex-col">
               <h3 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Per-Core Utilization</h3>
               <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={latest.perCoreUsage} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis dataKey="core" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} interval={0} angle={-45} textAnchor="end" height={60} />
                       <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} domain={[0, 100]} tickFormatter={v => `${v}%`} width={40} />
                       <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip formatter={(v: number) => `${v}%`} />} />
                       <Bar dataKey="usage" name="Usage" radius={[4, 4, 0, 0]}>
                          {latest.perCoreUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.usage > 85 ? '#ef4444' : entry.usage > 70 ? '#f59e0b' : '#00F5FF'} />
                          ))}
                       </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </GlassCard>
        </div>


        {/* --- SECTION: MEMORY --- */}
        <div className="flex items-center gap-2 mb-2">
           <MemoryStick className="w-5 h-5 text-brand-purple" />
           <h2 className="text-xl font-semibold text-white tracking-wide">Volatile Allocation</h2>
           <span className={`ml-auto text-xs px-2 py-1 rounded border ${isMemCrit ? 'border-red-500/30 text-red-400 bg-red-500/10' : isMemWarn ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 'border-brand-purple/30 text-brand-purple bg-brand-purple/10'}`}>
              {isMemCrit ? 'Memory Paging High' : isMemWarn ? 'Memory Load Moderate' : 'Memory Stable'}
           </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            
            {/* 3. Memory Usage Trend */}
            <GlassCard glowColor="none" className="p-6 h-[320px] flex flex-col">
               <h3 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Memory Saturation Trend</h3>
               <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sysHistory}>
                       <defs>
                         <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor={memColor} stopOpacity={0.4}/>
                           <stop offset="95%" stopColor={memColor} stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} />
                       <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} domain={['dataMin - 100000000', 'dataMax + 100000000']} tickFormatter={v => formatBytes(v)} width={60} />
                       <RechartsTooltip content={<CustomTooltip formatter={(v: number) => formatBytes(v)} />} />
                       <Area 
                          type="monotone" 
                          dataKey="memory.used" 
                          name="Allocated RAM"
                          stroke={memColor} 
                          fillOpacity={1} 
                          fill="url(#memGradient)" 
                       />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </GlassCard>

            {/* 4. Memory Distribution Donut */}
            <GlassCard glowColor="none" className="p-6 h-[320px] flex flex-col relative overflow-hidden">
               <h3 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Real-Time Distribution</h3>
               <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={memoryDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {memoryDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip formatter={(v: number) => formatBytes(v)} />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-4">
                     <span className="text-3xl font-black text-white">{memPct}%</span>
                     <span className="text-[10px] uppercase text-white/40 tracking-widest mt-1">Saturated</span>
                  </div>
               </div>
            </GlassCard>
        </div>


        {/* --- SECTION: SYSTEM LOAD & STATUS --- */}
        <div className="flex items-center gap-2 mb-2">
           <Activity className="w-5 h-5 text-emerald-400" />
           <h2 className="text-xl font-semibold text-white tracking-wide">System Performance</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 5. Load Average Trend */}
            <GlassCard glowColor="none" className="p-6 h-[260px] flex flex-col">
               <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">Load Average (1m)</h3>
                  <span className={`text-xs px-2 py-1 rounded border ${isLoadWarn ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'}`}>
                     {isLoadWarn ? 'High System Load' : 'Load Balanced'}
                  </span>
               </div>
               <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sysHistory}>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} />
                       <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} width={30} domain={['auto', 'auto']} />
                       <RechartsTooltip content={<CustomTooltip />} />
                       <Line 
                          type="basis" 
                          dataKey={(d) => d.loadAverage[0]} 
                          name="1m Load"
                          stroke="#10b981" 
                          strokeWidth={2} 
                          dot={false} 
                          activeDot={{ r: 4, fill: '#10b981', stroke: '#000', strokeWidth: 2 }}
                       />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </GlassCard>

            {/* 6. Uptime & Integrity Display */}
            <div className="flex flex-col gap-6">
               <GlassCard className="p-8 flex items-center gap-6 h-[115px]">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                     <Clock className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                     <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Host Uptime</span>
                     <span className="text-3xl font-light text-white tracking-widest">{formatUptime(latest.uptime)}</span>
                  </div>
               </GlassCard>

               <GlassCard className="p-8 flex items-center gap-6 h-[115px]">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                     <ShieldCheck className="w-7 h-7 text-green-400" />
                  </div>
                  <div>
                     <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">System Integrity</span>
                     <span className="text-2xl font-bold text-green-400 block tracking-wide">SECURE & ONLINE</span>
                  </div>
               </GlassCard>
            </div>

        </div>

     </div>
  );
}
