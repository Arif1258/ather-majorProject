import { useEffect, useState } from 'react';
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GlassCard } from './GlassCard';
import { Activity, Clock, ShieldAlert, Globe, BarChart3, AlertTriangle, HeartPulse, Zap } from 'lucide-react';

interface ChartProps {
  websiteId: string;
  timeRange: string;
}

// -----------------------------------------------------
// 1. PERFORMANCE GRAPHS
// -----------------------------------------------------

export function SmoothedResponseTimeChart({ websiteId, timeRange }: ChartProps) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/analytics/response-time?websiteId=${websiteId}&timeRange=${timeRange}`)
      .then(r => r.json())
      .then(d => {
         if (d.success && d.data.length > 0) {
            setData(d.data);
            const allKeys = new Set<string>();
            d.data.forEach((row: Record<string, unknown>) => {
              Object.keys(row).forEach(k => { if (k !== 'time' && k !== 'timestamp') allKeys.add(k); });
            });
            setKeys(Array.from(allKeys));
         } else {
            setData([]);
         }
      });
  }, [websiteId, timeRange]);

  const colors = ['#9D00FF', '#00F5FF', '#4ade80', '#fbbf24', '#f87171'];

  return (
    <GlassCard className="h-[400px] flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-brand-cyan" />
        <div>
          <h3 className="text-white font-medium">Response Time Trend</h3>
          <p className="text-xs text-white/50">Smoothed moving average</p>
        </div>
      </div>
      <div className="flex-1 w-full relative">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">Not enough data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                 {colors.map((c, i) => (
                    <linearGradient key={`color-${i}`} id={`colorArea-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={c} stopOpacity={0}/>
                    </linearGradient>
                 ))}
              </defs>
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Legend verticalAlign="top" height={36}/>
              {keys.map((k, i) => (
                <Area key={k} type="basis" dataKey={k} name={k} stroke={colors[i % colors.length]} fill={`url(#colorArea-${i % colors.length})`} strokeWidth={3} dot={false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}

export function LatencyDistributionChart({ websiteId, timeRange }: ChartProps) {
  const [data, setData] = useState<{range: string, count: number, fill: string}[]>([]);

  useEffect(() => {
    fetch(`/api/analytics/latency-distribution?websiteId=${websiteId}&timeRange=${timeRange}`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data.length > 0) setData(d.data); });
  }, [websiteId, timeRange]);

  return (
    <GlassCard className="h-[400px] flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-brand-purple" />
        <div>
          <h3 className="text-white font-medium">Latency Distribution</h3>
          <p className="text-xs text-white/50">Response time consistency mapping</p>
        </div>
      </div>
      <div className="flex-1 w-full relative">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="range" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="count" name="Operations" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}

// -----------------------------------------------------
// 2. RELIABILITY GRAPHS
// -----------------------------------------------------

export function HealthScoreTrend({ websiteId, timeRange }: ChartProps) {
  const [data, setData] = useState<{time: string, score: number}[]>([]);

  useEffect(() => {
    fetch(`/api/analytics/health-score-trend?websiteId=${websiteId}&timeRange=${timeRange}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); });
  }, [websiteId, timeRange]);

  return (
    <GlassCard className="h-[350px] flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <HeartPulse className="w-5 h-5 text-green-400" />
        <div>
          <h3 className="text-white font-medium">Health Score Over Time</h3>
          <p className="text-xs text-white/50">Aggregated reliability index (0-100)</p>
        </div>
      </div>
      <div className="flex-1 w-full relative">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">No score available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="score" name="Score" stroke="#4ade80" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}

export function RegionBarChart({ websiteId, timeRange }: ChartProps) {
  const [data, setData] = useState<{region: string, avgResponseTime: number, fill: string}[]>([]);

  useEffect(() => {
    fetch(`/api/analytics/regions?websiteId=${websiteId}&timeRange=${timeRange}`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data.length > 0) setData(d.data); });
  }, [websiteId, timeRange]);

  return (
    <GlassCard className="h-[350px] flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-5 h-5 text-blue-400" />
        <div>
          <h3 className="text-white font-medium">Avg Latency By Region</h3>
          <p className="text-xs text-white/50">Geographical performance mapping</p>
        </div>
      </div>
      <div className="flex-1 w-full relative mt-4">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">No regional data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 10, left: -30, bottom: 0 }}>
              <XAxis dataKey="region" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="avgResponseTime" name="Avg Latency (ms)" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}


// -----------------------------------------------------
// 3. ERROR GRAPHS
// -----------------------------------------------------

export function FailureFrequencyChart({ websiteId, timeRange }: ChartProps) {
  const [data, setData] = useState<{time: string, failures: number}[]>([]);

  useEffect(() => {
    fetch(`/api/analytics/failure-frequency?websiteId=${websiteId}&timeRange=${timeRange}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); });
  }, [websiteId, timeRange]);

  return (
    <GlassCard className="h-[350px] flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <div>
          <h3 className="text-white font-medium">Failure Frequency</h3>
          <p className="text-xs text-white/50">Downtime occurrence volume</p>
        </div>
      </div>
      <div className="flex-1 w-full relative">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-amber-500/50 text-sm">No failures detected</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="failures" name="Down Events" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}

export function ErrorBreakdownDonut({ websiteId, timeRange }: ChartProps) {
  const [data, setData] = useState<{name: string, count: number, fill: string}[]>([]);

  useEffect(() => {
    fetch(`/api/analytics/error-breakdown?websiteId=${websiteId}&timeRange=${timeRange}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); });
  }, [websiteId, timeRange]);

  return (
    <GlassCard className="h-[350px] flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="w-5 h-5 text-red-400" />
        <div>
          <h3 className="text-white font-medium">Error Payload Analysis</h3>
          <p className="text-xs text-white/50">Failure type categorization</p>
        </div>
      </div>
      <div className="flex-1 w-full relative">
        {(!data || data.length === 0) ? (
          <div className="absolute inset-0 flex items-center justify-center text-green-400/50 text-sm">Systems fully operational</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}

// -----------------------------------------------------
// 4. METRIC CARDS
// -----------------------------------------------------

export function UptimeStreakCard({ websiteId, timeRange }: ChartProps) {
  const [hours, setHours] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/analytics/uptime-streak?websiteId=${websiteId}&timeRange=${timeRange}`)
      .then(r => r.json())
      .then(d => { if (d.success) setHours(d.data.streakHours); });
  }, [websiteId, timeRange]);

  return (
    <GlassCard className="flex items-center justify-between p-6 w-full" glowColor="cyan">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-cyan/20 rounded-xl border border-brand-cyan/30 flex items-center justify-center">
           <Zap className="w-8 h-8 text-brand-cyan" />
        </div>
        <div>
           <h3 className="text-white/60 text-sm font-medium uppercase tracking-widest">Active Uptime Streak</h3>
           <p className="text-3xl font-bold text-white mt-1">
             {hours === null ? '...' : hours > 720 ? '30+ Days' : hours > 24 ? `${Math.floor(hours/24)} Days` : `${hours} Hours`}
           </p>
        </div>
      </div>
      <div className="px-4 py-1.5 border border-green-500/30 bg-green-500/10 text-green-400 rounded-full text-xs font-semibold flex items-center gap-2 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-green-400" />
        Online
      </div>
    </GlassCard>
  );
}

// -----------------------------------------------------
// 5. INCIDENTS AND SUMMARIES
// -----------------------------------------------------

export function IncidentTimeline({ websiteId, timeRange }: ChartProps) {
  const [data, setData] = useState<{website: string, timestamp: string, message: string, resolved: boolean, severity?: 'Info'|'Warning'|'Critical'}[]>([]);

  useEffect(() => {
    fetch(`/api/analytics/incidents?websiteId=${websiteId}&timeRange=${timeRange}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); });
  }, [websiteId, timeRange]);

  return (
    <GlassCard className="max-h-[400px] flex flex-col overflow-hidden" glowColor="none">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
        <ShieldAlert className="w-5 h-5 text-red-500" />
        <div>
          <h3 className="text-white font-medium">Incident Timeline</h3>
          <p className="text-xs text-white/50">Severity & automated summaries</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {data.length === 0 ? (
          <div className="text-white/30 text-sm italic">No incidents recorded in this timeframe.</div>
        ) : (
          <div className="relative border-l-2 border-white/10 ml-3 pl-4 space-y-6 pt-2 pb-2">
            {data.map((inc, i) => {
               const isWarn = inc.severity === 'Warning';
               const isCrit = inc.severity === 'Critical';
               const severityColor = isCrit ? 'red' : isWarn ? 'amber' : 'blue';

               return (
                 <div key={i} className="relative">
                   <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-black ${inc.resolved ? 'bg-green-400' : `bg-${severityColor}-500 animate-pulse`}`} />
                   
                   <p className="text-xs text-white/40 mb-1 font-mono uppercase tracking-wider">
                     {new Date(inc.timestamp).toLocaleString()} • {inc.website} 
                     {inc.severity && <span className={`ml-2 px-1 rounded text-[10px] border border-${severityColor}-500/30 text-${severityColor}-400 bg-${severityColor}-500/10`}>{inc.severity}</span>}
                   </p>
                   
                   <div className={`p-3 rounded border text-sm ${inc.resolved ? 'bg-green-500/10 border-green-500/20 text-green-200' : `bg-${severityColor}-500/10 border-${severityColor}-500/20 text-${severityColor}-200`}`}>
                     <span className="font-semibold block mb-0.5">{inc.resolved ? 'Resolved' : 'Active Outage'}</span>
                     Automated Analysis: Website was marked DOWN due to &quot;{inc.message}&quot;.
                   </div>
                 </div>
               );
            })}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
