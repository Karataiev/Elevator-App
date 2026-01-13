import { Container } from 'pixi.js';
import { BuildingView } from './BuildingView';
import { ElevatorView } from './ElevatorView';
import { PersonView } from './PersonView';
import { Building } from '../models/Building';
import { Person } from '../models/Person';

export class GameView {
  public container: Container;
  public buildingView: BuildingView;
  public elevatorView: ElevatorView;
  private personViews: Map<string, PersonView>;
  private building: Building;
  private queuePositions: Map<string, number> = new Map();

  constructor(building: Building, width: number, height: number) {
    this.building = building;
    this.personViews = new Map();
    
    this.container = new Container();
    
    this.buildingView = new BuildingView(
      building.floors,
      width,
      height
    );
    
    this.elevatorView = new ElevatorView(
      this.buildingView,
      building.elevator.currentFloor
    );
    
    this.container.addChild(this.buildingView.container);
    this.container.addChild(this.elevatorView.container);
  }

  public addPerson(person: Person): PersonView {
    const personView = new PersonView(person, this.buildingView);
    this.personViews.set(person.id, personView);
    this.container.addChild(personView.container);
    return personView;
  }

  public removePerson(personId: string): void {
    const personView = this.personViews.get(personId);
    if (personView) {
      this.container.removeChild(personView.container);
      this.personViews.delete(personId);
      this.removePersonFromQueue(personId);
      personView.container.destroy();
    }
  }

  public getPersonView(personId: string): PersonView | undefined {
    return this.personViews.get(personId);
  }

  public getPeopleInQueue(floor: number): PersonView[] {
    const elevatorShaftStartX = this.buildingView.getElevatorShaftStartX();
    const threshold = 10;
    
    const peopleInQueue: PersonView[] = [];
    this.personViews.forEach((personView) => {
      const person = personView.getPerson();
      if (person.currentFloor === floor && !person.isInElevator) {
        const personX = personView.getX();
        if (Math.abs(personX - elevatorShaftStartX) < threshold || personX > elevatorShaftStartX) {
          peopleInQueue.push(personView);
        }
      }
    });
    
    return peopleInQueue.sort((a, b) => {
      const posA = this.queuePositions.get(a.getPerson().id) ?? Infinity;
      const posB = this.queuePositions.get(b.getPerson().id) ?? Infinity;
      return posA - posB;
    });
  }

  public addPersonToQueue(personId: string, floor: number): void {
    const peopleInQueue = this.getPeopleInQueue(floor);
    const maxPosition = Math.max(...peopleInQueue.map(pv => this.queuePositions.get(pv.getPerson().id) ?? -1), -1);
    this.queuePositions.set(personId, maxPosition + 1);
  }

  public removePersonFromQueue(personId: string): void {
    this.queuePositions.delete(personId);
  }

  public updateQueuePositions(floor: number): void {
    const floorY = this.buildingView.getFloorY(floor);
    const floorHeight = this.buildingView.floorHeight;
    const personWidth = 30;
    const personHeight = 40;
    const spacing = 3;
    const distanceFromFloor = 3;
    const elevatorShaftStartX = this.buildingView.getElevatorShaftStartX();
    
    const peopleInQueue = this.getPeopleInQueue(floor);
    
    peopleInQueue.forEach((personView) => {
      const queuePosition = this.queuePositions.get(personView.getPerson().id);
      if (queuePosition !== undefined) {
        const xPosition = elevatorShaftStartX + queuePosition * (personWidth + spacing);
        const yPosition = floorY + floorHeight / 2 - distanceFromFloor - personHeight;
        personView.setPosition(xPosition, yPosition);
      }
    });
  }

  public updateElevatorPosition(): void {
    this.elevatorView.updatePosition(this.building.elevator.currentFloor);
  }

  public render(): void {
    this.updateElevatorPosition();
    
    this.personViews.forEach((personView) => {
      personView.update();
    });
  }
}
