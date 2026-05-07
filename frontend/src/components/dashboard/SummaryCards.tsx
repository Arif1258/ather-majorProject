'use client';

import { Activity, AlertTriangle, CheckCircle2, ServerCrash, Clock, ActivitySquare } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export function SystemHealthBanner({ status }: { status: string }) {
  const isHealthy = status === 'Healthy';
  const isWarning = status === 'Warning';
  const isCritical = status === 'Critical';

  let bgColor = 'bg-green-500/10';
  let borderColor = 'border-green-500/30';
  let textColor = 'text-green-400';
  let Icon = CheckCircle2;

  if (isWarning) {
    bgColor = 'bg-yellow-500/10';
    borderColor = 'border-yellow-500/30';
    textColor = 'text-yellow-400';
    Icon = AlertTriangle;
  } else if (isCritical) {
    bgColor = 'bg-red-500/10';
    borderColor = 'border-red-500/30';
    textColor = 'text-red-400';
    Icon = ServerCrash;
  }

  return (
    <div className={`w-full flex items-center justify-between p-4 rounded-xl border ${bgColor} ${borderColor} animate-in fade-in slide-in-from-top-4`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${bgColor} border ${borderColor}`}>
          <Icon className={`w-5 h-5 ${textColor} ${isCritical ? 'animate-pulse' : ''}`} />
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg">System Status: {status}</h2>
          <p className="text-white/60 text-sm">Real-time infrastructure health</p>
        </div>
      </div>
      <div>
        <div className="flex space-x-1">
           <span className="relative flex h-3 w-3">
            {isCritical && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function SummaryCards({ stats, trend }: { stats: any, trend: number[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <GlassCard className="p-4" glowColor="cyan">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs font-semibold tracking-wider">TOTAL MONITORED</span>
          <ActivitySquare className="w-4 h-4 text-brand-cyan" />
        </div>
        <div className="text-3xl font-light text-white">{stats.total}</div>
      </GlassCard>

      <GlassCard className="p-4" glowColor="none">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs font-semibold tracking-wider">WEBSITES UP</span>
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        </div>
        <div className="text-3xl font-light text-white">{stats.up}</div>
      </GlassCard>

      <GlassCard className="p-4" glowColor={stats.down > 0 ? 'purple' : 'none'}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs font-semibold tracking-wider">WEBSITES DOWN</span>
          <ServerCrash className={`w-4 h-4 ${stats.down > 0 ? 'text-red-400' : 'text-white/30'}`} />
        </div>
        <div className={`text-3xl font-light ${stats.down > 0 ? 'text-red-400' : 'text-white'}`}>{stats.down}</div>
      </GlassCard>

      <GlassCard className="p-4" glowColor={stats.slow > 0 ? 'purple' : 'none'}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs font-semibold tracking-wider">WEBSITES SLOW</span>
          <Clock className={`w-4 h-4 ${stats.slow > 0 ? 'text-yellow-400' : 'text-white/30'}`} />
        </div>
        <div className={`text-3xl font-light ${stats.slow > 0 ? 'text-yellow-400' : 'text-white'}`}>{stats.slow}</div>
      </GlassCard>

      <GlassCard className="p-4" glowColor="purple">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs font-semibold tracking-wider">AVG RESPONSE</span>
          <Activity className="w-4 h-4 text-brand-purple" />
        </div>
        <div className="flex items-end gap-2">
           <div className="text-3xl font-light text-white">{stats.avgResponseTime}<span className="text-sm text-white/50 ml-1">ms</span></div>
           <div className="flex items-end gap-0.5 h-6 mb-1 opacity-60">
             {trend.slice(0,10).map((v, i) => (
               <div key={i} className="w-1 bg-brand-purple rounded-t" style={{ height: `${Math.min(100, Math.max(10, (v / Math.max(...trend)) * 100))}%` }} />
             ))}
           </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4 flex flex-col justify-center items-center" glowColor="cyan">
          <div className="text-white/50 text-xs font-semibold tracking-wider mb-2">OVERALL HEALTH</div>
          <div className="relative flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175} strokeDashoffset={175 - (175 * stats.overallHealthScore) / 100} className="text-brand-cyan transition-all duration-1000" />
            </svg>
            <span className="absolute text-lg font-bold text-white">{stats.overallHealthScore}%</span>
          </div>
      </GlassCard>
    </div>
  );
}
