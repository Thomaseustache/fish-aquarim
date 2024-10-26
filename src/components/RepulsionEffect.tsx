import React, { useEffect, useState } from 'react';
import { Position } from '../types/aquarium';

interface RepulsionEffectProps {
  position: Position;
}

export function RepulsionEffect({ position }: RepulsionEffectProps) {
  const [opacity, setOpacity] = useState(0.4);

  useEffect(() => {
    const animation = requestAnimationFrame(() => {
      setOpacity(prev => Math.max(0, prev - 0.02));
    });

    return () => cancelAnimationFrame(animation);
  }, [opacity]);

  return (
    <div
      className="absolute w-[200px] h-[200px] rounded-full transition-transform duration-300"
      style={{
        transform: `translate(${position.x - 100}px, ${position.y - 100}px)`,
        background: `radial-gradient(circle, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,0) 70%)`,
        pointerEvents: 'none',
      }}
    />
  );
}