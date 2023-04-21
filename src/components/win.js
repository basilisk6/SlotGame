import { idle } from "../../redux/slices/gameStateSlice.js";
import store from "../../redux/store.js";

export class PopupWin {
    // Text and amount init, setting pos, anchor, scale
    constructor() {
        const style = new PIXI.TextStyle({
            fill: "0xa7a9ac",
            fontFamily: "Verdana",
            fontSize: 50,
            fontWeight: "bolder",
            letterSpacing: 5,
            stroke: "0xC71E45",
            strokeThickness: 5,
        });
        // Warning about metric elimination
        this.textMetrics = PIXI.TextMetrics.measureText('WIN', style);
        this.amountMetrics = PIXI.TextMetrics.measureText('0', style);

        this.text = new PIXI.Text('WIN', style);
        this.text.alpha = 0;
        this.text.scale.set(0);
        this.text.anchor.set(0.5);
        this.text.position.set(0, 0);

        this.amount = new PIXI.Text('0', style);
        this.amount.alpha = 0;
        this.amount.scale.set(0);
        this.amount.anchor.set(0.5);
        this.amount.position.set(0, 0);

        // Listen to changes in gameState, accordingly render what you need
        store.subscribe(() => {
            this.gameState = store.getState().gameState;
        });

        this.ticker = new PIXI.Ticker();
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

        TweenMax.to([this.text, this.amount], duration, 
            { alpha: 1, ease });
        TweenMax.to([this.text.scale, this.amount.scale], duration, { 
            x: 1.5, 
            y: 1.5, 
            ease,
            onComplete: () => {
                setTimeout(() => {
                    this.hideWinIndicator = true;
                }, 2000);
            }
        });
        TweenMax.to(this.amount, duration, {
                text: win,
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

        TweenMax.to([this.text, this.amount], duration, 
            { alpha: 0, ease })
        TweenMax.to([this.text.scale, this.amount.scale], duration, { 
            x: 0, 
            y: 0, 
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