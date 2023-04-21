import { NUMBER_OF_SYMBOLS, SCATTER_SYMBOL_ID, WIN_LINE_LENGTH } from "./constants.js";

export function calculateWin(screen) {
    // Idea: go through symbols on screen, filter their id to 1 so we have 1's and 0;s screen
    //      then merge filtered screen with all win lines to see 1's and 0's on win lines if any
    //      finish by calculating len of 1's in win line and adding to win
    let totalWin = 0;
    for (let i = 0; i < NUMBER_OF_SYMBOLS; i++) {
        // Scatter calc is different than regular symbol
        if (i === SCATTER_SYMBOL_ID) {
            totalWin += calculateScatterWin(screen);
        } else {   
            // Filter
            const filteredScreen = filterScreenPerSymbol(screen, i);      
            
            // This will provide array with 1's and 0's based per provided winLine
            const resultPerWinLine = getResultFromScreenPerWinLine(filteredScreen);
            
            // Get max len of 1's and add to win if > 3
            let win = calculateWinPerWinLine(resultPerWinLine, i);
            
            totalWin += win;
        }
        // TODO: Win per line
        // winPerLine.push({win, i});
    }
    return totalWin;
}

function filterScreenPerSymbol (screen, symbol) {
    return screen.map(rowLine => rowLine.map(id => id === symbol ? 1 : 0));
}

function getResultFromScreenPerWinLine (screen) {
    const allLineCombinations = [];
    for (let j = 0; j < winLines.length; j++) {
        allLineCombinations[j] = []; 
        for (let k = 0; k < WIN_LINE_LENGTH; k++){
            const winLineIndex = winLines[j][k]; 
            allLineCombinations[j].push(screen[winLineIndex][k]);
        }
    }
    return allLineCombinations
}

function calculateWinPerWinLine(results, symbol) {
    let symbolPayValue = payValues[symbol];
    let win = 0;
    results.forEach(line => {
        let maxLen = line.findIndex((el) => el === 0);
        // If index isn't found then the array is [1, 1, 1, 1, 1]
        if (maxLen === -1) {
            maxLen = 5;
        } 
        
        if (maxLen >= 3) {
            win += symbolPayValue[maxLen];
        }
    });
    return win;
}

function calculateScatterWin(screen) {
    // If there are 4 5 6 or 7 scatter symbols on screen they pay
    let count = 0;
    for (let i = 0; i < screen.length; i++) {
        for (let j = 0; j < screen[i].length; j++) {
            if (screen[i][j] === SCATTER_SYMBOL_ID) {
                count++;
            }
        }
    }
    // If there is more than 7 scatter symbols, pays still as 7
    count = count > 7 ? 7 : count;
    return payValues[SCATTER_SYMBOL_ID][count];
}

export const winLines = [
        // WL 1
        [0, 0, 0, 0, 0],
        // WL 2
        [1, 1, 1, 1, 1],
        // WL 3
        [2, 2, 2, 2, 2],
        // WL 4
        [0, 1, 2, 1, 0],
        // WL 5
        [2, 1, 0, 1, 2],
        // WL 6
        [0, 0, 1, 2, 2],
        // WL 7
        [2, 2, 1, 0, 0],
        // WL 8
        [1, 2, 2, 2, 1],
        // WL 9
        [1, 0, 0, 0, 1],
        // WL 10
        [2, 2, 1, 0, 0],
];

export const payValues = [
    [0, 0, 0, 5, 10, 20], // J
    [0, 0, 0, 5, 15, 30], // Q
    [0, 0, 0, 10, 20, 40], // K
    [0, 0, 0, 10, 25, 50], // A
    [0, 0, 0, 20, 40, 80], // RockRed
    [0, 0, 0, 20, 50, 100], // RockCyan
    [0, 0, 0, 50, 100, 200], // Cart
    [0, 0, 0, 100, 200, 500], // Helmet
    [0, 0, 0, 0, 100, 500, 2000, 5000], // Miner / Scatter
];