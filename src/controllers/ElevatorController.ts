import * as TWEEN from '@tweenjs/tween.js';
import { ElevatorView } from '../views/ElevatorView';
import { BuildingView } from '../views/BuildingView';
import { Elevator } from '../models/Elevator';
import { PersonController } from './PersonController';
import { GameView } from '../views/GameView';
import { Building } from '../models/Building';
import { Direction } from '../models/types';
import { PersonView } from '../views/PersonView';

export class ElevatorController {
  private elevatorView: ElevatorView;
  private buildingView: BuildingView;
  private elevator: Elevator;
  private personController: PersonController;
  private gameView: GameView;
  private building: Building;
  private currentTween: TWEEN.Tween<{ y: number }> | null = null;
  private isMoving: boolean = false;
  private isProcessing: boolean = false;
  private readonly floorDuration = 1000;
  private readonly stopDelay = 800;

  constructor(
    elevatorView: ElevatorView,
    buildingView: BuildingView,
    elevator: Elevator,
    personController: PersonController,
    gameView: GameView,
    building: Building
  ) {
    this.elevatorView = elevatorView;
    this.buildingView = buildingView;
    this.elevator = elevator;
    this.personController = personController;
    this.gameView = gameView;
    this.building = building;
  }

  public moveToFloor(targetFloor: number): Promise<void> {
    return new Promise((resolve) => {
      if (this.currentTween) {
        this.currentTween.stop();
        this.currentTween = null;
      }

      if (this.elevator.currentFloor === targetFloor) {
        resolve();
        return;
      }

      this.isMoving = true;

      const currentY = this.elevatorView.container.y;
      const targetY = this.buildingView.getFloorY(targetFloor) - this.elevatorView.getHeight() / 2;
      
      const floorDifference = Math.abs(targetFloor - this.elevator.currentFloor);
      const duration = floorDifference * this.floorDuration;

      const tweenObject = { y: currentY };
      
      this.currentTween = new TWEEN.Tween(tweenObject)
        .to({ y: targetY }, duration)
        .onUpdate((object) => {
          this.elevatorView.container.y = object.y;
        })
        .onComplete(() => {
          this.elevator.setFloor(targetFloor);
          this.elevatorView.container.y = targetY;
          this.isMoving = false;
          this.currentTween = null;
          resolve();
        })
        .start();
    });
  }

  public isMovingNow(): boolean {
    return this.isMoving;
  }

  public stop(): void {
    if (this.currentTween) {
      this.currentTween.stop();
      this.currentTween = null;
      this.isMoving = false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private findNextFloorWithPeople(direction: Direction): number | null {
    let floorsToCheck: number[] = [];
    
    if (direction === Direction.UP) {
      for (let i = this.elevator.currentFloor + 1; i <= this.building.floors; i++) {
        floorsToCheck.push(i);
      }
    } else if (direction === Direction.DOWN) {
      for (let i = this.elevator.currentFloor - 1; i >= 1; i--) {
        floorsToCheck.push(i);
      }
    }

    for (const floor of floorsToCheck) {
      const waitingPeople = this.building.getAllWaitingPeople(floor);
      if (waitingPeople.length > 0) {
        return floor;
      }
    }

    return null;
  }

  public async process(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (true) {
      if (!this.building.hasWaitingPeople() && this.elevator.passengers.length === 0) {
        this.elevator.setDirection(Direction.IDLE);
        await this.delay(1000);
        continue;
      }

      let nextFloor: number | null = null;

      if (this.elevator.passengers.length > 0) {
        nextFloor = this.elevator.getNextFloor();
        if (nextFloor) {
          this.elevator.setDirection(
            nextFloor > this.elevator.currentFloor ? Direction.UP : Direction.DOWN
          );
        }
      }

      if (!nextFloor && this.building.hasWaitingPeople()) {
        if (this.elevator.direction === Direction.IDLE) {
          const floorsWithPeople: number[] = [];
          for (let i = 1; i <= this.building.floors; i++) {
            if (this.building.getAllWaitingPeople(i).length > 0) {
              floorsWithPeople.push(i);
            }
          }
          
          if (floorsWithPeople.length > 0) {
            const closestFloor = floorsWithPeople.reduce((closest, floor) => {
              const currentDist = Math.abs(floor - this.elevator.currentFloor);
              const closestDist = Math.abs(closest - this.elevator.currentFloor);
              return currentDist < closestDist ? floor : closest;
            });
            
            nextFloor = closestFloor;
            this.elevator.setDirection(
              nextFloor > this.elevator.currentFloor ? Direction.UP : Direction.DOWN
            );
          }
        } else {
          nextFloor = this.findNextFloorWithPeople(this.elevator.direction);
          
          if (!nextFloor) {
            this.elevator.setDirection(
              this.elevator.direction === Direction.UP ? Direction.DOWN : Direction.UP
            );
            nextFloor = this.findNextFloorWithPeople(this.elevator.direction);
          }
        }
      }

      if (!nextFloor) {
        await this.delay(1000);
        continue;
      }

      await this.moveToFloor(nextFloor);
      await this.delay(this.stopDelay);
      
      await this.unloadPassengers(nextFloor);
      await this.loadPassengers(nextFloor);
    }
  }

  private isPersonNearElevator(personView: PersonView): boolean {
    const elevatorShaftStartX = this.buildingView.getElevatorShaftStartX();
    const personX = personView.getX();
    const threshold = 10;
    return Math.abs(personX - elevatorShaftStartX) < threshold;
  }

  private async loadPassengers(floor: number): Promise<void> {
    let waitingPeople: typeof this.building.waitingPeople[0] = [];
    
    if (this.elevator.direction === Direction.IDLE) {
      waitingPeople = this.building.getAllWaitingPeople(floor);
    } else {
      waitingPeople = this.building.getWaitingPeople(floor, this.elevator.direction);
    }
    
    for (const person of waitingPeople) {
      if (this.elevator.canPickUp(person)) {
        const personView = this.gameView.getPersonView(person.id);
        if (personView && this.isPersonNearElevator(personView)) {
          this.elevator.addPassenger(person);
          this.building.removeWaitingPerson(person);
          personView.container.visible = false;
        }
      }
    }
  }

  private async unloadPassengers(floor: number): Promise<void> {
    const passengersToRemove = this.elevator.removePassengers();
    
    for (const person of passengersToRemove) {
      person.currentFloor = floor;
      const personView = this.gameView.getPersonView(person.id);
      
      if (personView) {
        personView.container.visible = true;
        personView.updatePosition();
        await this.personController.moveFromElevator(personView);
      }
    }
  }
}
