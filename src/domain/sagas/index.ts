import {all} from 'redux-saga/effects';
import { appSaga } from './app.saga';
import { colorSaga } from './product/color.saga';
import { supplierSagas } from './core/supplier.saga';
import OrderOnlineSaga from './order/orderOnline.saga';
import storeSaga  from './core/store.saga'
import searchSagas from './order/search.sagas';
import { authSaga } from './account/auth.saga';
import { bootstrapSaga } from './content/bootstrap.saga';
import { contentSaga } from './content/content.saga';
import { categorySaga } from './product/category.saga';
import { materialSaga } from './product/material.saga';
import { productSaga } from './product/product.saga';
import { sizeSaga } from './product/size.saga';
import { productSaga } from './product/product.saga';
import { supplierSagas } from './core/supplier.saga';
import { accountSaga } from './account/account.saga';
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
      colorSaga(),
      supplierSagas(),
      accountSaga(),
    ]);
}

export default rootSaga;