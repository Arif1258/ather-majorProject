import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  containerClassName?: string;
  glowColor?: "cyan" | "purple" | "none";
}

export function GlassCard({ 
  children, 
  className, 
  containerClassName,
  glowColor = "none",
  ...props 
}: GlassCardProps) {
  
  const glowVariants = {
    cyan: "shadow-[inset_0_1px_1px_rgba(0,245,255,0.1),0_8px_32px_rgba(0,0,0,0.5)] border-brand-cyan/20",
    purple: "shadow-[inset_0_1px_1px_rgba(157,0,255,0.1),0_8px_32px_rgba(0,0,0,0.5)] border-brand-purple/20",
    none: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)] border-white/5",
  };

  return (
    <div className={cn(
      "relative p-[1px] overflow-hidden rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-white/5", 
      containerClassName
    )}>
      <div 
        className={cn(
          "bg-black/40 backdrop-blur-[25px] saturate-[180%] rounded-[23px] p-6 h-full transition-all duration-300",
          glowVariants[glowColor],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
