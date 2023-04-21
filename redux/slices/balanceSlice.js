import { DEMO_BALANCE } from '../../src/config/constants.js';

// Track balance status, just one reducer that updates it, 
//      can be for subtracting or adding to balance
const balanceSlice = window.RTK.createSlice({
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