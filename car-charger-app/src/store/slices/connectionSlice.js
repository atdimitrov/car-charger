import { createSlice } from '@reduxjs/toolkit';

const connectionSlice = createSlice({
    name: 'connection',
    initialState: {
        attemptMade: false,
        connected: false,
        lastError: undefined
    },
    reducers: {
        connect: () => {
            return {
                attemptMade: true,
                connected: true
            };
        },
        disconnect: (_, { payload: { error }}) => {
            return {
                attemptMade: true,
                connected: false,
                lastError: `${new Date().toString()}: ${error}`
            };
        }
    }
});

export const { connect, disconnect } = connectionSlice.actions;

export default connectionSlice.reducer;
