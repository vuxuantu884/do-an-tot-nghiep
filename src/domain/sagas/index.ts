import { all } from "redux-saga/effects";
import { appSaga } from "./app.saga";
import { colorSaga } from "./product/color.saga";
import { supplierSagas } from "./core/supplier.saga";
import OrderOnlineSaga from "./order/order.saga";
import {storeSaga} from "./core/store.saga";
import { authSaga } from "./auth/auth.saga";
import { bootstrapSaga } from "./content/bootstrap.saga";
import { contentSaga } from "./content/content.saga";
import { categorySaga } from "./product/category.saga";
import { materialSaga } from "./product/material.saga";
import { productSaga } from "./product/product.saga";
import { sizeSaga } from "./product/size.saga";
import { accountSaga } from "./account/account.saga";
import customerSagas from "./customer/customer.saga";
import { roleSaga } from "./auth/role.saga";
import { permissionSaga } from "./auth/permission.saga";
import { poSaga } from "./po/po.saga";
function* rootSaga() {
  yield all([
    appSaga(),
    bootstrapSaga(),
    authSaga(),
    categorySaga(),
    productSaga(),
    materialSaga(),
    storeSaga(),
    OrderOnlineSaga(),
    contentSaga(),
    sizeSaga(),
    colorSaga(),
    supplierSagas(),
    accountSaga(),
    customerSagas(),
    roleSaga(),
    permissionSaga(),
    poSaga(),
  ]);
}

export default rootSaga;
