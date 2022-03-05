import { getListStore, getListStoreSimple, getSearchListStore, getStoreSearchIdsApi } from "service/core/store.service";
import BaseResponse from "base/base.response";
import { YodyAction } from "base/base.action";
import { showError } from "utils/ToastUtils";
import { StoreResponse, StoreTypeRequest } from "model/core/store.model";
import { call, put, takeLatest } from "@redux-saga/core/effects";
import { HttpStatus } from "config/http-status.config";
import { StoreType } from "domain/types/core.type";
import { PageResponse } from "model/base/base-metadata.response";
import {
  storeGetApi,
  storeGetTypeApi,
  storeRankGetApi,
  storesDetailApi,
  storesDetailCustomApi,
  storesPostApi,
  storesPutApi,
  storeValidateApi,
} from "service/core/store.services";
import { StoreRankResponse } from "model/core/store-rank.model";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { StoreCustomResponse } from "model/response/order/order.response";

function* storeGetAllSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<Array<StoreResponse>> = yield call(getListStore);
    switch (response.code) {
      case HttpStatus.SUCCESS:
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

function* storeGetListStoreSimpleAllSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<Array<StoreResponse>> = yield call(
      getListStoreSimple
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
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* storeSearchSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<StoreResponse>> = yield call(
      storeGetApi,
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
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* storeRanksaga(action: YodyAction) {
  const { setData } = action.payload;
  try {
    let response: BaseResponse<Array<StoreRankResponse>> = yield call(
      storeRankGetApi
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
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* storeCreateSaga(action: YodyAction) {
  const { request, onCreateSuccess } = action.payload;
  try {
    let response: BaseResponse<StoreResponse> = yield call(
      storesPostApi,
      request
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        onCreateSuccess(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onCreateSuccess(false);
        yield put(unauthorizedAction());
        break;
      default:
        onCreateSuccess(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onCreateSuccess(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* storeUpdateSaga(action: YodyAction) {
  const { id, request, onUpdateSuccess } = action.payload;
  try {
    let response: BaseResponse<StoreResponse> = yield call(
      storesPutApi,
      id,
      request
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        onUpdateSuccess(response.data);
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

export function* storeDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<StoreResponse> = yield call(storesDetailApi, id);
    switch (response.code) {
      case HttpStatus.SUCCESS:
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

export function* storeDetailCustomSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<StoreCustomResponse> = yield call(
      storesDetailCustomApi,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        response.data.accounts = [];
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

function* storeGetSearchSaga(action: YodyAction) {
  let { name,setData } = action.payload;
  try {
    let response: BaseResponse<Array<StoreResponse>> = yield call(getSearchListStore, name);
    switch (response.code) {
      case HttpStatus.SUCCESS:
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

function* storeValidateSaga(action: YodyAction) {
  let {data, setData } = action.payload;
  try {
    let response: BaseResponse<Array<StoreResponse>> = yield call(storeValidateApi, data);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        setData(response.errors)
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* storeGetTypeSaga(action: YodyAction) {
  let { onSuccess } = action.payload;
  try {
    let response: BaseResponse<Array<StoreTypeRequest>> = yield call(storeGetTypeApi);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onSuccess(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        onSuccess(response.errors)
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}


function* getStoreSearchIdsSaga(action: YodyAction) {
  let {storeids, setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<StoreResponse>> = yield call(
      getStoreSearchIdsApi,
      storeids
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
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}


export function* storeSaga() {
  yield takeLatest(StoreType.GET_LIST_STORE_REQUEST, storeGetAllSaga);
  yield takeLatest(StoreType.GET_SEARCH_STORE_REQUEST, storeGetSearchSaga);
  yield takeLatest(
    StoreType.GET_LIST_STORE_REQUEST_SIMPLE,
    storeGetListStoreSimpleAllSaga
  );
  yield takeLatest(StoreType.STORE_SEARCH, storeSearchSaga);
  yield takeLatest(StoreType.STORE_RANK, storeRanksaga);
  yield takeLatest(StoreType.STORE_CREATE, storeCreateSaga);
  yield takeLatest(StoreType.STORE_DETAIL, storeDetailSaga);
  yield takeLatest(StoreType.STORE_DETAIL_CUSTOM, storeDetailCustomSaga);
  yield takeLatest(StoreType.STORE_UPDATE, storeUpdateSaga);
  yield takeLatest(StoreType.STORE_VALIDATE, storeValidateSaga);
  yield takeLatest(StoreType.STORE_TYPE, storeGetTypeSaga);
  yield takeLatest(StoreType.STORE_SEARCH_IDS, getStoreSearchIdsSaga);
}
