import { presentWin } from "../../redux/slices/gameStateSlice.js";
import store from "../../redux/store.js";
import { REEL_DECAY, REEL_REPEAT, REEL_SPEED, SYMBOLS_ON_SCREEN } from "../config/constants.js";
import { REEL_LENGTH } from "../config/constants.js";
import { FRAME_SCALE_OFFSET, REEL_NUMBER, SYMBOL_HEIGHT, SYMBOL_WIDTH } from "../config/constants.js";
import { Reel } from "./reel.js";

export class Reels {
    reels = [];

    constructor(reelNumber, reelLength, startingPositionX, symbolScale) {
        this.reelLength = reelLength;

        // Construct ticker
        this.ticker = new PIXI.Ticker();
        this.ticker.add(this.update.bind(this));
        this.ticker.start();

        // Create reel and set it's position, give him his id
        for (let i = 0; i < reelNumber; i++) {
            this.reels[i] = new Reel(this.reelLength, symbolScale * FRAME_SCALE_OFFSET);
            this.reels[i].setReelPosition(
                startingPositionX + i * SYMBOL_WIDTH * symbolScale,
                SYMBOL_HEIGHT * symbolScale
            );
            this.reels[i].setReelId(i);
        }

        // Sub to store, accordingly render what you need
        store.subscribe(() => {
            this.gameState = store.getState().gameState;
            console.log(this.gameState.gameState);
        });
    }

    // Reset symbols on reels
    resetReelsSymbols() {
        this.reels.forEach(reel => {
            reel.resetReelSymbols();
        });
    }

    // Force screen that has symbolIdArr values, if not provided default is full scatter screen
    forceReels(symbolIdArr = [[8,8,8],[8,8,8],[8,8,8],[8,8,8],[8,8,8]]) {
        for (let i = 0; i < REEL_NUMBER; i++){
            this.reels[i].forceReel(symbolIdArr[i])
        }
    }

    // Settters and getters for reels position
    setReelsPosition(x, y) {
        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].setReelPosition((i % this.reels.length) * x , y)
        }
    }

    getReelsPosition() {
        return this.reels[0].getReelsPosition();
    }

    // Get screen by taking all visible symbols
    // To get this apps actual screen take all symbols placed on position 1 2 3 of reel
    getScreen() {
        this.screen = [];
        this.reels.forEach(reel => {
            const singleReel = [];
            for (let i = 1; i < 4; i++) {
                singleReel.push(reel.reel[i].getId());
            }

            this.screen.push(singleReel);
        });

        // Getting better representation of screen
        this.screen = this.invertScreen(this.screen);

        return this.screen;
    }

    // Func to change matrix REEL_LENxSYM_ON_SCR to SYM_ON_SCRxREEL_LEN 
    invertScreen(screen) {
        let invertScreen = [];
        for (let i = 0; i < SYMBOLS_ON_SCREEN; i++) {
            invertScreen.push([]);
            for (let j = 0; j < REEL_LENGTH; j++) {
                invertScreen[i].push(screen[j][i]);
            }
        }
        return invertScreen;
    }

    addToContainer(container) {
        this.reels.forEach(reel => {
            reel.addToContainer(container);
        });
    }


    update(delta) {    
        // If in corresponding state, start corresponding action
        if (this.gameState && 
            this.gameState.gameState === 'spinning') {    
                this.reels.forEach(reel => {
                    reel.spinReel(reel.reelSpeed * delta, REEL_REPEAT * REEL_LENGTH);
                });
        }

        if (this.gameState && 
            this.gameState.gameState === 'stopping') {  
                let slowDownSpeed = REEL_DECAY;
                
                this.reels.forEach(reel => {
                    // Slow down speed
                    reel.reelSpeed -= reel.reelSpeed * slowDownSpeed * delta;
                    reel.stopSpinningReel(reel.reelSpeed);     
                });
        } 

        if (this.gameState && 
            this.gameState.gameState === 'preWin') {   
                this.reels.forEach(reel => {
                    reel.reel.forEach(symbol => {
                        if (symbol.isScatter()) {
                            symbol.isProcessed = true;
                            reel.startDropAnim(symbol);
                        }
                    }) 
                });
            
                store.dispatch(presentWin());                    
        }
    }
}