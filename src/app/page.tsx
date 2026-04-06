'use client';

import { GlassCard } from "@/components/ui/GlassCard";
import { analyzeLatency, type LatencyData } from "@/lib/ai/aether-vision";
import { BrainCircuit, CheckCircle2, ServerCrash, Clock, AlertTriangle, Lock } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlobalEdgeMap } from "@/components/ui/GlobalEdgeMap";

// Mock Data simulating a degrading trend
const mockLatencyData: LatencyData[] = [
  { timestamp: Date.now() - 60000 * 6, pingMs: 45 },
  { timestamp: Date.now() - 60000 * 5, pingMs: 48 },
  { timestamp: Date.now() - 60000 * 4, pingMs: 53 },
  { timestamp: Date.now() - 60000 * 3, pingMs: 110 },
  { timestamp: Date.now() - 60000 * 2, pingMs: 180 },
  { timestamp: Date.now() - 60000 * 1, pingMs: 250 },
];

const mockChartData = mockLatencyData.map(d => ({
  time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  latency: d.pingMs
}));

export default function Dashboard() {
  const aiAnalysis = analyzeLatency(mockLatencyData);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-1000">
      
      {/* Header and Aether Vision AI Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-white mb-2">Global <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-brand-purple">Infrastructure</span></h1>
          <p className="text-white/50 text-sm tracking-widest">REAL-TIME EDGE TELEMETRY</p>
        </div>
        
        <GlassCard className="!p-4 border-l-4 !border-l-brand-cyan max-w-sm w-full" glowColor={aiAnalysis.isAnomaly ? "purple" : "cyan"}>
          <div className="flex items-start gap-4">
            <BrainCircuit className={aiAnalysis.isAnomaly ? "text-brand-purple animate-pulse" : "text-brand-cyan"} />
            <div>
              <p className="text-sm font-bold text-white mb-1">AETHER VISION AI</p>
              <p className="text-xs text-white/70">
                {aiAnalysis.isAnomaly ? 
                  `Anomaly detected. High likelihood of failure. Target > ${aiAnalysis.predictedPingMsAtNextCheck}ms` : 
                  `Network stable. Trend is ${aiAnalysis.trend}.`}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Monitors List */}
        <div className="space-y-4 lg:col-span-1">
          <h2 className="text-xl font-medium text-white mb-6">Monitored Services</h2>
          
          <GlassCard glowColor="cyan" className="group cursor-pointer">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white group-hover:text-brand-cyan transition-colors">Auth API Server</h3>
                <p className="text-xs text-white/50">api.myapp.com</p>
              </div>
              <CheckCircle2 className="text-brand-cyan w-6 h-6" />
            </div>
            <div className="mt-4 flex gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> 99.99%</span>
              <span className="flex items-center gap-1">45ms</span>
              <span className="flex items-center gap-1 text-green-400 border border-green-400/20 px-2 py-0.5 rounded-full"><Lock className="w-3 h-3"/> 342 days</span>
            </div>
          </GlassCard>

          <GlassCard glowColor="purple" className="relative overflow-hidden group cursor-pointer border-brand-purple/50">
            <div className="absolute inset-0 bg-brand-purple/10 animate-pulse" />
            <div className="relative flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white text-shadow-sm">Edge Gateway</h3>
                <p className="text-xs text-white/60">edge.myapp.com</p>
              </div>
              <AlertTriangle className="text-brand-purple w-6 h-6 animate-bounce" />
            </div>
            <div className="relative mt-4 flex justify-between items-center w-full">
              <div className="flex gap-4 text-xs text-brand-purple/80 font-medium">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Degrading</span>
                <span className="flex items-center gap-1">250ms</span>
              </div>
              <span className="flex items-center gap-1 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full bg-amber-400/10 text-[10px] whitespace-nowrap"><Lock className="w-3 h-3"/> Expires 12d</span>
            </div>
          </GlassCard>

          <GlassCard glowColor="none" className="opacity-70">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">Database Cluster</h3>
                <p className="text-xs text-white/50">db.myapp.com</p>
              </div>
              <ServerCrash className="text-red-400 w-6 h-6" />
            </div>
            <div className="mt-4 flex justify-between w-full">
              <div className="flex gap-4 text-xs text-red-300 font-medium tracking-wide">
                <span>DOWN</span>
              </div>
              <span className="flex items-center gap-1 text-red-400 border border-red-400/20 px-2 py-0.5 rounded-full bg-red-400/10 text-[10px]"><Lock className="w-3 h-3"/> Expired</span>
            </div>
          </GlassCard>
        </div>

        {/* Predictive Latency Chart and Map */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="h-full flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-white">Edge Gateway Latency</h2>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs tracking-widest text-white/80">LAST 1 HOUR</span>
            </div>
            
            <div className="flex-1 w-full h-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9D00FF" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#9D00FF" stopOpacity={0}/>
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.5)', 
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                    }} 
                    itemStyle={{ color: '#00F5FF' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#9D00FF" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorLatency)" 
                    style={{ filter: 'url(#neonGlow)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* New Global Edge Map */}
          <GlobalEdgeMap />
        </div>
        
      </div>
    </div>
  );
}
