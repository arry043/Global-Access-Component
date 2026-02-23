import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AnimatedArcsProps {
  start: [number, number];
  end1: [number, number];
  end2: [number, number];
  projection: (coords: [number, number]) => [number, number] | null;
}

const AnimatedArcs: React.FC<AnimatedArcsProps> = ({ start, end1, end2, projection }) => {
  const controls = useAnimation();

  const startPoint = projection(start);
  const end1Point = projection(end1);
  const end2Point = projection(end2);

  useEffect(() => {
    const sequence = async () => {
      // Endless loop
      while (true) {
        
        await controls.set({ pathLength: 0, opacity: 1 });
        await controls.set("hidden");

        // 1. Draw to UAE
        await controls.start("draw1");
        
        // 2. UAE Dot appears
        await controls.start("showDot1");

        // 3. Draw to USA
        await controls.start("draw2");

        // 4. USA Dot appears
        await controls.start("showDot2");

        // Pause
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Fade out
        await controls.start({ opacity: 0, transition: { duration: 1 } });
      }
    };

    if (startPoint && end1Point && end2Point) {
      sequence();
    }
  }, [controls, startPoint, end1Point, end2Point]);

  if (!startPoint || !end1Point || !end2Point) return null;

  // Calculate curve paths
  const calculatePath = (p1: [number, number], p2: [number, number], curveOffset = 0.3) => {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    
    // Create an arching curve
    const cx = p1[0] + dx * 0.5 - dy * curveOffset;
    const cy = p1[1] + dy * 0.5 + dx * curveOffset;
    
    return `M ${p1[0]} ${p1[1]} Q ${cx} ${cy} ${p2[0]} ${p2[1]}`;
  };

  const path1 = calculatePath(startPoint, end1Point, 0.2);
  const path2 = calculatePath(startPoint, end2Point, 0.4); // slightly more curve for longer distance

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
      {/* UAE Path */}
      <motion.path
        d={path1}
        fill="transparent"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeDasharray="4 4"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={controls}
        variants={{
          draw1: { 
            pathLength: 1, 
            transition: { duration: 1.5, ease: "easeInOut" } 
          }
        }}
        style={{ strokeDashoffset: 0 }}
      />
      
      {/* UAE Dot */}
      <motion.circle
        cx={end1Point[0]}
        cy={end1Point[1]}
        r={4}
        fill="var(--accent)"
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { scale: 0, opacity: 0 },
          showDot1: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }
        }}
      />

      {/* USA Path */}
      <motion.path
        d={path2}
        fill="transparent"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeDasharray="4 4"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={controls}
        variants={{
          draw2: { 
            pathLength: 1, 
            transition: { duration: 2, ease: "easeInOut" } 
          }
        }}
      />

      {/* USA Dot */}
      <motion.circle
        cx={end2Point[0]}
        cy={end2Point[1]}
        r={4}
        fill="var(--accent)"
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { scale: 0, opacity: 0 },
          showDot2: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }
        }}
      />
    </svg>
  );
};

export default AnimatedArcs;
