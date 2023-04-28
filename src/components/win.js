import { idle } from "../store/slices/gameStateSlice.js";
import store from "../store/store.js";
import { Linear, gsap } from "gsap";
import { TextStyle, TextMetrics, Text, Ticker } from "pixi.js";

export class PopupWin {
    // Text and amount init, setting pos, anchor, scale
    constructor() {
        const style = new TextStyle({
            fill: "0xa7a9ac",
            fontFamily: "Verdana",
            fontSize: 50,
            fontWeight: "bolder",
            letterSpacing: 5,
            stroke: "0xC71E45",
            strokeThickness: 5,
        });
        // Warning about metric elimination
        this.textMetrics = TextMetrics.measureText('WIN', style);
        this.amountMetrics = TextMetrics.measureText('0', style);

        this.text = new Text('WIN', style);
        this.text.alpha = 0;
        this.text.scale.set(0);
        this.text.anchor.set(0.5);
        this.text.position.set(0, 0);

        this.amount = new Text('0', style);
        this.amount.alpha = 0;
        this.amount.scale.set(0);
        this.amount.anchor.set(0.5);
        this.amount.position.set(0, 0);

        // Listen to changes in gameState, accordingly render what you need
        store.subscribe(() => {
            this.gameState = store.getState().gameState;
        });

        this.ticker = new Ticker();
        this.ticker.add(this.update.bind(this));
        this.ticker.start();
    }

    // Indicator to call once, since this triggers once the state goes in presentWin
    showWinIndicator = false;
    hideWinIndicator = false;
    // When win occurs, win slowly enters and grows from center of the screen
    // Also the win is increasing from 0 to amount won
    presentWin(win) {
        // Ensure to call tween only once
        this.showWinIndicator = false;

        const duration = 1;
        const ease = Linear.easeOut;

        gsap.to([this.text, this.amount],
            { alpha: 1, duration, ease });
        gsap.to([this.text.scale, this.amount.scale], { 
            x: 1.5, 
            y: 1.5, 
            duration,
            ease,
            onComplete: () => {
                setTimeout(() => {
                    this.hideWinIndicator = true;
                }, 2000);
            }
        });
        gsap.to(this.amount, {
                text: win,
                duration, 
                roundProps: "text",
                ease,
                onUpdate: () => {
                    this.amount.text = Math.round(this.amount.text);
                },
            }
        )
    };

    hideWin() {
        // Ensure to call tween only once
        this.hideWinIndicator = false;

        const duration = 0.5;
        const ease = Linear.easeIn;

        gsap.to([this.text, this.amount], 
            { alpha: 0, duration,  ease })
        gsap.to([this.text.scale, this.amount.scale],  { 
            x: 0, 
            y: 0, 
            duration, 
            ease,
            onComplete: () => {
                this.amount.text = 0;
                store.dispatch(idle());
            },
         });
    }

    update(delta) {
        if (this.showWinIndicator) {
            this.presentWin();
        }

        if (this.hideWinIndicator) {
            this.hideWin();
        }
    }
}