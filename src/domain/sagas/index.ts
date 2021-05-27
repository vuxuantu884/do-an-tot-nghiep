import {all} from 'redux-saga/effects';
import { appSaga } from './app.saga';
import { authSaga } from './auth.saga';
import { bootstrapSaga } from './bootstrap.saga';
import { categorySaga } from './category.saga';
import { productSaga } from './product.saga';
function* rootSaga(){
    yield all([
      appSaga(),
      bootstrapSaga(),
      authSaga(),
      categorySaga(),
      productSaga(),
    ]);
}

export default rootSaga;