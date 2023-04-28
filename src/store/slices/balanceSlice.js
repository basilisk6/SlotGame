import { DEMO_BALANCE } from '../../config/constants.js';
import { createSlice } from '@reduxjs/toolkit';

// Track balance status, just one reducer that updates it, 
//      can be for subtracting or adding to balance
const balanceSlice = createSlice({
    name: "balance",
    initialState: {
        amount: DEMO_BALANCE,
    },
    reducers: {
        updateBalance: (state, action) => {
            state.amount = action.payload
        },
    },
});

export const { updateBalance } = balanceSlice.actions;

export default balanceSlice;