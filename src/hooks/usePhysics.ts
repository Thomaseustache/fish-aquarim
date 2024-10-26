import { Fish, FoodPellet, Position } from '../types/aquarium';

const MOVEMENT_SPEED = 0.6;
const ATTRACTION_RADIUS = 150;
const REPULSION_RADIUS = 100;
const REPULSION_FORCE = 2;
const EATING_DISTANCE = 15;
const BOUNCE_DAMPENING = 0.8;
const WANDERING_CHANCE = 0.005;
const MAX_SPEED = 1.2;
const ATTRACTION_FORCE = 0.015;
const DAMPENING = 0.995;
const VERTICAL_MOVEMENT_SCALE = 0.15;
const MIN_SPEED = 0.1;
const DIRECTION_CHANGE_THRESHOLD = 0.01;
const HUNGER_ATTRACTION_MULTIPLIER = 2;
const FOOD_BOTTOM_MARGIN = 40;

export function usePhysics() {
  const updateFishPositions = (
    prevFish: Fish[],
    food: FoodPellet[],
    width: number,
    height: number,
    onFoodEaten: (foodId: string, fishId: string) => void,
    repulsionEffect: Position | null
  ): Fish[] => {
    return prevFish.map(fish => {
      let newVelocity = { ...fish.velocity };
      let newPosition = { ...fish.position };
      let newDirection = fish.direction;
      let newTargetFood = fish.targetFood;

      if (repulsionEffect) {
        const distanceToRepulsion = Math.hypot(
          repulsionEffect.x - fish.position.x,
          repulsionEffect.y - fish.position.y
        );

        if (distanceToRepulsion < REPULSION_RADIUS) {
          const repulsionForce = (REPULSION_RADIUS - distanceToRepulsion) / REPULSION_RADIUS * REPULSION_FORCE;
          const angle = Math.atan2(
            fish.position.y - repulsionEffect.y,
            fish.position.x - repulsionEffect.x
          );
          newVelocity.x += Math.cos(angle) * repulsionForce;
          newVelocity.y += Math.sin(angle) * repulsionForce;
        }
      }

      if (newTargetFood && !food.some(f => 
        f.position.x === newTargetFood?.x && f.position.y === newTargetFood?.y
      )) {
        newTargetFood = undefined;
      }

      const currentAttractionRadius = ATTRACTION_RADIUS * (1 + (100 - fish.hunger) / 50);

      if (!newTargetFood && food.length > 0) {
        const nearestFood = food.reduce((nearest, pellet) => {
          const distance = Math.hypot(
            pellet.position.x - fish.position.x,
            pellet.position.y - fish.position.y
          );
          return distance < currentAttractionRadius && (!nearest || distance < nearest.distance)
            ? { pellet, distance }
            : nearest;
        }, null as { pellet: FoodPellet; distance: number } | null);

        if (nearestFood) {
          newTargetFood = nearestFood.pellet.position;
        }
      }

      const eatenFood = food.find(pellet => 
        Math.hypot(
          pellet.position.x - fish.position.x,
          pellet.position.y - fish.position.y
        ) < EATING_DISTANCE
      );

      if (eatenFood) {
        onFoodEaten(eatenFood.id, fish.id);
        newTargetFood = undefined;
        newVelocity.x += (Math.random() - 0.5) * MOVEMENT_SPEED;
        newVelocity.y += (Math.random() - 0.5) * MOVEMENT_SPEED * VERTICAL_MOVEMENT_SCALE;
      } else if (newTargetFood) {
        const hungerMultiplier = 1 + ((100 - fish.hunger) / 100) * HUNGER_ATTRACTION_MULTIPLIER;
        const attraction = {
          x: (newTargetFood.x - fish.position.x) * ATTRACTION_FORCE * hungerMultiplier,
          y: (newTargetFood.y - fish.position.y) * ATTRACTION_FORCE * hungerMultiplier,
        };
        newVelocity.x += attraction.x;
        newVelocity.y += attraction.y;
      } else {
        if (Math.random() < WANDERING_CHANCE) {
          newVelocity.x += (Math.random() - 0.5) * MOVEMENT_SPEED;
          newVelocity.y += (Math.random() - 0.5) * MOVEMENT_SPEED * VERTICAL_MOVEMENT_SCALE;
        }
      }

      const speed = Math.hypot(newVelocity.x, newVelocity.y);
      if (speed > MAX_SPEED) {
        newVelocity.x = (newVelocity.x / speed) * MAX_SPEED;
        newVelocity.y = (newVelocity.y / speed) * MAX_SPEED;
      }

      if (Math.abs(newVelocity.x) < MIN_SPEED && !newTargetFood) {
        newVelocity.x += (newVelocity.x >= 0 ? 1 : -1) * MIN_SPEED;
      }

      newVelocity.x *= DAMPENING;
      newVelocity.y *= DAMPENING;

      newPosition.x += newVelocity.x;
      newPosition.y += newVelocity.y;

      if (newPosition.x < 0 || newPosition.x > width - 30) {
        newVelocity.x *= -BOUNCE_DAMPENING;
        newPosition.x = Math.max(0, Math.min(width - 30, newPosition.x));
      }
      if (newPosition.y < 0 || newPosition.y > height - 30) {
        newVelocity.y *= -BOUNCE_DAMPENING;
        newPosition.y = Math.max(0, Math.min(height - 30, newPosition.y));
      }

      newDirection = newVelocity.x > 0 ? 'right' : 'left';

      return {
        ...fish,
        position: newPosition,
        velocity: newVelocity,
        direction: newDirection,
        targetFood: newTargetFood,
      };
    });
  };

  const updateFoodPositions = (
    prevFood: FoodPellet[],
    height: number
  ): FoodPellet[] => {
    return prevFood.map(pellet => {
      if (pellet.position.y < height - FOOD_BOTTOM_MARGIN) {
        return {
          ...pellet,
          position: {
            ...pellet.position,
            y: pellet.position.y + pellet.velocity.y
          }
        };
      }
      return {
        ...pellet,
        position: {
          ...pellet.position,
          y: height - FOOD_BOTTOM_MARGIN
        },
        velocity: { ...pellet.velocity, y: 0 }
      };
    });
  };

  return {
    updateFishPositions,
    updateFoodPositions,
  };
}