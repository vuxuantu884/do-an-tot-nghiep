import {all} from 'redux-saga/effects';
import { appSaga } from './app.saga';
import { authSaga } from './auth.saga';
import { bootstrapSaga } from './bootstrap.saga';

function* rootSaga(){
    yield all([
      appSaga(),
      bootstrapSaga(),
      authSaga(),
    ]);
}

export default rootSaga;