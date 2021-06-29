import {all} from 'redux-saga/effects';
import { appSaga } from './app.saga';
import { colorSaga } from './product/color.saga';
import { supplierSagas } from './core/supplier.saga';
import OrderOnlineSaga from './order/order-online.saga';
import {StoreSaga}  from './core/store.saga'
import { authSaga } from './auth/auth.saga';
import { bootstrapSaga } from './content/bootstrap.saga';
import { contentSaga } from './content/content.saga';
import { categorySaga } from './product/category.saga';
import { materialSaga } from './product/material.saga';
import { productSaga } from './product/product.saga';
import { sizeSaga } from './product/size.saga';
import { accountSaga } from './account/account.saga';
import sourceSaga from './order/source.saga';
import customerSagas from './customer/customer.saga';
import { roleSaga } from './auth/role.saga';
function* rootSaga(){
    yield all([
      appSaga(),
      bootstrapSaga(),
      authSaga(),
      categorySaga(),
      productSaga(),
      materialSaga(),
      StoreSaga(),
      OrderOnlineSaga(),
      contentSaga(),
      sizeSaga(),
      colorSaga(),
      supplierSagas(),
      accountSaga(),
      sourceSaga(),
      customerSagas(),
      roleSaga()
    ]);
}

export default rootSaga;