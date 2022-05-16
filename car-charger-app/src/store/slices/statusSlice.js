import { createSlice } from '@reduxjs/toolkit';

const statusSlice = createSlice({
    name: 'status',
    initialState: {
        status: 0,
        duration: 0,
        timeToStart: 0,
        timeToEnd: 0,
        progress: 0
    },
    reducers: {
        set: (state, action) => {
            return { ...state, ...action.payload };
        }
    }
});

export const { set } = statusSlice.actions;

export default statusSlice.reducer;