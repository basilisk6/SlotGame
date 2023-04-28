import { BET_AMOUNT_LEVELS, DEFAULT_BET_LEVEL } from '../../config/constants.js';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentLevel: DEFAULT_BET_LEVEL,
    betAmounts: BET_AMOUNT_LEVELS,
    currentBet: BET_AMOUNT_LEVELS[DEFAULT_BET_LEVEL],
}

// Slice to increase or decrease bet levels by changing bet level 
//      and then getting current bet based on current bet level
const betLevelSlice = createSlice({
    name: "betAmount",
    initialState,
    reducers: {
        increaseBetLevel: state => {
            state.currentLevel += 1;
            state.currentBet = state.betAmounts[state.currentLevel];
        },
        decreaseBetLevel: state => {
            state.currentLevel -= 1;
            state.currentBet = state.betAmounts[state.currentLevel];
        },
    },
});

export const { increaseBetLevel, decreaseBetLevel } = betLevelSlice.actions;

export default betLevelSlice;