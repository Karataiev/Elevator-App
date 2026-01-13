import { Application } from 'pixi.js';
import * as TWEEN from '@tweenjs/tween.js';
import { GameView } from './views/GameView';
import { Building } from './models/Building';
import { BuildingConfig } from './models/types';
import { PersonSpawner } from './controllers/PersonSpawner';
import { ElevatorController } from './controllers/ElevatorController';
import { PersonController } from './controllers/PersonController';

function initApp() {
  const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
  
  const app = new Application({
    width: 1200,
    height: 800,
    backgroundColor: 0x808080,
    antialias: true,
  });

  // @ts-ignore
  const pixiCanvas = (app.view || app.canvas) as HTMLCanvasElement;

  if (canvasElement && canvasElement.parentNode) {
    canvasElement.parentNode.replaceChild(pixiCanvas, canvasElement);
  } else {
    document.body.appendChild(pixiCanvas);
  }
  
  const maxWidth = window.innerWidth - 40;
  const maxHeight = window.innerHeight - 100;
  
  let displayWidth = app.screen.width;
  let displayHeight = app.screen.height;
  
  if (displayWidth > maxWidth || displayHeight > maxHeight) {
    const scale = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
    displayWidth = displayWidth * scale;
    displayHeight = displayHeight * scale;
  }
  
  pixiCanvas.style.width = `${displayWidth}px`;
  pixiCanvas.style.height = `${displayHeight}px`;

  const buildingConfig: BuildingConfig = {
    floors: 7,
    elevatorCapacity: 4,
  };

  const building = new Building(buildingConfig);

  const gameView = new GameView(
    building,
    app.screen.width,
    app.screen.height
  );

  app.stage.addChild(gameView.container);

  const personController = new PersonController(gameView.buildingView, gameView);
  const elevatorController = new ElevatorController(
    gameView.elevatorView,
    gameView.buildingView,
    building.elevator,
    personController,
    gameView,
    building
  );

  const personSpawner = new PersonSpawner(building, gameView, personController);
  personSpawner.startSpawning();

  elevatorController.process().catch(console.error);

  function animate(time: number) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
  }

  animate(performance.now());
}

initApp();
