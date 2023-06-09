import { callApiSaga } from "utils/ApiUtils";
import { showSuccess } from "../../../utils/ToastUtils";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { EcommerceType } from "domain/types/ecommerce.type";
import { PageResponse } from "model/base/base-metadata.response";
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import {
  ecommerceCreateApi,
  ecommerceGetApi,
  ecommerceGetByIdApi,
  ecommerceUpdateApi,
  ecommerceDeleteApi,
  ecommerceConnectSyncApi,
  ecommerceGetConfigInfoApi,
  ecommerceGetVariantsApi,
  ecommerceGetShopApi,
  ecommercePostVariantsApi,
  ecommerceDeleteItemApi,
  ecommerceDisconnectItemApi,
  ecommercePostSyncStockItemApi,
  ecommerceGetCategoryListApi,
  ecommercePutConnectItemApi,
  postEcommerceOrderApi,
  getFpageCustomer,
  addFpagePhone,
  deleteFpagePhone,
  setFpageDefaultPhone,
  getOrderMappingListApi,
  exitProgressDownloadEcommerceApi,
  ecommerceSyncStockItemApi,
  getEcommerceStoreAddressApi,
  createEcommerceLogisticApi,
  importConcatenateByExcelService,
  changeEcommerceOrderStatusService,
  getEcommercePrintForm,
  exitEcommerceJobsApi,
  getEcommerceAddressByShopIdApi,
  batchShippingShopeeProductApi,
  getLogInventoryVariantApi,
  getDataInventoryUnicornProductActionApi,
} from "service/ecommerce/ecommerce.service";
import { showError } from "utils/ToastUtils";
import {
  EcommerceChangeOrderStatusReponse,
  EcommerceResponse,
} from "model/response/ecommerce/ecommerce.response";
import { YDPageCustomerResponse } from "model/response/ecommerce/fpage.response";
import { hideLoading, showLoading } from "domain/actions/loading.action";

function* addFpagePhoneSaga(action: YodyAction) {
  let { userId, phone, setData } = action.payload;
  try {
    const response: BaseResponse<YDPageCustomerResponse> = yield call(addFpagePhone, userId, phone);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        showSuccess("Thêm số điện thoại thành công");
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}
function* deleteFpagePhoneSaga(action: YodyAction) {
  let { userId, phone, setData } = action.payload;
  try {
    const response: BaseResponse<YDPageCustomerResponse> = yield call(
      deleteFpagePhone,
      userId,
      phone,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        showSuccess("Xóa số điện thoại thành công");
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}
function* setFpageDefaultPhoneSaga(action: YodyAction) {
  let { userId, phone, setData } = action.payload;
  try {
    const response: BaseResponse<YDPageCustomerResponse> = yield call(
      setFpageDefaultPhone,
      userId,
      phone,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        showSuccess("Đặt số điện thoại mặc định thành công");
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}
function* getFpageCustomerSaga(action: YodyAction) {
  let { userId, setData } = action.payload;
  try {
    const response: BaseResponse<YDPageCustomerResponse> = yield call(getFpageCustomer, userId);
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
// connect to the eccommerce
function* ecommerceConnectSaga(action: YodyAction) {
  let { ecommerceId, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceConnectSyncApi,
      ecommerceId,
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

function* ecommerceGetConfigInfoSaga(action: YodyAction) {
  let { params, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceGetConfigInfoApi,
      params,
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

function* ecommerceCreateSaga(action: YodyAction) {
  let { request, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceCreateApi,
      request,
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

function* ecommerceGetByIdSaga(action: YodyAction) {
  let { id, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceGetByIdApi,
      id,
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

function* ecommerceGetSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(ecommerceGetApi);
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
  }
}

function* ecommerceUpdateSaga(action: YodyAction) {
  let { id, request, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceUpdateApi,
      id,
      request,
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

function* ecommerceDeleteSaga(action: YodyAction) {
  let { id, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceDeleteApi,
      id,
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

function* ecommerceGetVariantsSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(ecommerceGetVariantsApi, query);
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

function* ecommerceGetShopSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(ecommerceGetShopApi, query);
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

function* ecommercePostVariantsSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(ecommercePostVariantsApi, query);
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

function* ecommerceDeleteItemSaga(action: YodyAction) {
  let { ids, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(ecommerceDeleteItemApi, ids);
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

function* ecommerceDisconnectItemSaga(action: YodyAction) {
  let { ids, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(ecommerceDisconnectItemApi, ids);
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

function* ecommercePostSyncStockItemSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  yield put(showLoading());
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      ecommercePostSyncStockItemApi,
      query,
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

function* ecommerceSyncStockItemSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  yield put(showLoading());
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(ecommerceSyncStockItemApi, query);
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

function* ecommerceGetCategoryListSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      ecommerceGetCategoryListApi,
      query,
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

function* ecommercePutConnectItemSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(ecommercePutConnectItemApi, query);
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

//ecommerce order saga
function* postEcommerceOrderSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(postEcommerceOrderApi, query);
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

//ecommerce get order mapping list saga
function* getOrderMappingListSaga(action: YodyAction) {
  let { query, setData } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(getOrderMappingListApi, query);
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

function* exitProgressDownloadEcommerceSaga(action: YodyAction) {
  const { query, callback } = action.payload;
  yield callApiSaga({ isShowLoading: true }, callback, exitProgressDownloadEcommerceApi, query);
}

function* getEcommerceStoreAddressSaga(action: YodyAction) {
  const { query, callback } = action.payload;
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      getEcommerceStoreAddressApi,
      query,
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

function* createEcommerceLogisticOrder(action: YodyAction) {
  const { request, callback } = action.payload;
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      createEcommerceLogisticApi,
      request,
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

function* concatenateByExcel(action: YodyAction) {
  const { formData, callback } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<any> = yield call(importConcatenateByExcelService, formData);
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

function* downloadPrintForm(action: YodyAction) {
  const { request, callback } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<any> = yield call(getEcommercePrintForm, request);
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

function* exitEcommerceJobsSaga(action: YodyAction) {
  const { query, callback } = action.payload;
  yield callApiSaga({ isShowLoading: true }, callback, exitEcommerceJobsApi, query);
}
function* changeEcommerceOrderStatus(action: YodyAction) {
  const { ecommerceOrderStatusRequest, callback } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<EcommerceChangeOrderStatusReponse> = yield call(
      changeEcommerceOrderStatusService,
      ecommerceOrderStatusRequest,
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        callback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        callback(null);
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* getAddressEcommerceShopSaga(action: YodyAction) {
  const { request, callback } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<any> = yield call(getEcommerceAddressByShopIdApi, request);
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

function* batchShippingShopeeProductSaga(action: YodyAction) {
  const { request, callback } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<any> = yield call(batchShippingShopeeProductApi, request);
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

function* getLogInventoryVariantSaga(action: YodyAction) {
  const { request, callback } = action.payload;
  yield put(showLoading());
  try {
    const response: BaseResponse<any> = yield call(getLogInventoryVariantApi, request);
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
  } finally {
    yield put(hideLoading());
  }
}

function* getDataInventoryUnicornProductActionSaga(action: YodyAction) {
  let { variantId, queryParams, callback } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      getDataInventoryUnicornProductActionApi,
      variantId,
      queryParams,
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

export function* ecommerceSaga() {
  yield takeLatest(EcommerceType.ADD_FPAGE_PHONE, addFpagePhoneSaga);
  yield takeLatest(EcommerceType.DELETE_FPAGE_PHONE, deleteFpagePhoneSaga);
  yield takeLatest(EcommerceType.SET_FPAGE_DEFAULT_PHONE, setFpageDefaultPhoneSaga);
  yield takeLatest(EcommerceType.GET_FPAGE_CUSTOMER, getFpageCustomerSaga);

  yield takeLatest(EcommerceType.UPDATE_ECOMMERCE_CONFIG_REQUEST, ecommerceUpdateSaga);
  yield takeLatest(EcommerceType.CREATE_ECOMMERCE_CONFIG_REQUEST, ecommerceCreateSaga);
  yield takeLatest(EcommerceType.GET_ECOMMERCE_CONFIG_INFO_REQUEST, ecommerceGetConfigInfoSaga);
  yield takeLatest(EcommerceType.CONNECT_ECOMMERCE_CONFIG_REQUEST, ecommerceConnectSaga);
  yield takeLatest(EcommerceType.GET_ECOMMERCE_CONFIG_BY_ID_REQUEST, ecommerceGetByIdSaga);
  yield takeLatest(EcommerceType.GET_ECOMMERCE_CONFIG_REQUEST, ecommerceGetSaga);

  yield takeLatest(EcommerceType.DELETE_ECOMMERCE_CONFIG_REQUEST, ecommerceDeleteSaga);

  yield takeLatest(EcommerceType.GET_ECOMMERCE_VARIANTS_REQUEST, ecommerceGetVariantsSaga);

  yield takeEvery(EcommerceType.GET_ECOMMERCE_SHOP_REQUEST, ecommerceGetShopSaga);

  yield takeLatest(EcommerceType.POST_ECOMMERCE_VARIANTS_REQUEST, ecommercePostVariantsSaga);

  yield takeLatest(EcommerceType.DELETE_ECOMMERCE_ITEM_REQUEST, ecommerceDeleteItemSaga);

  yield takeLatest(EcommerceType.DISCONNECT_ECOMMERCE_ITEM_REQUEST, ecommerceDisconnectItemSaga);

  yield takeLatest(
    EcommerceType.POST_SYNC_STOCK_ECOMMERCE_ITEM_REQUEST,
    ecommercePostSyncStockItemSaga,
  );

  yield takeLatest(EcommerceType.GET_ECOMMERCE_CATEGORY_REQUEST, ecommerceGetCategoryListSaga);

  yield takeLatest(EcommerceType.SYNC_STOCK_ECOMMERCE_ITEM_REQUEST, ecommerceSyncStockItemSaga);

  yield takeLatest(EcommerceType.PUT_CONNECT_ECOMMERCE_ITEM_REQUEST, ecommercePutConnectItemSaga);

  //ecommerce order takeLatest
  yield takeLatest(EcommerceType.POST_ECOMMERCE_ORDER_REQUEST, postEcommerceOrderSaga);

  //ecommerce get order mapping list
  yield takeLatest(EcommerceType.GET_ORDER_MAPPING_LIST_REQUEST, getOrderMappingListSaga);

  // exit Progress Download Ecommerce
  yield takeLatest(
    EcommerceType.EXIT_PROGRESS_DOWNLOAD_ECOMMERCE,
    exitProgressDownloadEcommerceSaga,
  );

  // get ecommerce shop address
  yield takeLatest(EcommerceType.GET_ECOMMERCE_STORE_ADDRESS, getEcommerceStoreAddressSaga);

  // create ecommerce shipping order
  yield takeLatest(EcommerceType.CREATE_ECOMMERCE_LOGISTIC, createEcommerceLogisticOrder);

  // concatenate By Excel
  yield takeLatest(EcommerceType.CONCANATE_BY_EXCEL, concatenateByExcel);

  // download print form
  yield takeLatest(EcommerceType.DOWNLOAD_PRINT_FORM, downloadPrintForm);

  // exit download print form
  yield takeLatest(EcommerceType.EXIT_ECOMMERCE_JOBS, exitEcommerceJobsSaga);
  yield takeLatest(EcommerceType.CONCANATE_BY_EXCEL, concatenateByExcel);

  //change ecommerce order status
  yield takeLatest(EcommerceType.CHANGE_ECOMMERCE_ORDER_STATUS, changeEcommerceOrderStatus);

  //get address ecommerce by shop id
  yield takeLatest(EcommerceType.GET_ECOMMERCE_ADDRESS, getAddressEcommerceShopSaga);

  //batch shipping shopee product
  yield takeLatest(EcommerceType.BATCH_SHIPPING_SHOPPE_PRODUCT, batchShippingShopeeProductSaga);

  //get log inventory follow variant
  yield takeLatest(EcommerceType.GET_LOG_INVENTORY_VARIANT, getLogInventoryVariantSaga);

  yield takeLatest(
    EcommerceType.CHECK_INVENTORY_VARIANT_PRODUCT,
    getDataInventoryUnicornProductActionSaga,
  );
}
