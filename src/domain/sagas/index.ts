import {all} from 'redux-saga/effects';
import { appSaga } from './app.saga';
import { authSaga } from './account/auth.saga';
import { bootstrapSaga } from './content/bootstrap.saga';
import { categorySaga } from './product/category.saga';
import { contentSaga } from './content/content.saga';
import { materialSaga } from './product/material.saga';
import { sizeSaga } from './product/size.saga';

import { productSaga } from './product/product.saga';
import { supplierSagas } from './core/supplier.saga';
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
      supplierSagas(),
    ]);
}

export default rootSaga;