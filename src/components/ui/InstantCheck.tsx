import { useState } from 'react';
import { Search, Activity, Clock, Globe, ShieldAlert, CheckCircle2, ServerCrash } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface RegionData {
  region: string;
  responseTime: number;
  status: 'UP' | 'DOWN';
}

interface CheckResult {
  url?: string;
  status?: string;
  statusCode?: number;
  responseTime?: number;
  healthStatus?: string;
  warningStatus?: string;
  healthScore?: number;
  regionData?: RegionData[];
  error?: string;
}

export function InstantCheck() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [recentChecks, setRecentChecks] = useState<string[]>([]);

  // Load from local storage
  if (typeof window !== 'undefined' && recentChecks.length === 0) {
    const saved = localStorage.getItem('aether_recent_checks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) setRecentChecks(parsed);
      } catch (e) {}
    }
  }

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // ensure it has a protocol
    let targetUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      targetUrl = `https://${url}`;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (data.data && data.data.url) {
          const newRecents = [data.data.url, ...recentChecks.filter(u => u !== data.data.url)].slice(0, 5);
          setRecentChecks(newRecents);
          localStorage.setItem('aether_recent_checks', JSON.stringify(newRecents));
        }
      } else {
        setResult({ error: data.error || 'Failed to check URL' });
      }
    } catch {
      setResult({ error: 'Network issue while reaching server.' });
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    if (health === 'Healthy') return 'text-green-400';
    if (health === 'Slow') return 'text-amber-400';
    return 'text-red-400';
  };

  const getGlowColor = () => {
    if (!result) return 'cyan';
    if (result.status === 'UP') return result.healthStatus === 'Healthy' ? 'cyan' : 'purple';
    return 'none';
  };

  return (
    <GlassCard className="w-full h-full relative overflow-y-auto custom-scrollbar" glowColor={getGlowColor()}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col gap-6 items-start">
        <div className="flex-1 w-full space-y-4">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 flex items-center gap-2">
              <Activity className="w-6 h-6 text-brand-cyan" />
              Instant URL Check
            </h2>
            <p className="text-sm text-white/50 mt-1">Run an immediate global performance analysis on any endpoint.</p>
          </div>

          <form onSubmit={handleCheck} className="flex flex-col gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all font-mono text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url}
              className="w-full flex justify-center bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan border border-brand-cyan/50 rounded-xl px-6 py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-brand-cyan/50 border-t-transparent animate-spin" />
                  Checking...
                </span>
              ) : (
                'Check Now'
              )}
            </button>
          </form>
          
          {recentChecks.length > 0 && (
            <div className="flex gap-2 items-center text-xs">
              <span className="text-white/40">Recent:</span>
              <div className="flex flex-wrap gap-2">
                {recentChecks.map((c, i) => (
                  <button 
                    key={i} 
                    onClick={() => setUrl(c)} 
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                  >
                    {c.replace(/^https?:\/\//i, '')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Pane */}
        {result && !result.error && (
          <div className="flex-1 w-full bg-black/40 border border-white/5 rounded-xl p-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-medium break-all">{result.url}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${result.status === 'UP' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {result.status} {(result.statusCode ?? 0) > 0 && `(${result.statusCode})`}
                  </span>
                  <span className={`text-xs ${getHealthColor(result.healthStatus || 'Down')}`}>
                    • {result.healthStatus}
                  </span>
                  {result.warningStatus && result.warningStatus !== 'Normal' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> {result.warningStatus}
                    </span>
                  )}
                  {result.healthScore !== undefined && (
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider flex items-center gap-1 ${result.healthScore >= 90 ? 'bg-green-500/20 text-green-400 border-green-500/30' : result.healthScore >= 50 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                       Health: {result.healthScore}/100
                     </span>
                  )}
                </div>
              </div>
              {result.status === 'UP' ? (
                <CheckCircle2 className="w-8 h-8 text-green-400 opacity-80" />
              ) : (
                <ServerCrash className="w-8 h-8 text-red-400 opacity-80" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/10">
              <div>
                <p className="text-white/40 text-[10px] tracking-widest uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Global Latency</p>
                <p className="text-2xl font-light text-white">{(result.responseTime ?? 0) > 0 ? `${result.responseTime}ms` : '---'}</p>
              </div>
            </div>

            {/* Region Data */}
            {result.regionData && result.regionData.length > 0 && (
              <div>
                <p className="text-white/40 text-[10px] tracking-widest uppercase mb-2 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Edge Region Analysis
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {result.regionData.map((rd: RegionData, i: number) => (
                    <div key={i} className="bg-white/5 rounded p-2 text-center">
                      <p className="text-[10px] text-white/50">{rd.region}</p>
                      <p className={`text-sm font-medium ${rd.status === 'UP' ? 'text-white' : 'text-red-400'}`}>
                        {rd.status === 'UP' ? `${rd.responseTime}ms` : 'ERR'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {result && result.error && (
            <div className="flex-1 w-full bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-center gap-3 text-red-400 animate-in fade-in">
                <ShieldAlert className="w-6 h-6" />
                <div>
                   <p className="font-semibold text-sm">Target Unreachable</p>
                   <p className="text-xs opacity-80">{result.error}</p>
                </div>
            </div>
        )}

      </div>
    </GlassCard>
  );
}
