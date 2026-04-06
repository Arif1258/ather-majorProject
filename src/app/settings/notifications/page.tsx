'use client';

import { GlassCard } from "@/components/ui/GlassCard";
import { Link2, Bell, Send, Mail } from "lucide-react";
import { useState } from "react";

export default function NotificationSettings() {
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [email, setEmail] = useState("");
  const [sendingState, setSendingState] = useState<"idle" | "loading" | "success">("idle");

  const handleTestAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setSendingState("loading");
    setTimeout(() => {
      setSendingState("success");
      setTimeout(() => setSendingState("idle"), 2000);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-1000">
      <div>
        <h1 className="text-4xl font-light tracking-tight text-white mb-2">Notification <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">Dispatcher</span></h1>
        <p className="text-white/50 text-sm tracking-widest">CONFIGURE AETHER VISION AI ALERTS</p>
      </div>

      <form onSubmit={handleTestAlert} className="space-y-6">
        
        <GlassCard glowColor="purple" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-full bg-[#5865F2]/20 flex items-center justify-center border border-[#5865F2]/30">
               <svg className="w-5 h-5 fill-[#5865F2]" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.16,46,96.06,53,91.08,65.69,84.69,65.69Z"/>
                </svg>
            </div>
            <div>
              <h2 className="text-white font-medium">Discord Webhook integration</h2>
              <p className="text-xs text-white/50">Send real-time latency alerts to a Discord channel.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-white/70 mb-2">WEBHOOK URL</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                <input 
                  type="url" 
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..." 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard glowColor="none" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Mail className="w-5 h-5 text-white/60" />
            </div>
            <div>
              <h2 className="text-white font-medium">Email Alerts</h2>
              <p className="text-xs text-white/50">Send critical degradation alerts straight to your inbox.</p>
            </div>
          </div>

           <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-white/70 mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@myapp.com" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end gap-4 mt-8">
          <button type="button" className="px-6 py-3 rounded-full text-white/70 font-medium text-sm hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            type="submit"
            disabled={sendingState === "loading" || (!discordWebhook && !email)}
            className="group relative flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-semibold text-sm hover:bg-brand-cyan transition-all disabled:opacity-50 disabled:hover:bg-white"
          >
            {sendingState === "loading" ? (
              <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : sendingState === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4 group-hover:animate-[wiggle_1s_ease-in-out_infinite]" />
            )}
            {sendingState === "loading" ? 'Sending...' : sendingState === "success" ? 'Alert Sent!' : 'Save & Test Alert'}
          </button>
        </div>

      </form>
    </div>
  );
}
