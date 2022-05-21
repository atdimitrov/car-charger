import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import delay from '@redux-saga/delay-p';

import { connect, disconnect } from '../slices/connectionSlice';
import { set } from '../slices/sessionSlice';
import { startSessionType, refreshSessionStatusType, refreshSessionStatus } from '../actions';

const baseUrl = 'http://192.168.0.154';

const sessionSaga = function* () {
    try {
        const result = yield call(fetch, `${baseUrl}/car-charging/status`);
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

const startNewSessionSaga = function* ({ payload }) {
    try {
        yield call(fetch, `${baseUrl}/car-charging/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        yield put(refreshSessionStatus());
    } catch (err) {
        console.log('Failed to start new session', err);
    }
};

const runSessionSaga = function* () {
    yield takeEvery(startSessionType, startNewSessionSaga);
    yield takeLatest(refreshSessionStatusType, sessionSaga);

    while (true) {
        yield call(sessionSaga);
        yield delay(10000);
    }
};

export default runSessionSaga;
