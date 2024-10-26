import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Fish as FishType, FoodPellet as FoodPelletType, Position, GameStats } from '../types/aquarium';
import { Fish } from './Fish';
import { FoodPellet } from './FoodPellet';
import { WaterBackground } from './WaterBackground';
import { Timer } from './Timer';
import { GameOver } from './GameOver';
import { HUD } from './HUD';
import { usePhysics } from '../hooks/usePhysics';
import { RepulsionEffect } from './RepulsionEffect';

const FISH_TYPES = ['red', 'blue'] as const;
const INITIAL_FISH_COUNT = 3;
const MAX_FISH_COUNT = 50;
const FISH_SPAWN_INTERVAL = 20;
const INITIAL_MOVEMENT_SPEED = 2;
const FOOD_SINK_SPEED = 0.5;
const VERSION = '0.1.0';
const HUNGER_DECREASE_RATE = 0.5;
const FOOD_RESTORE_AMOUNT = 25;
const CRITICAL_HUNGER_THRESHOLD = 20;
const HUNGER_UPDATE_INTERVAL = 500;
const FOOD_COST = 5;
const BASE_CREDIT_INTERVAL = 30; // Base credit every 30 seconds
const FISH_CREDIT_INTERVAL = 60; // Fish bonus credits every 60 seconds
const INITIAL_CREDITS = 30;
const REPULSION_DURATION = 1000;

export function Aquarium() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fish, setFish] = useState<FishType[]>([]);
  const [food, setFood] = useState<FoodPelletType[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [maxFishReached, setMaxFishReached] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [nextFishTime, setNextFishTime] = useState(FISH_SPAWN_INTERVAL);
  const [repulsionEffect, setRepulsionEffect] = useState<Position | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    credits: INITIAL_CREDITS,
    lastCreditUpdate: Date.now(),
  });

  const { updateFishPositions, updateFoodPositions } = usePhysics();

  const createFish = useCallback((count: number = 1) => {
    const container = containerRef.current;
    if (!container) return;

    const newFish: FishType[] = Array.from({ length: count }, () => ({
      id: Math.random().toString(36).substring(7),
      position: {
        x: Math.random() * (container.clientWidth - 30),
        y: Math.random() * (container.clientHeight - 30),
      },
      velocity: {
        x: (Math.random() - 0.5) * INITIAL_MOVEMENT_SPEED,
        y: (Math.random() - 0.5) * INITIAL_MOVEMENT_SPEED,
      },
      direction: Math.random() > 0.5 ? 'left' : 'right',
      type: FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)],
      hunger: 100,
      lastFed: Date.now(),
    }));

    setFish(prev => [...prev, ...newFish]);
  }, []);

  const handleFoodEaten = useCallback((foodId: string, fishId: string) => {
    setFood(prev => prev.filter(f => f.id !== foodId));
    setFish(prev => prev.map(f => {
      if (f.id === fishId) {
        const newHunger = f.hunger <= CRITICAL_HUNGER_THRESHOLD ? 100 : Math.min(100, f.hunger + FOOD_RESTORE_AMOUNT);
        return {
          ...f,
          hunger: newHunger,
          lastFed: Date.now(),
        };
      }
      return f;
    }));
  }, []);

  const addFood = useCallback((x: number, y: number) => {
    if (gameStats.credits >= FOOD_COST) {
      setFood(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        position: { x, y },
        velocity: { x: 0, y: FOOD_SINK_SPEED },
      }]);
      setGameStats(prev => ({
        ...prev,
        credits: prev.credits - FOOD_COST,
      }));
    }
  }, [gameStats.credits]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addFood(x, y);
  }, [addFood]);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setRepulsionEffect({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setTimeout(() => setRepulsionEffect(null), REPULSION_DURATION);
  }, []);

  useEffect(() => {
    createFish(INITIAL_FISH_COUNT);
  }, [createFish]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);
      setNextFishTime(prev => {
        if (prev <= 0 && fish.length < MAX_FISH_COUNT) {
          createFish(1);
          return FISH_SPAWN_INTERVAL;
        }
        return prev - 1;
      });

      // Add base credit every 30 seconds
      if (gameTime > 0 && gameTime % BASE_CREDIT_INTERVAL === 0) {
        setGameStats(prev => ({
          ...prev,
          credits: prev.credits + 1,
        }));
      }

      // Add fish bonus credits every minute
      if (gameTime > 0 && gameTime % FISH_CREDIT_INTERVAL === 0) {
        setGameStats(prev => ({
          ...prev,
          credits: prev.credits + fish.length,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createFish, fish.length, gameTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFish(prev => {
        const updatedFish = prev.map(f => ({
          ...f,
          hunger: Math.max(0, f.hunger - HUNGER_DECREASE_RATE),
        }));
        
        const livingFish = updatedFish.filter(f => f.hunger > 0);
        if (livingFish.length === 0 && prev.length > 0) {
          setIsGameOver(true);
        }
        return livingFish;
      });
    }, HUNGER_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMaxFishReached(prev => Math.max(prev, fish.length));
  }, [fish.length]);

  useEffect(() => {
    if (!containerRef.current) return;

    const frameLoop = () => {
      setFish(prev => 
        updateFishPositions(
          prev,
          food,
          containerRef.current!.clientWidth,
          containerRef.current!.clientHeight,
          handleFoodEaten,
          repulsionEffect
        )
      );
      setFood(prev =>
        updateFoodPositions(
          prev,
          containerRef.current!.clientHeight
        )
      );
      animationFrame = requestAnimationFrame(frameLoop);
    };

    let animationFrame = requestAnimationFrame(frameLoop);
    return () => cancelAnimationFrame(animationFrame);
  }, [food, handleFoodEaten, repulsionEffect, updateFishPositions, updateFoodPositions]);

  const handleRestart = useCallback(() => {
    setFish([]);
    setFood([]);
    setGameTime(0);
    setMaxFishReached(0);
    setIsGameOver(false);
    setGameStats({
      credits: INITIAL_CREDITS,
      lastCreditUpdate: Date.now(),
    });
    createFish(INITIAL_FISH_COUNT);
  }, [createFish]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        ref={containerRef}
        className="relative w-full h-full cursor-pointer"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <WaterBackground />
        <div className="relative z-20">
          {food.map(f => (
            <FoodPellet key={f.id} food={f} />
          ))}
          {fish.map(f => (
            <Fish key={f.id} fish={f} />
          ))}
          {repulsionEffect && <RepulsionEffect position={repulsionEffect} />}
        </div>
      </div>

      <HUD 
        gameTime={gameTime}
        fishCount={fish.length}
        nextFishTime={nextFishTime}
        credits={gameStats.credits}
        foodCost={FOOD_COST}
        nextBaseCredit={(BASE_CREDIT_INTERVAL - (gameTime % BASE_CREDIT_INTERVAL))}
        nextFishCredit={(FISH_CREDIT_INTERVAL - (gameTime % FISH_CREDIT_INTERVAL))}
      />

      {isGameOver && (
        <GameOver
          seconds={gameTime}
          maxFishReached={maxFishReached}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}