import { all } from "redux-saga/effects";
import { accountSaga } from "./account/account.saga";
import { appSaga } from "./app.saga";
import { authSaga } from "./auth/auth.saga";
import { permissionSaga } from "./auth/permission.saga";
import { roleSaga } from "./auth/role.saga";
import { bootstrapSaga } from "./content/bootstrap.saga";
import { contentSaga } from "./content/content.saga";
import { storeSaga } from "./core/store.saga";
import { supplierSagas } from "./core/supplier.saga";
import { customerGroupSaga } from "./customer/customer-group.saga";
import customerSagas from "./customer/customer.saga";
import { ecommerceSaga } from "./ecommerce/ecommerce.saga";
import { inventorySaga } from "./invetory/inventory.saga";
import { inventoryTransferSaga } from "./invetory/inventory-transfer.saga";
import { loyaltySaga } from "./loyalty/loyalty.saga";
import { OrderActionLogSaga } from "./order/action-log.saga";
import { OrderReturnSaga } from "./order/order-return.saga";
import { OrderOnlineSaga } from "./order/order.saga";
import { paymentConditionsSaga } from "./po/payment-conditions.saga";
import { poPaymentSaga } from "./po/po-payment.saga";
import { poProcumentSaga } from "./po/po-procument.saga";
import { PurchaseOrderActionLogSaga } from "./po/action-log.saga";
import { poSaga } from "./po/po.saga";
import { settingPrinterSaga } from "./printer/printer.saga";
import { categorySaga } from "./product/category.saga";
import { colorSaga } from "./product/color.saga";
import { materialSaga } from "./product/material.saga";
import { productSaga } from "./product/product.saga";
import { sizeSaga } from "./product/size.saga";
import { settingOrderProcessingStatusSaga } from "./settings/order-processing-status.saga";
import { settingOrdersSaga } from "./settings/order-settings.saga";
import { inventoryAdjustmentSaga } from "./invetory/inventory-adjustment.saga"; 
import { settingOrderSourceSaga } from "./settings/order-source.saga";
import { departmentSaga } from "./account/department.saga";
import { discountSaga } from "./promotion/discount/discount.saga";
import { GoodsReceiptsSaga } from "./goods-receipts/goods-receipts.saga";
import { moduleSaga } from "./auth/module.saga";
import { promoCodeSaga } from "./promotion/promo-code/promo-code.saga";
import { collectionSaga } from "./product/collection.saga";
import { OrderDuplicateSaga } from "./order/order-duplicate.saga";
import { importSaga } from "./core/import.saga";

function* rootSaga() {
  yield all([
    appSaga(),
    bootstrapSaga(),
    authSaga(),
    categorySaga(),
    collectionSaga(),
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
    settingOrderProcessingStatusSaga(),
    settingOrderSourceSaga(),
    settingPrinterSaga(),
    paymentConditionsSaga(),
    poPaymentSaga(),
    poProcumentSaga(),
    PurchaseOrderActionLogSaga(),
    customerGroupSaga(),
    OrderActionLogSaga(),
    inventorySaga(),
    inventoryTransferSaga(),
    settingOrdersSaga(),
    loyaltySaga(),
    ecommerceSaga(),
    OrderReturnSaga(),
    inventoryAdjustmentSaga(),
    discountSaga(),
    promoCodeSaga(),
    departmentSaga(),
    GoodsReceiptsSaga(),
    moduleSaga(),
    OrderDuplicateSaga(),
    importSaga()
  ]);
}

export default rootSaga;
