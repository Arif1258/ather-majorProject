'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Use springs for smooth following effect
  const springConfig = { damping: 25, stiffness: 150 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX - 150); // Offset to center the glow (300/2)
      cursorY.set(e.clientY - 150);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Specular Highlight / Light Source */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 w-[300px] h-[300px] rounded-full z-[100]"
        style={{
          x: cursorX,
          y: cursorY,
          background: 'radial-gradient(circle, rgba(0, 245, 255, 0.15) 0%, rgba(157, 0, 255, 0.05) 40%, transparent 70%)',
          filter: 'blur(40px)',
          mixBlendMode: 'screen'
        }}
      />
    </>
  );
}
