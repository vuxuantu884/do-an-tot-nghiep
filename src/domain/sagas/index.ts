import {all} from 'redux-saga/effects';
import { appSaga } from './app.saga';
import { authSaga } from './auth.saga';
import { bootstrapSaga } from './bootstrap.saga';
import { categorySaga } from './category.saga';
import { contentSaga } from './content.saga';
import { materialSaga } from './material.saga';
import { sizeSaga } from './size.saga';

import { productSaga } from './product.saga';
function* rootSaga(){
    yield all([
      appSaga(),
      bootstrapSaga(),
      authSaga(),
      categorySaga(),
      productSaga(),
      materialSaga(),
      contentSaga(),
      sizeSaga(),
    ]);
}

export default rootSaga;