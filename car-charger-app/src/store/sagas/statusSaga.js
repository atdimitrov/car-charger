import { call, put } from 'redux-saga/effects';
import delay from '@redux-saga/delay-p';

import { set } from '../slices/statusSlice';

const statusSaga = function* () {
    try {
        const result = yield call(fetch, 'http://192.168.0.232/car-charging/status');
        if (result.ok) {
            const status = yield result.json();
            yield put(set(status));
        }
    } catch (err) {
        console.log('Failed fetching status', err);
    }
};

const runStatusSaga = function* () {
    while (true) {
        yield call(statusSaga);
        yield delay(10000);
    }
};

export default runStatusSaga;
