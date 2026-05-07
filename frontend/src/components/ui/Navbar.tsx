'use client';

import Link from "next/link";
import { Activity, ShieldAlert, BarChart3, Settings, PieChart, Monitor, LogOut, User as UserIcon, Server } from "lucide-react";
import { useAuth } from "@/lib/useAuth";

export function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-center mt-6 z-50 px-4">
      <div className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-x-auto whitespace-nowrap hide-scrollbar">
        <Link href="/" className="flex items-center gap-2 group">
          <Activity className="w-5 h-5 text-brand-cyan group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium tracking-wider text-white/80 group-hover:text-white transition-colors hidden md:block">
            DASHBOARD
          </span>
        </Link>
        
        {user && (
          <>
            <div className="w-[1px] h-5 bg-white/20 hidden md:block" />
            <Link href="/analytics" className="flex items-center gap-2 group">
               <PieChart className="w-5 h-5 text-brand-purple group-hover:scale-110 transition-transform" />
               <span className="text-sm font-medium tracking-wider text-white/80 group-hover:text-white transition-colors hidden md:block">
                 ANALYTICS
               </span>
            </Link>
            <div className="w-[1px] h-5 bg-white/20 hidden md:block" />
            <Link href="/monitoring" className="flex items-center gap-2 group">
              <Monitor className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium tracking-wider text-white/80 group-hover:text-white transition-colors hidden md:block">
                MONITORING
              </span>
            </Link>
            <div className="w-[1px] h-5 bg-white/20 hidden md:block" />
            <Link href="/system" className="flex items-center gap-2 group">
              <Server className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium tracking-wider text-white/80 group-hover:text-white transition-colors hidden md:block">
                SYSTEM
              </span>
            </Link>
            <div className="w-[1px] h-5 bg-white/20 hidden md:block" />
            <Link href="/settings" className="flex items-center gap-2 group">
              <Settings className="w-5 h-5 text-white/60 group-hover:text-white group-hover:scale-110 transition-all group-hover:rotate-90" />
              <span className="text-sm font-medium tracking-wider text-white/80 group-hover:text-white transition-colors hidden md:block">
                SETTINGS
              </span>
            </Link>
          </>
        )}

        <div className="w-[1px] h-5 bg-white/20 mx-2" />

        {!loading && (
           user ? (
             <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                <div className="flex items-center gap-2">
                   <div className="bg-brand-cyan/20 p-1.5 rounded-full border border-brand-cyan/30">
                      <UserIcon className="w-3 h-3 text-brand-cyan" />
                   </div>
                   <span className="text-xs font-semibold text-white/80">Welcome, {user.name.split(' ')[0]}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors border border-transparent hover:border-red-400/30 ml-2"
                  title="Logout"
                >
                   <LogOut className="w-3 h-3" />
                </button>
             </div>
           ) : (
             <div className="flex items-center gap-3 pl-2">
                <Link href="/login" className="text-xs font-semibold text-white/70 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/register" className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-colors">
                  Register
                </Link>
             </div>
           )
        )}
      </div>
    </nav>
  );
}
