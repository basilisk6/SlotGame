import { REEL_LENGTH, REEL_NUMBER, REEL_SPEED, EPS, EPS_Y, STOP_SPIN_SPEED, 
    SYMBOLS_ON_SCREEN, SYMBOL_HEIGHT, SYMBOL_SCALE, SYMBOL_WIDTH, NUMBER_OF_SYMBOLS, REEL_REPEAT } from "../config/constants.js";
import { preWin, stopSpin } from "../store/slices/gameStateSlice.js";
import { loadSymbolAssets } from "../index.js";
import store from "../store/store.js";
import { gsap, Expo, Power2, Power0, Power1, Power4, Power3, Back } from "gsap";
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
            symbolId = Math.floor(Math.random() * NUMBER_OF_SYMBOLS);
            const texture = loadSymbolAssets[`sym_${symbolId}`]; 
            this.reel[i] = new Symbol(texture, symbolId);
            this.reel[i].setScale(this.symbolScale);
            
        }
        
        this.reelSpeed = REEL_SPEED;
    }

    // Reset symbols on one screen by changing texture
    resetReelSymbols() {
        let symbolId;
        for (let i = 0; i < this.reelLength; i++){
            symbolId = Math.floor(Math.random() * NUMBER_OF_SYMBOLS);
            const texture = loadSymbolAssets[`sym_${symbolId}`];
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
          fillerArr[i] = Math.floor(Math.random() * NUMBER_OF_SYMBOLS);
        }
        symbolIdArr = symbolIdArr
            .concat(Math.floor(Math.random() * NUMBER_OF_SYMBOLS))
            .concat(forceIds)
            .concat(fillerArr);

        // Change symbols according to new filled symbolIdArr
        for (let i = 0; i < symbolIdArr.length; i++){
            const texture = loadSymbolAssets[`sym_${symbolIdArr[i]}`];
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
   
    // Tweens to start spinning reel
    spinReel() {   
        for (let i = 0; i < this.reelLength; i++) {
            // First tween to give slingshot animation of reels first going slowly upside
            gsap.to(this.reel[i].sprite, 
                {
                    y: `-= ${SYMBOL_HEIGHT * SYMBOL_SCALE}`,
                    duration: 0.2,
                    ease: Power1.easeIn,
                    onComplete: () => {
                        // Second tween to actually spin the full length of the reel
                        gsap.to(this.reel[i].sprite,  
                            { 
                                // Tweak length of tween with REEL_REPEAT
                                // + 4 is added for completion to full circle of reel strip
                                y: `+= ${SYMBOL_HEIGHT * SYMBOL_SCALE * (REEL_LENGTH * REEL_REPEAT + 4) / 2}`, 
                                duration: 3,
                                ease: Power2.easeOut,
                                modifiers: {
                                    y: gsap.utils.unitize(y => -54.75 + parseFloat(y) % (SYMBOL_HEIGHT * SYMBOL_SCALE * 5))
                                },
                                onComplete: () => {
                                    // When last symbol of last reelId finished, call dispatch
                                    if (this.reelId === REEL_NUMBER - 1 && i == this.reelLength - 1){
                                        store.dispatch(stopSpin());
                                    }
                                }
                            }
                        )
                    }
                }
            )
        };
    }
    
    // Stop spinning by having decayed speed over time, when threshold is met: tween to stop visible symbols,
    //      and invisible symbols just reset
    stopSpinningReel() {
        let yPosToTween = (SYMBOL_HEIGHT * SYMBOL_SCALE / 2);

        // Note: Good pos: i * SYMBOL_HEIGHT * SYMBOL_SCALE -  (SYMBOL_HEIGHT * SYMBOL_SCALE / 2)
        //  but formulated better with yPosToTween
        for (let i = 0; i < REEL_LENGTH; i++) {
            gsap.to( this.reel[i].sprite, {
                duration: 0.2,
                y: yPosToTween * (2 * i - 1), 
                ease: Power0.easeOut,
                onComplete: () => {
                    if (this.reelId === REEL_NUMBER - 1 && i == this.reelLength - 1){
                        store.dispatch(preWin());
                    }
                }
            });
        }
    }

    triggerStopTween() {
        
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
        }
    }

    update() {
        this.reels.forEach(symbol => {
            if (symbol.getY() > this.reelLowerBound) {
                symbol.setY(this.reelUpperBound);
            }
        });
    }
}