import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import rootSaga from './sagas';
import connectionSlice from './slices/connectionSlice';
import newSessionDialogSlice from './slices/newSessionDialogSlice';
import sessionSlice from './slices/sessionSlice';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: {
        connection: connectionSlice,
        newSessionDialog: newSessionDialogSlice,
        session: sessionSlice
    },
    middleware: [sagaMiddleware]
});

sagaMiddleware.run(rootSaga);

export default store;
