import { REEL_DECAY, REEL_LENGTH, REEL_NUMBER, REEL_REPEAT, REEL_SPEED, EPS, EPS_Y, STOP_SPIN_SPEED, SYMBOLS_ON_SCREEN, SYMBOL_HEIGHT, SYMBOL_SCALE, SYMBOL_WIDTH } from "../config/constants.js";
import { preWin, stopSpin, presentWin } from "../../redux/slices/gameStateSlice.js";
import { symbols } from "../main.js";
import store from "../../redux/store.js";
import { Symbol } from "./symbol.js";

export class Reel {
    reel = [];
    delta;

    constructor(reelLength, symbolScale) {
        this.reelLength = reelLength;
        this.symbolScale = symbolScale;
        
        let symbolId;
        // Create single reel and fill with random symbols
        for (let i = 0; i < this.reelLength; i++){
            symbolId = Math.floor(Math.random() * symbols.length);
            const texture = symbols[symbolId];
            this.reel[i] = new Symbol(texture, symbolId);
            this.reel[i].setScale(this.symbolScale);
        }
        
        this.reelSpeed = REEL_SPEED;
    }

    // Reset symbols on one screen by changing texture
    resetReelSymbols() {
        let symbolId;
        for (let i = 0; i < this.reelLength; i++){
            symbolId = Math.floor(Math.random() * symbols.length);
            const texture = symbols[symbolId];
            this.reel[i].changeSymbol(texture, symbolId);
        }

        // Something like this would be used with 'destroy() and make new Symbol' approach
        // for (let i = 0; i < this.reelLength; i++){
        //     symbolId = Math.floor(Math.random() * symbols.length);
        //     const texture = symbols[symbolId];
        //     if (this.reel[i]) {
        //         this.reel[i].destroy();
        //     }
        //     this.reel[i] = new Symbol(texture, symbolId);
        //     this.reel[i].setScale(this.symbolScale);
        // }
    }

    // Forcing one reel to have its screen symbols according to forceId
    forceReel(forceIds) {
        let symbolIdArr = [];
        // Note: Since above mask is one symbol, we get random id for it
        //      then for next 3 we take forcedIds,
        //      then fill the rest of length of the reel with random id's again
        const fillerArr = new Array(REEL_LENGTH - SYMBOLS_ON_SCREEN - 1);
        for (let i = 0; i < fillerArr.length; i++) {
          fillerArr[i] = Math.floor(Math.random() * symbols.length);
        }
        symbolIdArr = symbolIdArr
            .concat(Math.floor(Math.random() * symbols.length))
            .concat(forceIds)
            .concat(fillerArr);

        // Change symbols according to new filled symbolIdArr
        for (let i = 0; i < symbolIdArr.length; i++){
            const texture = symbols[symbolIdArr[i]];
            this.reel[i].changeSymbol(texture, symbolIdArr[i]);
        }
    }

    // Settters and getters for various props
    setReelPosition(x, y) {
        for (let i = 0; i < this.reel.length; i++) {
            this.reel[i].setPosition(
                x,
                i * y - (SYMBOL_WIDTH * SYMBOL_SCALE / 2) 
            );
        }
    }

    getReelPosition() {
        return this.reel[0].getPosition();
    }

    getReelY() {
        return this.reel[0].getPosition()[1];
    }

    setReelId(id) {
        this.reelId = id;
    }

    getReelId() {
        return this.reelId;
    }

    setDelta(delta) {
        this.delta = delta;
    }

    addToContainer(container) {
        this.reel.forEach(symbol => {
            symbol.addToContainer(container);
        });
    }
   
    spinRepeat = 0;
    // Bounds to put symbol from bottom to top
    // Note: Upper bound isn't 0 because of anchor 0.5 ergo SYMBOL_WIDTH * SYMBOL_SCALE / 2
    // Note: this.symbolScale != SYMBOL_SCALE because of FRAME_SCALE_OFFSET, so we use SYMBOL_SCALE
    reelUpperBound = -SYMBOL_WIDTH * SYMBOL_SCALE / 2;
    reelLowerBound = SYMBOL_HEIGHT * SYMBOL_SCALE * REEL_LENGTH 
        - SYMBOL_WIDTH * SYMBOL_SCALE / 2;
    // Starts spinning of reel, repeatCount is for how many times the symbols is gonna reset before stopping
    spinReel(spinSpeed, repeatCount) {
        this.reel.forEach(symbol => {
            // Start spinning reel by passed speed
            symbol.setY(symbol.getY() + spinSpeed)

            // Reset position of symbol when it's out of bounds of reel
            if (symbol.getY() > this.reelLowerBound) {
                symbol.setY(this.reelUpperBound);
                this.spinRepeat++;
            }
        });
        
        // Go to stopping state of spin if condition is met for last reel
        if (this.spinRepeat === repeatCount && this.reelId === REEL_NUMBER - 1) {
            this.spinRepeat = 0;
            store.dispatch(stopSpin());
        } 
    }
    
    tweensCompleted = false;
    // Stop spinning by having decayed speed over time, when threshold is met: tween to stop visible symbols,
    //      and invisible symbols just reset
    stopSpinningReel(speed) {
        this.reel.forEach(symbol => {
            symbol.setY(symbol.getY() + speed);

            if (symbol.getY() > this.reelLowerBound) {
                symbol.setY(this.reelUpperBound);
            }
        });

        // When spin is stopped go to drop anim
        if (speed <= STOP_SPIN_SPEED) { 
            // If symbol position isn't in his EPS area to tween, continue spin untill it is
            // if(!this.checkForEPS()) {
            //     // Extend spin with a bit boost untill symbols are in EPS
            //     console.log("Not in eps")
            // }          
            this.triggerStopTween();

            if (this.tweensCompleted ) { //this.tweensCompleted > SYMBOLS_ON_SCREEN) {
                this.tweensCompleted = false;
                this.reelSpeed = REEL_SPEED;
                if (this.reelId === REEL_NUMBER - 1) {
                    store.dispatch(preWin());
                }
            }
        }
    }

    // Tween visible symbols to their position and reset invisible (under mask) ones
    triggerStopTween() {
        const ease = Power1.easeIn;
        const duration = 0.15;
        let yPosToTween = (SYMBOL_HEIGHT * SYMBOL_SCALE / 2);
        // Center visible symbols by setting good position Y,
        // Note: Good pos: i * SYMBOL_HEIGHT * SYMBOL_SCALE -  (SYMBOL_HEIGHT * SYMBOL_SCALE / 2)
        //  but formulated better with yPosToTween
        for (let i = 0; i < REEL_LENGTH; i++) {
            // Visible symbols 
            if (i > 0 && i <= SYMBOLS_ON_SCREEN) {
                gsap.to( this.reel[i].sprite, {
                    duration: duration, 
                    y: yPosToTween * (2 * i - 1), ease,
                    onComplete: () => {
                        this.tweensCompleted = true;
                    }
                });
            } else {
                // Not visible symbols
                this.reel[i].setY(
                    yPosToTween * (2 * i - 1)
                );
            } 
        }
    }

    // Idea: If symbol is close to its EPS surroundings, then it's fit to tween it
    // It's enough to check for EPS surroundings of one (in this case: first visible)
    checkForEPS() {
        if (this.reel[1].getY() > EPS_Y - EPS && this.reel[1].getY() < EPS_Y + EPS) {
            // console.log("EPS");
            return true; 
        } else {
            return false;
        }
    }

    // Drop animation of symbol is a simple pulsing animation using tweens
    // Keeps track is symbol is processed so it is only called once
    // On complete pops symbol from scatterQ needed for later state switch
    startDropAnim(symbol) {
        if (!symbol.isProcessed) {
            return
        }

        let tweenTimeline;
        const duration = 0.15;
        if (!tweenTimeline) {
            const ease = Power2.easeIn;
            
            tweenTimeline = new gsap.timeline({
                repeat: 1, // Pulse twice
                onComplete: () => {
                    symbol.isProcessed = false;
                }
            })
            tweenTimeline
            .add(gsap.to(symbol.sprite.scale, {
                    duration: duration, 
                    x: this.symbolScale + 0.01, 
                    y: this.symbolScale + 0.02, 
                    ease 
                }))
            .add(gsap.to(symbol.sprite.scale, { 
                    duration: duration,
                    x: this.symbolScale, 
                    y: this.symbolScale, 
                    ease, 
                    delay: duration,
                })
            );         
            tweenTimeline.play();
        }
    }
}