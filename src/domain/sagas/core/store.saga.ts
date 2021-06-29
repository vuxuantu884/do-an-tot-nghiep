import BaseResponse from "base/BaseResponse";
import { YodyAction } from "base/BaseAction";
import { showError } from "utils/ToastUtils";
import { StoreResponse } from "model/core/store.model";
import { getListStore } from "service/core/store.service";
import { call, put, takeLatest } from "@redux-saga/core/effects";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { HttpStatus } from "config/HttpStatus";
import { StoreType } from "domain/types/core.type";
import { PageResponse } from "model/base/base-metadata.response";
import {
  storeGetApi,
  storeRankGetApi,
  storesDetailApi,
  storesPostApi,
  storesPutApi,
} from "service/core/store.services";
import { StoreRankResponse } from "model/core/store-rank.model";
import { unauthorizedAction } from "domain/actions/auth/auth.action";

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
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
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
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
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
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* storeCreateSaga(action: YodyAction) {
  const { request, onCreateSuccess } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<StoreResponse> = yield call(
      storesPostApi,
      request
    );
    yield put(hideLoading());
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onCreateSuccess(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* storeUpdateSaga(action: YodyAction) {
  const { id, request, onUpdateSuccess } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<StoreResponse> = yield call(
      storesPutApi,
      id,
      request
    );
    yield put(hideLoading());
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
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* storeDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<StoreResponse> = yield call(
      storesDetailApi,
      id
    );
    yield put(hideLoading());
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
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* StoreSaga() {
  yield takeLatest(StoreType.GET_LIST_STORE_REQUEST, storeGetAllSaga);
  yield takeLatest(StoreType.STORE_SEARCH, storeSearchSaga);
  yield takeLatest(StoreType.STORE_RANK, storeRanksaga);
  yield takeLatest(StoreType.STORE_CREATE, storeCreateSaga);
  yield takeLatest(StoreType.STORE_DETAIL, storeDetailSaga)
  yield takeLatest(StoreType.STORE_UPDATE, storeUpdateSaga)
}
