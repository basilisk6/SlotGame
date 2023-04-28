import { Sprite } from "pixi.js";
// Basic button class for ui, 
//    since i use it as Sprite, 
//    has more sense to be in a button class
export class Button extends Sprite {
    constructor (texture, scale, anchor) {
        super(texture);

        this.scale.set(scale);
        this.anchor.set(anchor); 
        this.interactive = true;
        this.buttonMode = true;
    }

    setX(x) {
        super.x = x;
    }

    setY(y) {
        super.y = y;
    }

    getX() {
        return super.x;
    }

    getY() {
        return super.y;        
    }

    disableButton () {
        this.interactive = false;
    }

    enableButton() {
        this.interactive = true;
    }

}