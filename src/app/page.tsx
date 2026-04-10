'use client';

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SystemHealthBanner, SummaryCards } from "@/components/dashboard/SummaryCards";
import { ActiveIssues } from "@/components/dashboard/ActiveIssues";
import { InsightsAndActivity, QuickActions } from "@/components/dashboard/InsightsAndActivity";
import { RegionAndIncidents } from "@/components/dashboard/RegionAndIncidents";
import { GlobalEdgeMap } from "@/components/ui/GlobalEdgeMap";
import { InstantCheck } from "@/components/ui/InstantCheck";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
       <div className="flex items-center justify-center min-h-[80vh]">
         <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
       </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-1000 pb-20 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-white mb-2">Global <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-brand-purple">Infrastructure</span></h1>
          <p className="text-white/50 text-sm tracking-widest">REAL-TIME EDGE TELEMETRY</p>
        </div>
      </div>

      {/* System Health Banner */}
      <SystemHealthBanner status={data.systemStatus} />

      {/* Quick Actions Row */}
      <QuickActions />

      {/* Summary Cards */}
      <SummaryCards stats={data.summary} trend={data.trend.responseTimes} />

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left Col (2/3 width) - Insights & Activities */}
         <div className="lg:col-span-2 space-y-6">
            <InsightsAndActivity insights={data.insights} recentActivity={data.recentActivity} />
            <RegionAndIncidents regionData={data.regionalSnapshot} lastIncident={data.lastIncident} />
         </div>

         {/* Right Col (1/3 width) - Active Issues & Quick Check */}
         <div className="lg:col-span-1 space-y-6 flex flex-col">
            <div className="h-[400px] shrink-0">
               <ActiveIssues issues={data.activeIssues} />
            </div>
            <div className="flex-1">
               <InstantCheck />
            </div>
         </div>
      </div>

      {/* Edge Map (Full Width) */}
      <div className="pt-6">
         <GlobalEdgeMap />
      </div>

    </div>
  );
}
