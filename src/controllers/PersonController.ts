import * as TWEEN from '@tweenjs/tween.js';
import { PersonView } from '../views/PersonView';
import { BuildingView } from '../views/BuildingView';
import { GameView } from '../views/GameView';

export class PersonController {
  private buildingView: BuildingView;
  private gameView: GameView;
  private activeTweens: Map<string, TWEEN.Tween<{ x: number }>> = new Map();
  private readonly moveDuration = 4000;

  constructor(buildingView: BuildingView, gameView: GameView) {
    this.buildingView = buildingView;
    this.gameView = gameView;
  }

  public moveToElevator(personView: PersonView): Promise<void> {
    return new Promise((resolve) => {
      this.stopPersonAnimation(personView.getPerson().id);

      const startX = personView.getX();
      const elevatorShaftStartX = this.buildingView.getElevatorShaftStartX();
      const floor = personView.getPerson().currentFloor;
      const floorY = this.buildingView.getFloorY(floor);
      const floorHeight = this.buildingView.floorHeight;
      const personHeight = 40;
      const distanceFromFloor = 3;
      const targetY = floorY + floorHeight / 2 - distanceFromFloor - personHeight;

      const tweenObject = { x: startX };
      
      const tween = new TWEEN.Tween(tweenObject)
        .to({ x: elevatorShaftStartX }, this.moveDuration)
        .onUpdate((object) => {
          personView.setPosition(object.x, targetY);
        })
        .onComplete(() => {
          this.activeTweens.delete(personView.getPerson().id);
          this.gameView.addPersonToQueue(personView.getPerson().id, floor);
          this.gameView.updateQueuePositions(floor);
          resolve();
        })
        .start();

      this.activeTweens.set(personView.getPerson().id, tween);
    });
  }

  public moveFromElevator(personView: PersonView): Promise<void> {
    return new Promise((resolve) => {
      this.stopPersonAnimation(personView.getPerson().id);

      const startX = personView.getX();
      const targetX = this.buildingView.getPeopleX();
      const floor = personView.getPerson().currentFloor;
      const floorY = this.buildingView.getFloorY(floor);
      const floorHeight = this.buildingView.floorHeight;
      const personHeight = 40;
      const distanceFromFloor = 3;
      const targetY = floorY + floorHeight / 2 - distanceFromFloor - personHeight;

      const tweenObject = { x: startX };
      
      const tween = new TWEEN.Tween(tweenObject)
        .to({ x: targetX }, this.moveDuration)
        .onUpdate((object) => {
          personView.setPosition(object.x, targetY);
        })
        .onComplete(() => {
          this.activeTweens.delete(personView.getPerson().id);
          resolve();
        })
        .start();

      this.activeTweens.set(personView.getPerson().id, tween);
    });
  }

  public stopPersonAnimation(personId: string): void {
    const tween = this.activeTweens.get(personId);
    if (tween) {
      tween.stop();
      this.activeTweens.delete(personId);
    }
  }

  public stopAll(): void {
    this.activeTweens.forEach((tween) => {
      tween.stop();
    });
    this.activeTweens.clear();
  }
}
