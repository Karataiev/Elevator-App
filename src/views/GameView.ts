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
      personView.container.destroy();
    }
  }

  public getPersonView(personId: string): PersonView | undefined {
    return this.personViews.get(personId);
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
