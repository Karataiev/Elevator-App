import { Direction, Person as IPerson } from './types';

export class Person implements IPerson {
  public id: string;
  public currentFloor: number;
  public targetFloor: number;
  public direction: Direction;
  public isInElevator: boolean;

  constructor(id: string, currentFloor: number, targetFloor: number) {
    this.id = id;
    this.currentFloor = currentFloor;
    this.targetFloor = targetFloor;
    this.isInElevator = false;
    this.direction = this.getDirection();
  }

  public getDirection(): Direction {
    if (this.targetFloor > this.currentFloor) {
      return Direction.UP;
    } else if (this.targetFloor < this.currentFloor) {
      return Direction.DOWN;
    } else {
      return Direction.IDLE;
    }
  }

}
