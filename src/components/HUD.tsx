import React from 'react';
import { Timer } from './Timer';
import { Coins, Fish as FishIcon, Clock, DollarSign, Timer as TimerIcon } from 'lucide-react';

interface HUDProps {
  gameTime: number;
  fishCount: number;
  nextFishTime: number;
  credits: number;
  foodCost: number;
  nextBaseCredit: number;
  nextFishCredit: number;
}

export function HUD({ 
  gameTime, 
  fishCount, 
  nextFishTime, 
  credits, 
  foodCost,
  nextBaseCredit,
  nextFishCredit
}: HUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 pointer-events-none">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <Timer seconds={gameTime} />
        </div>
        <div className="flex items-center gap-2">
          <FishIcon className="w-5 h-5" />
          <span>{fishCount} fish</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span>Next fish: {nextFishTime}s</span>
        </div>
      </div>
      
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white space-y-3">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span>{credits} credits</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          <span>Food cost: {foodCost}</span>
        </div>
        <div className="flex items-center gap-2">
          <TimerIcon className="w-5 h-5 text-blue-400" />
          <span>Base credit: {nextBaseCredit}s</span>
        </div>
        <div className="flex items-center gap-2">
          <TimerIcon className="w-5 h-5 text-purple-400" />
          <span>Fish bonus: {nextFishCredit}s</span>
        </div>
      </div>
    </div>
  );
}