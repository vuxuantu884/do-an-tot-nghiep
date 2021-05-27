import {all} from 'redux-saga/effects';
import { appSaga } from './app.saga';
import { authSaga } from './auth.saga';
import { bootstrapSaga } from './bootstrap.saga';
import { categorySaga } from './category.saga';
import { materialSaga } from './material.saga';
import OrderOnlineSaga from './orderOnline.saga';
import storeSaga  from './store.saga'

function* rootSaga(){
    yield all([
      appSaga(),
      bootstrapSaga(),
      authSaga(),
      categorySaga(),
      materialSaga(),
      storeSaga(),
      OrderOnlineSaga(),
    ]);
}

export default rootSaga;