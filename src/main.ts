import { Application, Text } from 'pixi.js';

async function initApp() {
  const app = new Application();

  // @ts-ignore
  await app.init({
    width: 2000,
    height: 1600,
    backgroundColor: 0xf0f0f0,
    antialias: true,
  });

  const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
  // @ts-ignore
  const pixiCanvas = app.canvas as HTMLCanvasElement;
  
  pixiCanvas.width = app.screen.width;
  pixiCanvas.height = app.screen.height;
  
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
  
  if (canvasElement && canvasElement.parentNode) {
    canvasElement.parentNode.replaceChild(pixiCanvas, canvasElement);
  } else {
    document.body.appendChild(pixiCanvas);
  }
  
  console.log('Canvas resolution:', pixiCanvas.width, 'x', pixiCanvas.height);
  console.log('Canvas display size:', displayWidth, 'x', displayHeight);

  const testText = new Text(
    'PIXI.js працює!',
    {
      fontSize: 32,
      fill: 0x000000,
      align: 'center',
    }
  );

  testText.anchor.set(0.5);
  testText.x = app.screen.width / 2;
  testText.y = app.screen.height / 2;

  app.stage.addChild(testText);

  console.log('PIXI Application ініціалізовано успішно!');
  console.log('Canvas розмір:', app.screen.width, 'x', app.screen.height);
}

initApp().catch(console.error);
