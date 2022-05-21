import { createSlice } from '@reduxjs/toolkit';

const newSessionDialogSlice = createSlice({
    name: 'newSessionDialog',
    initialState: {
        isOpen: false
    },
    reducers: {
        open: () => {
            return { isOpen: true };
        },
        close: () => {
            return { isOpen: false };
        }
    }
});

export const { open, close } = newSessionDialogSlice.actions;

export default newSessionDialogSlice.reducer;
