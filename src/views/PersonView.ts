import { Container, Graphics, Text } from 'pixi.js';
import { Person } from '../models/Person';
import { Direction } from '../models/types';
import { BuildingView } from './BuildingView';

export class PersonView {
  public container: Container;
  private personGraphics: Graphics;
  private targetFloorText: Text;
  private person: Person;
  private buildingView: BuildingView;
  private readonly personWidth = 30;
  private readonly personHeight = 40;
  private readonly upColor = 0x0000FF;
  private readonly downColor = 0x00FF00;
  private readonly idleColor = 0x808080;

  constructor(person: Person, buildingView: BuildingView) {
    this.person = person;
    this.buildingView = buildingView;
    this.container = new Container();
    this.personGraphics = new Graphics();
    this.targetFloorText = new Text(
      person.targetFloor.toString(),
      {
        fontSize: 16,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
      }
    );
    this.targetFloorText.anchor.set(0.5, 0.5);
    this.drawPerson();
    this.container.addChild(this.personGraphics);
    this.container.addChild(this.targetFloorText);
    this.updatePosition();
  }

  private drawPerson(): void {
    this.personGraphics.clear();
    const color = this.getColorForDirection(this.person.direction);
    this.personGraphics.beginFill(color);
    this.personGraphics.drawRect(0, 0, this.personWidth, this.personHeight);
    this.personGraphics.endFill();
    this.personGraphics.lineStyle(2, 0x000000);
    this.personGraphics.drawRect(0, 0, this.personWidth, this.personHeight);
    this.targetFloorText.x = this.personWidth / 2;
    this.targetFloorText.y = this.personHeight / 2;
  }

  private getColorForDirection(direction: Direction): number {
    switch (direction) {
      case Direction.UP:
        return this.upColor;
      case Direction.DOWN:
        return this.downColor;
      case Direction.IDLE:
        return this.idleColor;
      default:
        return this.idleColor;
    }
  }

  public updateColor(): void {
    this.drawPerson();
  }

  public updatePosition(): void {
    const x = this.buildingView.getPeopleX();
    const floorY = this.buildingView.getFloorY(this.person.currentFloor);
    const floorHeight = this.buildingView.floorHeight;
    const distanceFromFloor = 3;
    const y = floorY + floorHeight / 2 - distanceFromFloor - this.personHeight;
    this.container.x = x;
    this.container.y = y;
  }

  public setPosition(x: number, y: number): void {
    this.container.x = x;
    this.container.y = y;
  }

  public getX(): number {
    return this.container.x;
  }

  public getY(): number {
    return this.container.y;
  }

  public getPerson(): Person {
    return this.person;
  }

  public update(): void {
    this.updateColor();
    this.updatePosition();
  }
}
