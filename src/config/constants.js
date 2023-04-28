// Dimensions of symbols
export const SYMBOL_WIDTH = 300;
export const SYMBOL_HEIGHT = 300;

// Scale of symbols
export const SYMBOL_SCALE = 0.365;

// How many symbols are in the game
export const NUMBER_OF_SYMBOLS = 9;

// How many reels are in the game
export const REEL_NUMBER = 5;

// Full length of one reel of game
export const REEL_LENGTH = 5;

// How many times the reel is gonna respin
export const REEL_REPEAT = 12;

// How many symbols of reel are visible on screen
export const SYMBOLS_ON_SCREEN = 3;

// This is for small spaces between two symbols
export const FRAME_SCALE_OFFSET = 0.9;

// STARTING_BALANCE / CURRENT_BALANCE
export const DEMO_BALANCE = 2000;

// Starting level of bet
export const DEFAULT_BET_LEVEL = 4;

// All available bet amounts
export const BET_AMOUNT_LEVELS = [1, 2, 4, 5, 10, 20, 50, 100, 200, 500, 1000];

// Reel spinning speed
export const REEL_SPEED = 25;

// Reel stopping speed modifier
export const REEL_DECAY = 0.085;

// Reel stopping threshlod
export const STOP_SPIN_SPEED = 3;

// Max win line length
export const WIN_LINE_LENGTH = 5;

// Total game lines
export const TOTAL_LINES = 10;

export const SCATTER_SYMBOL_ID = 8;

// EPS used when stopping symbol to right position
export const EPS_Y = SYMBOL_HEIGHT * SYMBOL_SCALE / 2;
export const EPS = EPS_Y / 2;

// Default font style of game
export const DEFAULT_FONT_STYLE = {
    fontFamily: "Verdana",
    fontVariant: "small-caps",
    fontWeight: "bold",
}