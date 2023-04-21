import balanceSlice from './slices/balanceSlice.js';
import betLevelSlice from './slices/betLevelSlice.js';
import gameStateSlice from './slices/gameStateSlice.js';

// Idea is to simple have a simple store to track balance, bet and game state
const store = window.RTK.configureStore({
    reducer: {
        balance: balanceSlice.reducer,
        betLevel: betLevelSlice.reducer,
        gameState: gameStateSlice.reducer,
    }
});

store.subscribe(() => {store.getState()});

export default store;