import { SCATTER_SYMBOL_ID } from "../config/constants.js";

// Basic class for Symbol of the game with simple getters and setters
// sprite, _id as simple props and isProcessed to keep track for scatter symbols
export class Symbol {
    _id;
    isProcessed = false;

    constructor(texture, id) {
        this._id = id;

        this.sprite = PIXI.Sprite.from(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.position.set(0, 0);
    }

    setPosition(x, y) {
        this.sprite.position.set(x, y)
    }

    getPosition() {
        return [this.sprite.position.x, this.sprite.position.y];
    }

    setX(x) {
        this.sprite.x = x;
    }

    setY(y) {
        this.sprite.y = y;
    }

    getX() {
        return this.sprite.x;
    } 

    getY() {
        return this.sprite.y;
    } 

    setScale(scale) {
        this.sprite.scale.set(scale);
    }

    getScale() {
        return this.sprite.scale;
    }

    setAnchor(anchor) {
        this.sprite.anchor.set(anchor);
    }

    getId() {
        return this._id;
    }

    isScatter() {
        return this._id === SCATTER_SYMBOL_ID ? true : false;
    }

    destroy() {
        this.sprite.destroy(); 
    }

    changeSymbol(texture, id) {
        this.sprite.texture = texture;
        this._id = id; 
    }

    addToContainer(container) {
        container.addChild(this.sprite);
    }
}