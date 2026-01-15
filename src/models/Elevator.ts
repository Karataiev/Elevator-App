import { Direction, Person } from './types';

export class Elevator {
  public currentFloor: number;
  public direction: Direction;
  public passengers: Person[];
  public capacity: number;

  constructor(capacity: number, startFloor: number = 1) {
    this.capacity = capacity;
    this.currentFloor = startFloor;
    this.direction = Direction.IDLE;
    this.passengers = [];
  }

  public addPassenger(person: Person): boolean {
    if (this.passengers.length >= this.capacity) {
      return false;
    }

    if (this.passengers.some(p => p.id === person.id)) {
      return false;
    }

    this.passengers.push(person);
    person.isInElevator = true;

    return true;
  }

  public removePassengers(): Person[] {
    const passengersToRemove = this.passengers.filter(
      person => person.targetFloor === this.currentFloor
    );

    this.passengers = this.passengers.filter(
      person => person.targetFloor !== this.currentFloor
    );

    passengersToRemove.forEach(person => {
      person.isInElevator = false;
      person.currentFloor = this.currentFloor;
    });

    return passengersToRemove;
  }

  public canPickUp(person: Person): boolean {
    if (this.passengers.length >= this.capacity) {
      return false;
    }

    if (person.currentFloor !== this.currentFloor) {
      return false;
    }

    if (this.direction === Direction.IDLE) {
      return true;
    }

    return person.direction === this.direction;
  }

  public getNextFloor(): number | null {
    if (this.passengers.length === 0) {
      return null;
    }

    const targetFloors = this.passengers.map(p => p.targetFloor);

    if (this.direction === Direction.UP) {
      const floorsAbove = targetFloors.filter(floor => floor > this.currentFloor);
      if (floorsAbove.length > 0) {
        return Math.min(...floorsAbove);
      }
      this.direction = Direction.DOWN;
    }

    if (this.direction === Direction.DOWN) {
      const floorsBelow = targetFloors.filter(floor => floor < this.currentFloor);
      if (floorsBelow.length > 0) {
        return Math.max(...floorsBelow);
      }
      this.direction = Direction.UP;
    }

    return null;
  }

  public setFloor(floor: number): void {
    this.currentFloor = floor;
  }

  public setDirection(direction: Direction): void {
    this.direction = direction;
  }
}
