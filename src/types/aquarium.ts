export interface Position {
  x: number;
  y: number;
}

export interface Fish {
  id: string;
  position: Position;
  velocity: Position;
  direction: 'left' | 'right';
  type: 'red' | 'blue';
  targetFood?: Position;
  hunger: number; // 100 = full, 0 = starving
  lastFed: number; // timestamp
}

export interface FoodPellet {
  id: string;
  position: Position;
  velocity: Position;
}

export interface GameStats {
  credits: number;
  lastCreditUpdate: number;
}