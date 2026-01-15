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
      const personWidth = 30;
      const distanceFromFloor = 3;
      const targetY = floorY + floorHeight / 2 - distanceFromFloor - personHeight;

      const tweenObject = { x: startX };
      
      const tween = new TWEEN.Tween(tweenObject)
        .to({ x: elevatorShaftStartX }, this.moveDuration)
        .onUpdate((object) => {
          personView.setPosition(object.x, targetY);
          
          const peopleInQueue = this.gameView.getPeopleInQueue(floor);
          const standingPeople = peopleInQueue.filter(pv => {
            return this.gameView.hasPersonInQueue(pv.getPerson().id) && 
                   !this.hasActiveAnimation(pv.getPerson().id);
          });
          
          if (standingPeople.length > 0) {
            const lastPersonInQueue = standingPeople.reduce((last, pv) => {
              const lastX = last.getX();
              const currentX = pv.getX();
              return currentX > lastX ? pv : last;
            });
            
            const lastPersonX = lastPersonInQueue.getX();
            const spacing = 3;
            
            if (object.x <= lastPersonX + personWidth + spacing) {
              tween.stop();
              this.activeTweens.delete(personView.getPerson().id);
              this.gameView.addPersonToQueue(personView.getPerson().id, floor);
              this.gameView.updateQueuePositions(floor);
              resolve();
              return;
            }
          }
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
      const startY = personView.getY();
      const rightWallX = this.buildingView.getRightWallX();
      const targetX = rightWallX;

      const tweenObject = { x: startX };
      
      const tween = new TWEEN.Tween(tweenObject)
        .to({ x: targetX }, this.moveDuration)
        .onUpdate((object) => {
          personView.setPosition(object.x, startY);
          
          if (object.x >= rightWallX - 5) {
            tween.stop();
            this.activeTweens.delete(personView.getPerson().id);
            this.fadeOutAndRemove(personView);
            resolve();
          }
        })
        .onComplete(() => {
          this.activeTweens.delete(personView.getPerson().id);
          this.fadeOutAndRemove(personView);
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

  public hasActiveAnimation(personId: string): boolean {
    return this.activeTweens.has(personId);
  }

  private fadeOutAndRemove(personView: PersonView): void {
    const fadeObject = { alpha: 1 };
    new TWEEN.Tween(fadeObject)
      .to({ alpha: 0 }, 300)
      .onUpdate((object) => {
        personView.container.alpha = object.alpha;
      })
      .onComplete(() => {
        this.gameView.removePerson(personView.getPerson().id);
      })
      .start();
  }

}
