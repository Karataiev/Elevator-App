import { Container, Graphics, Text } from 'pixi.js';

export class BuildingView {
  public container: Container;
  public floorHeight: number;
  public corridorWidth: number;
  public leftWallWidth: number;
  public rightWallWidth: number;
  private floors: number;
  private totalWidth: number;
  private totalHeight: number;

  constructor(floors: number, totalWidth: number, totalHeight: number) {
    
    this.floors = floors;
    this.totalWidth = totalWidth;
    this.totalHeight = totalHeight;
    
    this.container = new Container();
    
    const availableHeight = totalHeight - this.borderHeight * 2;
    
    this.floorHeight = availableHeight / floors;
    
    this.leftWallWidth = this.borderHeight;
    this.rightWallWidth = this.borderHeight;
    this.corridorWidth = totalWidth - this.borderHeight * 2;
    
    this.drawBuilding();
  
  }

  private wallColor = 0x000000;
  private readonly borderHeight = 5;

  private drawBuilding(): void {
    this.drawLeftWall();
    this.drawRightWall();
    this.drawCeiling();
    this.drawFloor();
    this.drawCorridor();
    this.drawFloorLines();
    this.drawFloorNumbers();
  }

  private drawLeftWall(): void {
    const wall = new Graphics();
    
    wall.beginFill(this.wallColor);
    wall.drawRect(0, this.borderHeight, this.leftWallWidth, this.totalHeight - this.borderHeight * 2);
    wall.endFill();
    
    this.container.addChild(wall);
  }

  private drawRightWall(): void {
    const wall = new Graphics();
    
    wall.beginFill(this.wallColor);
    wall.drawRect(
      this.leftWallWidth + this.corridorWidth,
      this.borderHeight,
      this.rightWallWidth,
      this.totalHeight - this.borderHeight * 2
    );
    wall.endFill();
    
    this.container.addChild(wall);
  }

  private drawCeiling(): void {
    const ceiling = new Graphics();
    ceiling.beginFill(this.wallColor);
    ceiling.drawRect(0, 0, this.totalWidth, this.borderHeight);
    ceiling.endFill();
    this.container.addChild(ceiling);
  }

  private drawFloor(): void {
    const floor = new Graphics();
    floor.beginFill(this.wallColor);
    floor.drawRect(0, this.totalHeight - this.borderHeight, this.totalWidth, this.borderHeight);
    floor.endFill();
    this.container.addChild(floor);
  }

  private drawCorridor(): void {
    const corridor = new Graphics();
    
    corridor.beginFill(0xF5F5F5);
    corridor.drawRect(
      this.leftWallWidth,
      this.borderHeight,
      this.corridorWidth,
      this.totalHeight - this.borderHeight * 2
    );
    corridor.endFill();
    
    this.container.addChild(corridor);
  }

  private drawFloorLines(): void {
    for (let i = 0; i <= this.floors; i++) {
      const line = new Graphics();
      
      const y = this.borderHeight + i * this.floorHeight;
      
      if (i === this.floors && y >= this.totalHeight - this.borderHeight) {
        continue;
      }
      
      line.lineStyle(2, this.wallColor);
      line.moveTo(this.leftWallWidth + this.corridorWidth, y);
      line.lineTo(this.leftWallWidth + 170, y);
      
      this.container.addChild(line);
    }
  }

  private drawFloorNumbers(): void {
    for (let i = 1; i <= this.floors; i++) {
      const floorText = new Text(
        `level ${i}`,
        {
          fontSize: 24,
          fill: this.wallColor,
          fontWeight: 'bold',
        }
      );
      
      floorText.x = this.leftWallWidth + this.corridorWidth - 50;
      
      floorText.y = this.getFloorY(i);
      
      floorText.anchor.set(1, 0.5);
      
      this.container.addChild(floorText);
    }
  }

  public getFloorY(floor: number): number {
    return this.borderHeight + (this.floors - floor) * this.floorHeight + this.floorHeight / 2;
  }

  public getElevatorX(): number {
    return this.leftWallWidth + 10;
  }

  public getPeopleX(): number {
    return this.leftWallWidth + this.corridorWidth - 10;
  }

  public getElevatorShaftStartX(): number {
    return this.leftWallWidth + 170;
  }

  public getRightWallX(): number {
    return this.leftWallWidth + this.corridorWidth;
  }
}
