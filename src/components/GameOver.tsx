import React from 'react';
import { Timer } from './Timer';

interface GameOverProps {
  seconds: number;
  maxFishReached: number;
  onRestart: () => void;
}

export function GameOver({ seconds, maxFishReached, onRestart }: GameOverProps) {
  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-3xl font-bold mb-4">Game Over</h2>
        <div className="space-y-4 mb-6">
          <p className="text-xl">Survival Time: <Timer seconds={seconds} /></p>
          <p className="text-xl">Peak Fish Count: {maxFishReached}</p>
        </div>
        <button
          onClick={onRestart}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}