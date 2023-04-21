import { BET_AMOUNT_LEVELS, DEFAULT_BET_LEVEL, DEFAULT_FONT_STYLE, DEMO_BALANCE } from "../config/constants.js";
import store from "../../redux/store.js";
import { updateBalance } from "../../redux/slices/balanceSlice.js";
import { decreaseBetLevel, increaseBetLevel } from "../../redux/slices/betLevelSlice.js";
import { Text } from "./text.js";
import { Button } from "./button.js";

export class UI {
    userHasEnoughFunds = true;

    // Creates balance text, amount, bet amount and buttons for increase decrease and spin
    // Sets it's pos, anchor, scale, inits handlers onClick 
    constructor() {
        this.style = DEFAULT_FONT_STYLE;

        this.balanceText = new Text('Balance: ', this.style); 
        this.balanceText.setX(-20);

        this.balanceAmount = new Text(DEMO_BALANCE, this.style);  
        this.balanceAmount.setX(this.balanceText.x + this.balanceText.width);

        this.betAmountContainer = new PIXI.Container();
        this.betAmountContainer.pivot.x = 0.5;

        this.betAmount = new Text(BET_AMOUNT_LEVELS[DEFAULT_BET_LEVEL], this.style);
        this.betAmountContainer.addChild(this.betAmount);
        this.betAmount.setX(this.betAmountContainer.width * 0.5);

        const arrowTexture = new PIXI.Texture.from('./assets/ui/arrowButton.png');
        this.decreaseBetButton = new Button(arrowTexture, 0.1, 0.5);
            
        this.increaseBetButton = new Button(arrowTexture, 0.1, 0.5);
        this.increaseBetButton.rotation = Math.PI;

        const spinTexture = new PIXI.Texture.from('./assets/ui/spinButton.png');
        this.spinButton = new Button(spinTexture, 0.2, 0.5);
        this.spinButton.position.set(
            1000, 
            0
        );     

        this.decreaseBetButton.on('pointerdown', () => this.decreaseBetAmount());
        this.increaseBetButton.on('pointerdown', () => this.increaseBetAmount());
        this.spinButton.on('pointerdown', () => this.spinReels());
    }

    // Subs balance and bet to get their values from store
    subToStore() {
        store.subscribe(() => {
            const currentBalance = store.getState().balance;
            const betAmount = store.getState().betLevel;
    
            this.balanceAmount.setText(currentBalance.amount);
            this.betAmount.setText(betAmount.currentBet);
        });  
    }

    // Decrease and increase bet
    decreaseBetAmount() {
        // Ensuring that you can't decrease minimum bet
        if (store.getState().betLevel.currentLevel === 0) {
            this.decreaseBetButton.disableButton();
            this.increaseBetButton.enableButton();
        } else {
            this.decreaseBetButton.enableButton();
            this.increaseBetButton.enableButton();
            store.dispatch(decreaseBetLevel(this.betAmount.text));
        }
    }

    increaseBetAmount() {
        // Ensuring that you can't increase maximum bet    
        if (store.getState().betLevel.currentLevel >= BET_AMOUNT_LEVELS.length - 1) {
            this.increaseBetButton.disableButton();
            this.decreaseBetButton.enableButton();
        } else {       
            this.decreaseBetButton.enableButton();
            this.increaseBetButton.enableButton();
            store.dispatch(increaseBetLevel(this.betAmount.text));
        }
    }

    // When spin button is clicked
    spinReels() {
        // Insufficient funds msg
        if (this.balanceAmount.text - this.betAmount.text < 0) {
            // TODO: Add popup with err msg
            this.userHasEnoughFunds = false;
            return;
        } else {
            this.userHasEnoughFunds = true;
            store.dispatch(updateBalance(this.balanceAmount.text - this.betAmount.text));
        }
    }

    // Think about adding buttons to their containers
    addToContainer(container) {
        container.addChild(
            this.balanceText, 
            this.balanceAmount, 
            this.decreaseBetButton,
            this.betAmountContainer,
            this.increaseBetButton,
            this.spinButton,
        );
    }
}