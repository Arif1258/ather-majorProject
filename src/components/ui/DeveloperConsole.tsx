import { useEffect, useState } from 'react';
import { Terminal, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface LogEntry {
  _id: string;
  timestamp: string;
  message: string;
  severity: 'Info' | 'Warning' | 'Critical';
  source: string;
}

export function DeveloperConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        if (data.success) setLogs(data.data);
      } catch (e) {}
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'Warning': return <AlertTriangle className="w-3 h-3 text-amber-500" />;
      case 'Critical': return <AlertOctagon className="w-3 h-3 text-red-500 animate-pulse" />;
      default: return <Info className="w-3 h-3 text-brand-cyan" />;
    }
  };

  const getColor = (severity: string) => {
    switch (severity) {
      case 'Warning': return 'text-amber-500';
      case 'Critical': return 'text-red-500';
      default: return 'text-white/70';
    }
  };

  return (
    <GlassCard className="h-[300px] flex flex-col font-mono text-xs overflow-hidden" glowColor="none">
      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
        <Terminal className="w-4 h-4 text-brand-cyan" />
        <span className="text-white/60 font-semibold tracking-wider">DEV CONSOLE</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-white/30 italic">No logs available...</div>
        ) : (
          logs.map(log => (
            <div key={log._id} className="flex items-start gap-2 group">
              <span className="text-white/30 whitespace-nowrap">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="mt-0.5">{getIcon(log.severity)}</span>
              <span className={`${getColor(log.severity)} group-hover:text-white transition-colors`}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
