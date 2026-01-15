import { Container, Graphics } from 'pixi.js';
import { BuildingView } from './BuildingView';

export class ElevatorView {
  public container: Container;
  private elevatorGraphics: Graphics;
  private currentFloor: number;
  private buildingView: BuildingView;
  private elevatorWidth: number;
  private elevatorHeight: number;

  constructor(buildingView: BuildingView, startFloor: number = 1) {
    this.buildingView = buildingView;
    this.currentFloor = startFloor;
    
    this.container = new Container();
    
    this.elevatorWidth = buildingView.corridorWidth - (buildingView.corridorWidth - 150);
    
    this.elevatorHeight = buildingView.floorHeight;
    
    this.elevatorGraphics = new Graphics();
    
    this.drawElevator();
    
    this.updatePosition( startFloor );
    
    this.container.addChild(this.elevatorGraphics);
  }

  private drawElevator(): void {
    this.elevatorGraphics.clear();
    
    this.elevatorGraphics.beginFill(0xFFFFFF);
    this.elevatorGraphics.drawRect(0, 0, this.elevatorWidth, this.elevatorHeight);
    this.elevatorGraphics.endFill();
    
    this.elevatorGraphics.lineStyle(5, 0x000080);
    
    this.elevatorGraphics.moveTo(-2.5, 0);
    this.elevatorGraphics.lineTo(this.elevatorWidth + 2.5, 0);
    
    this.elevatorGraphics.moveTo(0, 0);
    this.elevatorGraphics.lineTo(0, this.elevatorHeight);
    
    this.elevatorGraphics.moveTo(0, this.elevatorHeight);
    this.elevatorGraphics.lineTo(this.elevatorWidth, this.elevatorHeight);
    
    const doorHeight = this.elevatorHeight * 0.7;
    this.elevatorGraphics.moveTo(this.elevatorWidth, 0);
    this.elevatorGraphics.lineTo(this.elevatorWidth, this.elevatorHeight - doorHeight);

    this.elevatorGraphics.moveTo(this.elevatorWidth , this.elevatorHeight - doorHeight / 10);
    this.elevatorGraphics.lineTo(this.elevatorWidth, this.elevatorHeight + 2.5);
  }

  public updatePosition(floor: number): void {
    this.currentFloor = floor;
    
    const x = this.buildingView.getElevatorX();
    
    const y = this.buildingView.getFloorY(floor) - this.elevatorHeight / 2;
    
    this.container.x = x;
    this.container.y = y;
  }

  public getHeight(): number {
    return this.elevatorHeight;
  }
}
