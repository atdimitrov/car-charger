import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import rootSaga from './sagas';
import statusSlice from './slices/statusSlice';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: {
        status: statusSlice
    },
    middleware: [sagaMiddleware]
});

sagaMiddleware.run(rootSaga);

export default store;
