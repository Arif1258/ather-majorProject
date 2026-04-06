import Link from "next/link";
import { Activity, ShieldAlert, BarChart3, Settings, TerminalSquare } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full flex justify-center mt-6 z-50 px-4">
      <div className="flex items-center gap-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-x-auto whitespace-nowrap hide-scrollbar">
        <Link href="/" className="flex items-center gap-2 group">
          <Activity className="w-5 h-5 text-brand-cyan group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium tracking-wider text-white/80 group-hover:text-white transition-colors hidden md:block">
            DASHBOARD
          </span>
        </Link>
        <div className="w-[1px] h-5 bg-white/20 mx-2 hidden md:block" />
        <Link href="/incidents" className="flex items-center gap-2 group">
          <ShieldAlert className="w-5 h-5 text-brand-purple group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium tracking-wider text-white/80 group-hover:text-white transition-colors hidden md:block">
            INCIDENTS
          </span>
        </Link>
        <div className="w-[1px] h-5 bg-white/20 mx-2 hidden md:block" />
        <Link href="/status/system" className="flex items-center gap-2 group">
          <BarChart3 className="w-5 h-5 text-white/60 group-hover:text-brand-cyan group-hover:scale-110 transition-all" />
          <span className="text-sm font-medium tracking-wider text-white/80 group-hover:text-white transition-colors hidden md:block">
            STATUS
          </span>
        </Link>
        <div className="w-[1px] h-5 bg-white/20 mx-2 hidden md:block" />
        <Link href="/console" className="flex items-center gap-2 group">
          <TerminalSquare className="w-5 h-5 text-green-400 group-hover:scale-110 transition-all" />
          <span className="text-sm font-medium tracking-wider text-white/80 group-hover:text-white transition-colors hidden md:block">
            CONSOLE
          </span>
        </Link>
        <div className="w-[1px] h-5 bg-white/20 mx-2 hidden md:block" />
        <Link href="/settings/notifications" className="flex items-center gap-2 group">
          <Settings className="w-5 h-5 text-white/60 group-hover:text-white group-hover:scale-110 transition-all group-hover:rotate-90" />
        </Link>
      </div>
    </nav>
  );
}
