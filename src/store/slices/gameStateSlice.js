import { createSlice } from '@reduxjs/toolkit';

// Slice for tracking states of game, depending on state redner different stuff in game
const gameStateSlice = createSlice({
    name: 'gameState',
    initialState: {
        gameState: 'idle' // Idea of flow: idle -> spinning -> stopping -> prewin -> win -> idle
    },
    reducers: {
        startSpin: state => {
            state.gameState = 'spinning'
        },
        stopSpin: state => {
            state.gameState = 'stopping'
        },
        preWin: state => {
            state.gameState = 'preWin'
        },
        presentWin: state => {
            state.gameState = 'presentWin'
        },
        idle: state => {
            state.gameState = 'idle'
        }
    }
});

export const { startSpin, stopSpin, preWin, presentWin, idle } = gameStateSlice.actions; 

export default gameStateSlice;