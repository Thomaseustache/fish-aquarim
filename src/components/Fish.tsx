import React from 'react';
import { Fish as FishType } from '../types/aquarium';

const FISH_SPRITES = {
  red: 'https://i.imgur.com/ceptdPS.gif',
  blue: 'https://i.imgur.com/yIYQzWM.gif',
};

interface FishProps {
  fish: FishType;
}

export function Fish({ fish }: FishProps) {
  const rotation = Math.atan2(fish.velocity.y, Math.abs(fish.velocity.x)) * (180 / Math.PI);
  const clampedRotation = Math.max(-30, Math.min(30, rotation));

  return (
    <div className="absolute" style={{
      transform: `translate(${fish.position.x}px, ${fish.position.y}px)`,
    }}>
      <img
        src={FISH_SPRITES[fish.type]}
        alt={`${fish.type} fish`}
        className="w-[30px] h-[30px] image-rendering-pixel"
        style={{
          transform: `scaleX(${fish.direction === 'left' ? -1 : 1}) rotate(${clampedRotation}deg)`,
          transformOrigin: 'center',
          transition: 'transform 0.2s ease-out',
          opacity: Math.max(0.4, fish.hunger / 100), // Fish becomes more transparent when hungry
        }}
      />
      <div className="absolute -top-2 left-0 w-full h-1 bg-black/20 rounded">
        <div 
          className="h-full rounded transition-all duration-300"
          style={{
            width: `${fish.hunger}%`,
            backgroundColor: fish.hunger > 50 ? '#22c55e' : fish.hunger > 20 ? '#eab308' : '#ef4444'
          }}
        />
      </div>
    </div>
  );
}