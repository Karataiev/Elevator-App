import { Building } from '../models/Building';
import { GameView } from '../views/GameView';
import { PersonController } from './PersonController';

export class PersonSpawner {
  private building: Building;
  private gameView: GameView;
  private personController: PersonController;
  private spawnTimers: Map<number, number> = new Map();
  private isSpawning: boolean = false;
  private readonly minInterval = 4000;
  private readonly maxInterval = 10000;

  constructor(building: Building, gameView: GameView, personController: PersonController) {
    this.building = building;
    this.gameView = gameView;
    this.personController = personController;
  }

  public startSpawning(): void {
    if (this.isSpawning) {
      return;
    }

    this.isSpawning = true;

    for (let floor = 1; floor <= this.building.floors; floor++) {
      this.scheduleNextSpawn(floor);
    }
  }

  private scheduleNextSpawn(floor: number): void {
    if (!this.isSpawning) {
      return;
    }

    const interval = Math.random() * (this.maxInterval - this.minInterval) + this.minInterval;
    
    const timerId = window.setTimeout(() => {
      this.spawnForFloor(floor);
    }, interval);

    this.spawnTimers.set(floor, timerId);
  }

  private readonly maxQueueSize = 10;

  private async spawnForFloor(floor: number): Promise<void> {
    if (!this.isSpawning) {
      return;
    }

    const queueSize = this.gameView.getQueueSize(floor);
    if (queueSize >= this.maxQueueSize) {
      this.scheduleNextSpawn(floor);
      return;
    }

    const person = this.building.spawnPerson(floor);
    
    if (person) {
      const personView = this.gameView.addPerson(person);
      await this.personController.moveToElevator(personView);
    }

    this.scheduleNextSpawn(floor);
  }
}
