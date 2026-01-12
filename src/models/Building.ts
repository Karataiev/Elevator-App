import { Person } from './Person';
import { Elevator } from './Elevator';
import { Direction, BuildingConfig } from './types';

export class Building {
  public floors: number;
  public elevator: Elevator;
  public waitingPeople: Person[][];

  constructor(config: BuildingConfig) {
    this.floors = config.floors;
    this.elevator = new Elevator(config.elevatorCapacity, 1);
    this.waitingPeople = [];
    for (let i = 0; i < this.floors; i++) {
      this.waitingPeople.push([]);
    }
  }

  public spawnPerson(floor: number): Person | null {
    if (floor < 1 || floor > this.floors) {
      return null;
    }

    let targetFloor: number;
    do {
      targetFloor = Math.floor(Math.random() * this.floors) + 1;
    } while (targetFloor === floor);

    const id = `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const person = new Person(id, floor, targetFloor);
    this.waitingPeople[floor - 1].push(person);

    return person;
  }

  public getWaitingPeople(floor: number, direction: Direction): Person[] {
    if (floor < 1 || floor > this.floors) {
      return [];
    }

    const peopleOnFloor = this.waitingPeople[floor - 1];
    return peopleOnFloor.filter(person => person.direction === direction);
  }

  public removeWaitingPerson(person: Person): void {
    const floor = person.currentFloor;
    
    if (floor < 1 || floor > this.floors) {
      return;
    }

    const floorIndex = floor - 1;
    this.waitingPeople[floorIndex] = this.waitingPeople[floorIndex].filter(
      p => p.id !== person.id
    );
  }

  public getAllWaitingPeople(floor: number): Person[] {
    if (floor < 1 || floor > this.floors) {
      return [];
    }
    return [...this.waitingPeople[floor - 1]];
  }

  public hasWaitingPeople(): boolean {
    for (let i = 0; i < this.floors; i++) {
      if (this.waitingPeople[i].length > 0) {
        return true;
      }
    }
    return false;
  }
}
