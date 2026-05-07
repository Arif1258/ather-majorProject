import { TrendingUp, ActivitySquare } from 'lucide-react';
import { GlassCard } from './GlassCard';

export function WhatChangedPanel() {
  return (
    <GlassCard glowColor="purple" className="relative overflow-hidden w-full h-full border-brand-purple/30">
      <div className="absolute inset-0 bg-brand-purple/5 animate-pulse" />
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center gap-2 mb-2">
          <ActivitySquare className="w-5 h-5 text-brand-purple" />
          <h3 className="text-white font-medium">What Changed?</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-black/30 rounded p-3 border border-white/5">
            <p className="text-white/80 text-sm">
              <span className="text-brand-purple font-bold">Alert:</span> Response time for edge.myapp.com increased by <span className="text-red-400 font-bold">120%</span> in the last 10 minutes.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
              <TrendingUp className="w-3 h-3 text-red-400" /> Currently averaging 250ms
            </div>
          </div>
          
          <div className="bg-black/30 rounded p-3 border border-white/5">
            <p className="text-white/80 text-sm">
              <span className="text-brand-cyan font-bold">Improvement:</span> DB cluster recovered. 0 timeouts in the last hour.
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
