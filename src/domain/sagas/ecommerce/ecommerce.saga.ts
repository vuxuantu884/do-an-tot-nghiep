import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { EcommerceType } from "domain/types/ecommerce.type";
import { PageResponse } from "model/base/base-metadata.response";
import { call, put, takeLatest } from "redux-saga/effects";
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
  postEcommerceOrderApi
} from "service/ecommerce/ecommerce.service";
import { showError } from "utils/ToastUtils";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";

// connect to the eccommerce
function* ecommerceConnectSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceConnectSyncApi
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

function* ecommerceGetConfigInfoSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceGetConfigInfoApi,
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

function* ecommerceCreateSaga(action: YodyAction) {
  let { request, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceCreateApi,
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* ecommerceGetByIdSaga(action: YodyAction) {
  let { id, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceGetByIdApi,
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* ecommerceGetSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceGetApi
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
  }
}

function* ecommerceUpdateSaga(action: YodyAction) {
  let { id, request, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceUpdateApi,
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* ecommerceDeleteSaga(action: YodyAction) {
  let { id, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<EcommerceResponse>> = yield call(
      ecommerceDeleteApi,
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* ecommerceGetVariantsSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      ecommerceGetVariantsApi,
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

function* ecommerceGetShopSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      ecommerceGetShopApi,
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

function* ecommercePostVariantsSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      ecommercePostVariantsApi,
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

function* ecommerceDeleteItemSaga(action: YodyAction) {
  let { ids, setData } = action.payload;
  
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      ecommerceDeleteItemApi,
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

function* ecommerceDisconnectItemSaga(action: YodyAction) {
  let { ids, setData } = action.payload;
  
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      ecommerceDisconnectItemApi,
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

function* ecommercePostSyncStockItemSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      ecommercePostSyncStockItemApi,
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

function* ecommerceGetCategoryListSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      ecommerceGetCategoryListApi,
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

function* ecommercePutConnectItemSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      ecommercePutConnectItemApi,
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

//ecommerce order saga
function* postEcommerceOrderSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      postEcommerceOrderApi,
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


export function* ecommerceSaga() {
  yield takeLatest(
    EcommerceType.UPDATE_ECOMMERCE_CONFIG_REQUEST,
    ecommerceUpdateSaga
  );
  yield takeLatest(
    EcommerceType.CREATE_ECOMMERCE_CONFIG_REQUEST,
    ecommerceCreateSaga
  );
  yield takeLatest(
    EcommerceType.GET_ECOMMERCE_CONFIG_INFO_REQUEST,
    ecommerceGetConfigInfoSaga
  );
  yield takeLatest(
    EcommerceType.CONNECT_ECOMMERCE_CONFIG_REQUEST,
    ecommerceConnectSaga
  );
  yield takeLatest(
    EcommerceType.GET_ECOMMERCE_CONFIG_BY_ID_REQUEST,
    ecommerceGetByIdSaga
  );
  yield takeLatest(
    EcommerceType.GET_ECOMMERCE_CONFIG_REQUEST,
    ecommerceGetSaga
  );

  yield takeLatest(
    EcommerceType.DELETE_ECOMMERCE_CONFIG_REQUEST,
    ecommerceDeleteSaga
  );

  yield takeLatest(
    EcommerceType.GET_ECOMMERCE_VARIANTS_REQUEST,
    ecommerceGetVariantsSaga
  );
  
  yield takeLatest(
    EcommerceType.GET_ECOMMERCE_SHOP_REQUEST,
    ecommerceGetShopSaga
  );

  yield takeLatest(
    EcommerceType.POST_ECOMMERCE_VARIANTS_REQUEST,
    ecommercePostVariantsSaga
  );

  yield takeLatest(
    EcommerceType.DELETE_ECOMMERCE_ITEM_REQUEST,
    ecommerceDeleteItemSaga
  );

  
  yield takeLatest(
    EcommerceType.DISCONNECT_ECOMMERCE_ITEM_REQUEST,
    ecommerceDisconnectItemSaga
  );

  yield takeLatest(
    EcommerceType.POST_SYNC_STOCK_ECOMMERCE_ITEM_REQUEST,
    ecommercePostSyncStockItemSaga
  );

  yield takeLatest(
    EcommerceType.GET_ECOMMERCE_CATEGORY_REQUEST,
    ecommerceGetCategoryListSaga
  );

  yield takeLatest(
    EcommerceType.PUT_CONNECT_ECOMMERCE_ITEM_REQUEST,
    ecommercePutConnectItemSaga
  );

  //ecommerce order takeLatest
  yield takeLatest(
    EcommerceType.POST_ECOMMERCE_ORDER_REQUEST,
    postEcommerceOrderSaga
  );
}
