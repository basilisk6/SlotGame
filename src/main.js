import { Reels } from "./components/reels.js";
import { SYMBOL_WIDTH, SYMBOL_SCALE, SYMBOL_HEIGHT, REEL_NUMBER, REEL_LENGTH, SYMBOLS_ON_SCREEN, TOTAL_LINES } from "./config/constants.js";
import { UI } from "./components/ui.js";
import { calculateWin } from "./config/helpers.js";
import { PopupWin } from "./components/win.js";
import { updateBalance } from "../redux/slices/balanceSlice.js";
import { idle, startSpin } from "../redux/slices/gameStateSlice.js";
import store from "../redux/store.js";

export const loader = PIXI.Loader.shared;
export const symbols = [];

// Creating app and loading assets
let app = new PIXI.Application({ 
  width: 1200, 
  height: 600,
  backgroundColor: 0x23395d,
});

// Positioning app to the center of the screen
app.view.style.position = 'absolute';
app.view.style.left = '50%';
app.view.style.top = '50%';
app.view.style.transform = 'translate(-50%, -50%)';

document.body.appendChild(app.view);

// Add background
const background = PIXI.Sprite.from('./assets/background.jpg');
background.position.set(0, 0);
background.width = app.screen.width;
background.height = app.screen.height;

app.stage.addChild(background);

// Creating and setting reels container
const reelsContainer = new PIXI.Container();
app.stage.addChild(reelsContainer);

reelsContainer.x = app.screen.width * 0.5;
reelsContainer.y = app.screen.height * 0.15;

// Loading assets
loadAssets();

// Creating the reels and adding to reelsContainer but after the assets are loaded
let reels;
const reelsMask = new PIXI.Graphics();
loader.onComplete.add(() => {
  reels = new Reels(REEL_NUMBER, REEL_LENGTH, 50, SYMBOL_SCALE);
  reels.addToContainer(reelsContainer);
  
  reelsContainer.pivot.x = reelsContainer.width / 2;

  // Creating and setting mask for reels container
  reelsMask.beginFill(0xffffff);
  reelsMask.drawRect(
    reelsContainer.x, 
    reelsContainer.y, 
    REEL_NUMBER * SYMBOL_WIDTH * SYMBOL_SCALE, 
    SYMBOLS_ON_SCREEN * SYMBOL_HEIGHT * SYMBOL_SCALE
  );
  reelsMask.pivot.x = reelsMask.width / 2;
  reelsMask.endFill();

  reelsContainer.mask = reelsMask;
  app.stage.addChild(reelsMask);
});

// Creating and setting win presentation
const winAnim = new PopupWin();
app.stage.addChild(winAnim.text, winAnim.amount);
winAnim.text.position.set(app.screen.width * 0.5, app.screen.height * 0.3);
winAnim.amount.position.set(app.screen.width * 0.5, app.screen.height * 0.425);

// Indicator to ensure dispatching only once
store.dispatching = false;
// Subbing winAnim to store
store.subscribe(() => {
  if (store.dispatching) {
    return;
  }
  const gameState = store.getState().gameState;
  
  if (gameState.gameState === 'presentWin') { 
    // Get screen and present win if there is any
    let currentScreen = reels.getScreen(reelsMask.y, reelsMask.height);
    console.log("Screen: ", currentScreen);
    
    // Assume bet amount is counted for 10 lines then:
    //    Check for initial wins from symbol in screen
    //    Add bet and lines modifiers to get final win
    let win = calculateWin(currentScreen);
    win = win * ui.betAmount.text / TOTAL_LINES;
    console.log("Win: ", win);

    // When spin stops, present win
    if (win > 0) {
      winAnim.presentWin(win);
      // And update balance
      store.dispatching = true;
      store.dispatch(updateBalance(Number(ui.balanceAmount.text) + win));
      store.dispatching = false;
    } else {
      // If no win, go to idle state
      store.dispatch(idle());
    }
  }
  
  // Enable sping button if in idle
  if (gameState.gameState === 'idle') {
    ui.spinButton.enableButton();
  } 
});

// Creating and setting ui container
const uiContainer = new PIXI.Container();
app.stage.addChild(uiContainer);

uiContainer.x = app.screen.width * 0.5;
uiContainer.y = app.screen.height * 0.85;

// Add elements to ui container
const ui = new UI();
ui.addToContainer(uiContainer);
ui.subToStore();

// Reposition ui components
ui.betAmount.setX(0);
ui.betAmountContainer.x = uiContainer.width * 0.5;

ui.decreaseBetButton.setX(ui.betAmountContainer.x - ui.betAmountContainer.width);
ui.increaseBetButton.setX(ui.betAmountContainer.x + ui.betAmount.width + ui.betAmountContainer.width);
ui.decreaseBetButton.setY(uiContainer.height * 0.5);
ui.increaseBetButton.setY(uiContainer.height * 0.5);

ui.spinButton.setX(uiContainer.width);
ui.spinButton.setY(uiContainer.height * 0.5);

uiContainer.pivot.x = uiContainer.width * 0.5;

// Prevent overlapping of bet and arrows
ui.increaseBetButton.on('pointerdown', () => {
  ui.betAmountContainer.x = uiBackground.width * 0.327;
  ui.decreaseBetButton.setX(ui.betAmountContainer.x - ui.betAmountContainer.width);
  ui.increaseBetButton.setX(ui.betAmountContainer.x + ui.betAmount.width + ui.betAmountContainer.width);
});

ui.decreaseBetButton.on('pointerdown', () => {
  ui.betAmountContainer.x = uiBackground.width * 0.327
  ui.decreaseBetButton.setX(ui.betAmountContainer.x - ui.betAmountContainer.width);
  ui.increaseBetButton.setX(ui.betAmountContainer.x + ui.betAmount.width + ui.betAmountContainer.width);
});

// Indicator for winning screen
let mandatoryWinSpin = 0;

ui.spinButton.on('pointerdown', () => {
    // Disable spin button if bet is insufficient
    if (!ui.userHasEnoughFunds) {
      return;
    }
    
    // When spin button is clicked, go to spin state
    store.dispatch(startSpin());

    // Disable spin button untill next idle state 
    ui.spinButton.disableButton();

    // Reels reset by changing texture after a second of spinning
    setTimeout(() => {
      // Force every 4th spin to be winning
      if (mandatoryWinSpin === 3) {
        // Note: This screen provides: 1 line 3 sym_7, 2 lines 4 syms_4_5, 4 scatter symbols
        //       With total win: 100 + 40 + 50 + 100 = 290 * bet
        reels.forceReels([[5,7,4],[5,4,7],[4,5,7],[8,4,5],[8,8,8]]);
        mandatoryWinSpin = 0;
      } else {
        reels.resetReelsSymbols();
        mandatoryWinSpin++;
      }
    }, 1000);
  }
);

// Add background in ui 
const uiBackground = new PIXI.Graphics();
uiBackground.beginFill(0xa7a9ac);
uiBackground.drawRect(
  -120, 
  0, 
  uiContainer.width * 1.5, 
  uiContainer.height * 2
);
uiBackground.pivot.y = uiContainer.height / 2;
uiBackground.endFill();

uiContainer.addChildAt(uiBackground, 0);

// Load symbol assets using loader
function loadAssets() {
  const manifest = {
    "symbols": [
      "assets/symbols/sym_0.png",
      "assets/symbols/sym_1.png",
      "assets/symbols/sym_2.png",
      "assets/symbols/sym_3.png",
      "assets/symbols/sym_4.png",
      "assets/symbols/sym_5.png",
      "assets/symbols/sym_6.png",
      "assets/symbols/sym_7.png",
      "assets/symbols/sym_8.png",
    ]
  };
  
  loader.add(manifest.symbols).load(() => {
    for (const key in loader.resources) {
      symbols.push(loader.resources[key].texture);
    }
  });
  
  loader.onComplete.add(() => {
    console.log("Symbols loaded:", loader.resources, symbols);
  });
}