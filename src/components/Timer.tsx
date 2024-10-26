import React from 'react';

interface TimerProps {
  seconds: number;
}

export function Timer({ seconds }: TimerProps) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formatNumber = (num: number): string => num.toString().padStart(2, '0');

  return (
    <span className="font-mono">
      {formatNumber(hours)}:{formatNumber(minutes)}:{formatNumber(remainingSeconds)}
    </span>
  );
}