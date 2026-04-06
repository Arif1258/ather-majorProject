'use client';
import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";

interface EdgeNode {
  id: string;
  name: string;
  x: string;
  y: string;
  pingMs: number;
}

const mockNodes: EdgeNode[] = [
  { id: "iad", name: "US East (N. Virginia)", x: "25%", y: "40%", pingMs: 12 },
  { id: "sfo", name: "US West (N. California)", x: "15%", y: "45%", pingMs: 45 },
  { id: "gru", name: "South America (São Paulo)", x: "32%", y: "75%", pingMs: 89 },
  { id: "lhr", name: "Europe (London)", x: "47%", y: "35%", pingMs: 24 },
  { id: "fra", name: "Europe (Frankfurt)", x: "50%", y: "38%", pingMs: 22 },
  { id: "hnd", name: "Asia Pacific (Tokyo)", x: "85%", y: "42%", pingMs: 124 },
  { id: "sin", name: "Asia Pacific (Singapore)", x: "78%", y: "60%", pingMs: 156 },
  { id: "syd", name: "Asia Pacific (Sydney)", x: "88%", y: "80%", pingMs: 198 },
];

export function GlobalEdgeMap() {
  return (
    <GlassCard glowColor="none" className="h-[400px] flex flex-col relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-[length:100%_auto] bg-center bg-no-repeat opacity-5" />
      
      <div className="relative z-10 flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-white">Edge Global Resolution</h2>
        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs tracking-widest text-brand-cyan">LIVE TELEMETRY</span>
      </div>

      <div className="relative flex-1 w-full h-full">
        {mockNodes.map((node) => {
          // Determine color based on ping
          let colorClass = "bg-brand-cyan shadow-[0_0_15px_#00F5FF]";
          let pingColor = "text-brand-cyan";
          let pulseColor = "bg-brand-cyan";
          
          if (node.pingMs > 80 && node.pingMs < 150) {
            colorClass = "bg-amber-400 shadow-[0_0_15px_#fbbf24]";
            pingColor = "text-amber-400";
            pulseColor = "bg-amber-400";
          } else if (node.pingMs >= 150) {
            colorClass = "bg-brand-purple shadow-[0_0_15px_#9D00FF]";
            pingColor = "text-brand-purple";
            pulseColor = "bg-brand-purple";
          }

          return (
            <motion.div
              key={node.id}
              className="absolute group/node flex flex-col items-center"
              style={{ left: node.x, top: node.y }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.random() * 0.5, duration: 0.5 }}
            >
              <div className="relative flex items-center justify-center">
                {/* Ping Pulse */}
                <span className={`absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-20 animate-ping duration-1000`} />
                <div className={`w-3 h-3 rounded-full ${colorClass} z-10`} />
              </div>
              
              {/* Tooltip */}
              <div className="hidden group-hover/node:flex absolute top-4 left-1/2 -translate-x-1/2 flex-col items-center z-20 w-max pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2 mt-2 shadow-2xl">
                  <p className="text-xs text-white/70 font-semibold">{node.name}</p>
                  <p className={`text-sm font-bold ${pingColor}`}>{node.pingMs}ms</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
