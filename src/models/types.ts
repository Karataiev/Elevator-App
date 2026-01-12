export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  IDLE = 'IDLE',
}

export interface Person {
  id: string;
  currentFloor: number;
  targetFloor: number;
  direction: Direction;
  isInElevator: boolean;
}

export interface ElevatorState {
  currentFloor: number;
  direction: Direction;
  passengers: Person[];
  capacity: number;
}

export interface BuildingConfig {
  floors: number;
  elevatorCapacity: number;
}
