'use client';

import { motion } from 'framer-motion';

export function MeshBackground() {
  return (
    <div className="fixed inset-0 min-h-screen z-[-1] overflow-hidden bg-background pointer-events-none">
      {/* Cyan Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-cyan/20 blur-[120px] mix-blend-screen"
      />
      
      {/* Purple Glow */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-purple/20 blur-[150px] mix-blend-screen"
      />
      
      {/* Ambient center faint glow */}
      <motion.div
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-white/5 blur-[100px] mix-blend-screen"
      />
    </div>
  );
}
