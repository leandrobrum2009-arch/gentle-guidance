import React, { useMemo } from "react";
import { motion } from "framer-motion";

const Particles = ({ count = 30 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
      moveX: Math.random() * 100 - 50,
      moveY: Math.random() * 100 - 50,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            x: `${p.initialX}%`, 
            y: `${p.initialY}%`, 
            opacity: 0 
          }}
          animate={{ 
            x: [`${p.initialX}%`, `${p.initialX + p.moveX}%`, `${p.initialX}%`], 
            y: [`${p.initialY}%`, `${p.initialY + p.moveY}%`, `${p.initialY}%`],
            opacity: [0, 0.4, 0]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay,
            ease: "easeInOut"
          }}
          className="absolute rounded-full bg-primary blur-[1px]"
          style={{ 
            width: p.size, 
            height: p.size,
            boxShadow: `0 0 10px hsl(var(--primary))`
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
