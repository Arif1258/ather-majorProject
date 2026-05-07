'use client';

import { GlassCard } from "@/components/ui/GlassCard";
import { TerminalSquare, CornerDownRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TerminalLine {
  id: number;
  text: string;
  type: "command" | "output" | "error" | "system";
}

export default function TroubleshootingConsole() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 1, text: "AetherMonitor Diagnostic Console v2.0.1", type: "system" },
    { id: 2, text: "Type 'help' to see available commands.", type: "system" },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const cmd = input.trim();
    setInput("");
    
    setLines(prev => [...prev, { id: Date.now(), text: `aether-cli > ${cmd}`, type: "command" }]);
    setIsProcessing(true);

    // Command Router
    const lowerCmd = cmd.toLowerCase();
    
    if (lowerCmd === "help") {
      setTimeout(() => {
        setLines(prev => [...prev, 
          { id: Date.now()+1, text: "Available commands:", type: "output" },
          { id: Date.now()+2, text: "  ping <domain>      - Check latency recursively", type: "output" },
          { id: Date.now()+3, text: "  traceroute <host>  - Edge routing visualization", type: "output" },
          { id: Date.now()+4, text: "  clear              - Clear console", type: "output" },
        ]);
        setIsProcessing(false);
      }, 300);
      return;
    }

    if (lowerCmd === "clear") {
      setLines([]);
      setIsProcessing(false);
      return;
    }

    if (lowerCmd.startsWith("ping ")) {
      const target = lowerCmd.split(" ")[1];
      let pings = 0;
      
      const interval = setInterval(() => {
        pings++;
        const time = Math.floor(Math.random() * 20) + 15; // 15-35ms
        setLines(prev => [...prev, { 
          id: Date.now(), 
          text: `64 bytes from ${target}: icmp_seq=${pings} ttl=115 time=${time} ms`, 
          type: "output" 
        }]);

        if (pings >= 4) {
          clearInterval(interval);
          setLines(prev => [...prev, { 
            id: Date.now(), 
            text: `--- ${target} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss`, 
            type: "system" 
          }]);
          setIsProcessing(false);
        }
      }, 800);
      return;
    }

    // Default error
    setTimeout(() => {
      setLines(prev => [...prev, { id: Date.now(), text: `Command not found: ${cmd}`, type: "error" }]);
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto mt-4 h-[calc(100vh-180px)] animate-in fade-in zoom-in-95 duration-1000 flex flex-col">
      <div className="mb-6">
        <h1 className="text-4xl font-light tracking-tight text-white mb-2">Diagnostic <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-brand-cyan">Console</span></h1>
        <p className="text-white/50 text-sm tracking-widest">LIVE EDGE TROUBLESHOOTING</p>
      </div>

      <GlassCard className="flex-1 flex flex-col overflow-hidden min-h-0 border-green-400/20" glowColor="none">
        
        {/* Terminal Header */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
          <TerminalSquare className="w-5 h-5 text-green-400" />
          <span className="text-sm font-mono text-white/70">root@aether-edge-iad1:~</span>
        </div>

        {/* Output Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto font-mono text-sm space-y-2 mb-4 pr-4 custom-scrollbar"
        >
          {lines.map(line => (
            <div 
              key={line.id} 
              className={`whitespace-pre-wrap ${
                line.type === "command" ? "text-white font-semibold" : 
                line.type === "error" ? "text-red-400" : 
                line.type === "system" ? "text-brand-cyan/70" : 
                "text-green-400"
              }`}
            >
              {line.text}
            </div>
          ))}
          {isProcessing && (
            <div className="text-green-400 animate-pulse">_</div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleCommand} className="flex items-center gap-2 border-t border-white/10 pt-4 mt-auto">
          <CornerDownRight className="w-4 h-4 text-brand-cyan" />
          <span className="text-brand-cyan font-mono font-bold">aether-cli &gt;</span>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            autoFocus
            autoComplete="off"
            spellCheck="false"
            className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-white/20"
          />
        </form>

      </GlassCard>
    </div>
  );
}
