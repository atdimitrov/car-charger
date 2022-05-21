import { all } from 'redux-saga/effects';

import sessionSaga from './sessionSaga';

const rootSaga = function* () {
    yield all([
        sessionSaga()
    ]);
};

export default rootSaga;
