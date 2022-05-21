import { createSlice } from '@reduxjs/toolkit';

const sessionSlice = createSlice({
    name: 'session',
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

export const { set } = sessionSlice.actions;

export default sessionSlice.reducer;
