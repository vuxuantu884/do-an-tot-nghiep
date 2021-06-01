import {all} from 'redux-saga/effects';
import { appSaga } from './app.saga';
import { authSaga } from './auth.saga';
import { bootstrapSaga } from './bootstrap.saga';
import { categorySaga } from './category.saga';
import { contentSaga } from './content.saga';
import { materialSaga } from './material.saga';
import OrderOnlineSaga from './orderOnline.saga';
import storeSaga  from './store.saga'
import { productSaga } from './product.saga';
import searchSagas from './search.sagas';
import { sizeSaga } from './size.saga';
import { supplierSagas } from './core/supplier.saga';
function* rootSaga(){
    yield all([
      appSaga(),
      bootstrapSaga(),
      authSaga(),
      categorySaga(),
      productSaga(),
      materialSaga(),
      storeSaga(),
      OrderOnlineSaga(),
      searchSagas(),
      contentSaga(),
      sizeSaga(),
      supplierSagas(),
    ]);
}

export default rootSaga;