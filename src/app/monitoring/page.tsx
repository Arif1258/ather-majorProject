'use client';

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CheckCircle2, ServerCrash, Clock, AlertTriangle, Lock, BarChart3, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";
import Link from 'next/link';

type MonitoredSite = {
  _id: string;
  name: string;
  url: string;
  status: string;
  healthStatus: string;
  warningStatus: string;
  isPaused?: boolean;
  responseTime: number;
  lastCheck?: string;
};

export default function MonitoringPage() {
  const [sites, setSites] = useState<MonitoredSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/websites/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { 
        if (d.success) setSites(d.data); 
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleTogglePause = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/websites/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ isPaused: !currentVal })
      });
      const data = await res.json();
      if (data.success) {
        setSites(prev => prev.map(s => s._id === id ? { ...s, isPaused: !currentVal } : s));
      }
    } catch(e) {
      alert('Error connecting to server.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to stop monitoring ${name}?`)) return;
    
    try {
      const res = await fetch(`/api/websites/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setSites(prev => prev.filter(s => s._id !== id));
      } else {
        alert(data.error || 'Failed to delete website');
      }
    } catch(e) {
      alert('Error connecting to server.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white p-8 space-y-8 max-w-7xl mx-auto pt-24 animate-in fade-in zoom-in-95 duration-1000">
        <div className="mb-8">
        <h1 className="text-4xl font-light tracking-tight text-white mb-2">Active <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-brand-purple">Monitoring</span></h1>
        <p className="text-white/50 text-sm tracking-widest">LIVE INFRASTRUCTURE STATUS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="text-white/40 text-sm italic col-span-full">Loading telemetry data...</div>
        ) : sites.length === 0 ? (
           <div className="text-white/40 text-sm italic col-span-full">No websites monitored yet. Head to the Dashboard to add one!</div>
        ) : (
          sites.map((site) => (
            <GlassCard key={site._id} glowColor={site.status==='DOWN' ? 'none' : site.warningStatus !== 'Normal' ? 'purple' : 'cyan'} className={`group relative flex flex-col justify-between ${site.status==='DOWN' ? 'opacity-70' : ''}`}>
              <div>
                 <div className="flex justify-between items-center mb-4">
                   <div className="w-full flex justify-between items-start pr-2">
                     <div className="max-w-[70%]">
                       <h3 className="font-semibold text-white group-hover:text-brand-cyan transition-colors truncate">{site.name}</h3>
                       <p className="text-xs text-white/50 truncate w-full">{site.url}</p>
                     </div>
                     {site.status === 'UP' ? <CheckCircle2 className="text-brand-cyan w-6 h-6 flex-shrink-0" /> : <ServerCrash className="text-red-400 w-6 h-6 flex-shrink-0" />}
                   </div>
                 </div>

                 <div className="flex flex-col gap-3">
                   <div className="flex gap-4 text-xs font-medium items-center">
                     {site.isPaused ? (
                        <span className="text-white/50 tracking-wide">PAUSED</span>
                     ) : site.status === 'DOWN' ? (
                        <span className="text-red-300 tracking-wide">DOWN</span>
                     ) : (site.warningStatus !== 'Normal') ? (
                        <span className="flex items-center gap-1 text-brand-purple/80">
                          <AlertTriangle className="w-3 h-3"/> {site.warningStatus}
                        </span>
                     ) : (
                        <span className="flex items-center gap-1 text-white/70">
                          <Clock className="w-3 h-3"/> Active
                        </span>
                     )}
                     {!site.isPaused && site.status === 'UP' && <span className="text-white/70">{site.responseTime}ms</span>}
                   </div>
                 </div>
              </div>

              <div className="flex justify-between items-end mt-6 w-full">
                 <span className={`flex items-center px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap bg-white/5 border ${site.healthStatus === 'Healthy' ? 'text-green-400 border-green-400/20 bg-green-400/10' : site.healthStatus === 'Slow' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' : 'text-red-400 border-red-400/20 bg-red-400/10'}`}>
                   {site.healthStatus}
                 </span>
                 
                 <div className="flex gap-2">
                    <button onClick={() => handleTogglePause(site._id, !!site.isPaused)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                       {site.isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <Link href={`/analytics?websiteId=${site._id}`} className="px-3 py-1.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                       <BarChart3 className="w-3 h-3" /> Graph
                    </Link>
                    <button onClick={() => handleDelete(site._id, site.name)} className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/30">
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </GlassCard>
          ))
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
