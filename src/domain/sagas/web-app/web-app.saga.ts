import { callApiSaga } from "utils/ApiUtils";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { WebAppType } from "domain/types/web-app.type";
import { PageResponse } from "model/base/base-metadata.response";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  webAppCreateConfigApi,
  webAppGetShopApi,
  webAppGetByIdApi,
  webAppUpdateConfigApi,
  webAppDeleteApi,
  webAppConnectSyncApi,
  webAppGetConfigInfoApi,
  webAppGetVariantsApi,
  webAppDownloadProductApi,
  webAppDeleteProductApi,
  webAppDisconnectProductApi,
  webAppSyncStockProductApi,
  webAppGetCategoryListApi,
  webAppPutConnectProductApi,
  webAppDownloadOrderApi,
  webAppGetOrderMappingListApi,
  webAppSyncOrderApi,
  webAppGetStoreAddressApi,
  webAppCreateLogisticApi,
  webAppConcatenateByExcelApi,
  webAppGetPrintForm,
  webAppExitJobsApi,
} from "service/web-app/web-app.service";
import { showError } from "utils/ToastUtils";
import { WebAppResponse } from "model/response/web-app/ecommerce.response";
import { hideLoading, showLoading } from "domain/actions/loading.action";

// connect to the eccommerce
function* webAppConnectSaga(action: YodyAction) {
  let { webAppId, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<WebAppResponse>> = yield call(
      webAppConnectSyncApi,
      webAppId
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppGetConfigInfoSaga(action: YodyAction) {
  let { params, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<WebAppResponse>> = yield call(
      webAppGetConfigInfoApi,
      params
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}
//
function* webAppCreateConfigSaga(action: YodyAction) {
  let { request, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<WebAppResponse>> = yield call(
      webAppCreateConfigApi,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppGetByIdSaga(action: YodyAction) {
  let { id, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<WebAppResponse>> = yield call(
      webAppGetByIdApi,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppUpdateConfigSaga(action: YodyAction) {
  let { id, request, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<WebAppResponse>> = yield call(
      webAppUpdateConfigApi,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppDeleteSaga(action: YodyAction) {
  let { id, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<WebAppResponse>> = yield call(
      webAppDeleteApi,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppGetVariantsSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      webAppGetVariantsApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppGetShopSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      webAppGetShopApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppDownloadProductSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      webAppDownloadProductApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppDeleteProductSaga(action: YodyAction) {
  let { ids, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      webAppDeleteProductApi,
      ids
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppDisconnectProductSaga(action: YodyAction) {
  let { ids, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      webAppDisconnectProductApi,
      ids
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppSyncStockProductSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  yield put(showLoading());
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      webAppSyncStockProductApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* webAppSyncOrderSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  yield put(showLoading());
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      webAppSyncOrderApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* webAppGetCategoryListSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      webAppGetCategoryListApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppPutConnectProductSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      webAppPutConnectProductApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

//web app order saga
function* webAppDownloadOrderSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      webAppDownloadOrderApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

//web app get order mapping list saga
function* webAppGetOrderMappingListSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      webAppGetOrderMappingListApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        setData(false);
        break;
    }
  } catch (error) {
    setData(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppGetStoreAddressSaga(action: YodyAction){
  const { query, callback } = action.payload;
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
        webAppGetStoreAddressApi,
        query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        callback(false);
        break;
    }
  } catch (error) {
    callback(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppCreateLogisticOrder(action: YodyAction){
  const { request , callback } = action.payload;
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
        webAppCreateLogisticApi,
        request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        callback(false);
        break;
    }
  } catch (error) {
    callback(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* webAppConcatenateByExcelSaga(action: YodyAction) {
  const { formData, callback } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<any> = yield call(webAppConcatenateByExcelApi, formData);
    if (response.code) {
      callback(response);
    } else {
      callback(null);
      yield put(unauthorizedAction());
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* webAppDownloadPrintForm(action: YodyAction) {
  const { request, callback } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<any> = yield call(webAppGetPrintForm, request);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        callback(false);
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* webAppExitJobsSaga(action: YodyAction) {
  const { query, callback } = action.payload;
  yield callApiSaga({isShowLoading:true}, callback, webAppExitJobsApi, query);
}

export function* webAppSaga() {
  yield takeLatest(WebAppType.WEB_APP_UPDATE_CONFIG_REQUEST, webAppUpdateConfigSaga);
  yield takeLatest(WebAppType.WEB_APP_CREATE_CONFIG_REQUEST, webAppCreateConfigSaga);
  yield takeLatest(WebAppType.WEB_APP_GET_CONFIG_INFO_REQUEST, webAppGetConfigInfoSaga);
  yield takeLatest(WebAppType.WEB_APP_CONNECT_CONFIG_REQUEST, webAppConnectSaga);
  yield takeLatest(WebAppType.WEB_APP_GET_CONFIG_BY_ID_REQUEST, webAppGetByIdSaga);
  yield takeLatest(WebAppType.WEB_APP_GET_SHOP_REQUEST, webAppGetShopSaga);
  yield takeLatest(WebAppType.WEB_APP_DELETE_CONFIG_REQUEST, webAppDeleteSaga);
  yield takeLatest(WebAppType.WEB_APP_GET_VARIANTS_REQUEST, webAppGetVariantsSaga);
  yield takeLatest(WebAppType.WEB_APP_DOWNLOAD_PRODUCT_REQUEST, webAppDownloadProductSaga);
  yield takeLatest(WebAppType.WEB_APP_DELETE_PRODUCT_REQUEST, webAppDeleteProductSaga);
  yield takeLatest(WebAppType.WEB_APP_DISCONNECT_PRODUCT_REQUEST, webAppDisconnectProductSaga);
  yield takeLatest(WebAppType.WEB_APP_SYNC_STOCK_PRODUCT_REQUEST, webAppSyncStockProductSaga);
  yield takeLatest(WebAppType.WEB_APP_GET_CATEGORY_REQUEST, webAppGetCategoryListSaga);
  yield takeLatest(WebAppType.WEB_APP_SYNC_ORDER_REQUEST, webAppSyncOrderSaga);
  yield takeLatest(WebAppType.WEB_APP_PUT_CONNECT_PRODUCT_REQUEST, webAppPutConnectProductSaga);
  yield takeLatest(WebAppType.WEB_APP_DOWNLOAD_ORDER_REQUEST, webAppDownloadOrderSaga); //download web/app order
  yield takeLatest(WebAppType.WEB_APP_GET_ORDER_SYNC_LIST_REQUEST, webAppGetOrderMappingListSaga);  //web app get order mapping list
  yield takeLatest(WebAppType.WEB_APP_GET_STORE_ADDRESS, webAppGetStoreAddressSaga);   // get web app shop address
  yield takeLatest(WebAppType.WEB_APP_CREATE_LOGISTIC, webAppCreateLogisticOrder); // create web app shipping order
  yield takeLatest(WebAppType.WEB_APP_CONCANATE_BY_EXCEL, webAppConcatenateByExcelSaga);  // concatenate By Excel
  yield takeLatest(WebAppType.WEB_APP_DOWNLOAD_PRINT_FORM, webAppDownloadPrintForm);   // download web app print form
  yield takeLatest(WebAppType.WEB_APP_EXIT_JOBS, webAppExitJobsSaga); // exit web app jobs
}
