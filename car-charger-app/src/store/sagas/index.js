import { all } from 'redux-saga/effects';

import statusSaga from './statusSaga';

const rootSaga = function* () {
    yield all([
        statusSaga()
    ]);
};

export default rootSaga;
