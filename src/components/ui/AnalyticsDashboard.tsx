'use client';

import { useState } from 'react';
import { Filter, ChevronRight } from 'lucide-react';
import { 
  SmoothedResponseTimeChart, 
  LatencyDistributionChart, 
  HealthScoreTrend, 
  RegionBarChart, 
  FailureFrequencyChart, 
  ErrorBreakdownDonut,
  UptimeStreakCard,
  IncidentTimeline
} from './AnalyticsCharts';

export function AnalyticsDashboard({ initialSites, preselectedWebsiteId }: { initialSites: { id: string, name: string }[], preselectedWebsiteId: string }) {
  const [websiteId, setWebsiteId] = useState(preselectedWebsiteId);
  const [timeRange, setTimeRange] = useState('1h');
  const [isAdvanced, setIsAdvanced] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-1000 max-w-[1600px] mx-auto pt-20">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-white mb-2">Deep <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-brand-purple">Analytics</span></h1>
          <p className="text-white/50 text-sm tracking-widest">AGGREGATED TELEMETRY PROJECTIONS</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 px-3 border-r border-white/10">
             <Filter className="w-4 h-4 text-white/50" />
             <span className="text-xs font-medium text-white/50">FILTERS</span>
          </div>
          
          <select 
            value={websiteId}
            onChange={(e) => setWebsiteId(e.target.value)}
            className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-black text-white">All Infrastructure</option>
            {initialSites.map(s => (
              <option key={s.id} value={s.id} className="bg-black text-white">{s.name}</option>
            ))}
          </select>

          <div className="flex bg-white/5 rounded-lg p-1 gap-1">
            {['1h', '24h', '7d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${timeRange === range ? 'bg-brand-cyan text-black shadow-[0_0_10px_rgba(0,255,255,0.2)]' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button onClick={() => setIsAdvanced(!isAdvanced)} className="ml-2 flex items-center gap-2 px-3 py-1.5 border-l border-white/10 text-xs font-semibold transition-colors">
            <span className={!isAdvanced ? 'text-brand-purple' : 'text-white/40'}>Simple</span>
            <span className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${isAdvanced ? 'bg-brand-purple/50' : 'bg-white/10'}`}>
               <span className={`w-3 h-3 bg-white rounded-full shadow-md transition-transform ${isAdvanced ? 'translate-x-4' : 'translate-x-0'}`} />
            </span>
            <span className={isAdvanced ? 'text-brand-purple' : 'text-white/40'}>Advanced</span>
          </button>
        </div>
      </div>

      {/* Primary Streak Hero */}
      <UptimeStreakCard websiteId={websiteId} timeRange={timeRange} />

      {/* Grid Layouts - Max 2 cols per row */}
      <div className="space-y-12">
        
        {/* ROW 1: PERFORMANCE */}
        <div>
           <div className="flex items-center gap-2 mb-4">
              <ChevronRight className="w-4 h-4 text-brand-cyan" />
              <h2 className="text-xl font-semibold text-white tracking-wide">Performance Metrics</h2>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SmoothedResponseTimeChart websiteId={websiteId} timeRange={timeRange} />
              {isAdvanced && <LatencyDistributionChart websiteId={websiteId} timeRange={timeRange} />}
           </div>
        </div>

        {/* ROW 2: RELIABILITY */}
        <div>
           <div className="flex items-center gap-2 mb-4">
              <ChevronRight className="w-4 h-4 text-green-400" />
              <h2 className="text-xl font-semibold text-white tracking-wide">Reliability Engineering</h2>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HealthScoreTrend websiteId={websiteId} timeRange={timeRange} />
              {isAdvanced && <RegionBarChart websiteId={websiteId} timeRange={timeRange} />}
           </div>
        </div>

        {/* ROW 3: ERRORS */}
        <div>
           <div className="flex items-center gap-2 mb-4">
              <ChevronRight className="w-4 h-4 text-red-400" />
              <h2 className="text-xl font-semibold text-white tracking-wide">Error Diagnostics</h2>
           </div>
           <div className={`grid grid-cols-1 ${isAdvanced ? 'lg:grid-cols-2' : ''} gap-6 ${!isAdvanced ? '' : 'pb-20'}`}>
              <FailureFrequencyChart websiteId={websiteId} timeRange={timeRange} />
              {isAdvanced && <ErrorBreakdownDonut websiteId={websiteId} timeRange={timeRange} />}
           </div>
        </div>

        {/* ROW 4: INCIDENTS */}
        {!isAdvanced && (
           <div>
              <div className="flex items-center gap-2 mb-4">
                 <ChevronRight className="w-4 h-4 text-white/50" />
                 <h2 className="text-xl font-semibold text-white tracking-wide">Recent Incidents</h2>
              </div>
              <div className="pb-20">
                 <IncidentTimeline websiteId={websiteId} timeRange={timeRange} />
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
