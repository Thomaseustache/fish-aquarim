import React from 'react';
import { FoodPellet as FoodPelletType } from '../types/aquarium';

interface FoodPelletProps {
  food: FoodPelletType;
}

export function FoodPellet({ food }: FoodPelletProps) {
  return (
    <div
      className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-md"
      style={{
        transform: `translate(${food.position.x}px, ${food.position.y}px)`,
        transition: 'transform 0.1s linear',
      }}
    />
  );
}