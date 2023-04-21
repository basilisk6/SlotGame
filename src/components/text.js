// Simple text class for creating text in ui
//   for now it has all functionalities from PIXI.Text
export class Text extends PIXI.Text {
    constructor(text, style) {
        super(text, style);
    }

    // Simple getters and setters
    getX() {
        return super.x;
    }

    getY() {
        return super.y;
    }

    setX(x) {
        super.x = x;
    }

    setY(y) {
        super.y = y;
    }

    changeStyle(style) {
        super.style = style;
    }

    setText(text) {
        super.text = text;
    }
}