import { call, put } from 'redux-saga/effects';
import delay from '@redux-saga/delay-p';

import { connect, disconnect } from '../slices/connectionSlice';
import { set } from '../slices/sessionSlice';

const sessionSaga = function* () {
    try {
        const result = yield call(fetch, 'http://192.168.0.154/car-charging/status');
        if (result.ok) {
            const session = yield result.json();
            yield put(set(session));
        }

        yield put(connect());
    } catch (err) {
        console.log('Failed fetching status', err);
        yield put(disconnect(err));
    }
};

const runSessionSaga = function* () {
    while (true) {
        yield call(sessionSaga);
        yield delay(10000);
    }
};

export default runSessionSaga;
