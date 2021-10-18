import { InventoryResponse } from "./../../../model/inventory/index";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { InventoryType } from "domain/types/inventory.type";
import { PageResponse } from "model/base/base-metadata.response";
import {
  AllInventoryResponse,
  HistoryInventoryResponse,
} from "model/inventory";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  inventoryGetApi,
  inventoryGetDetailVariantIdsApi,
  inventoryGetHistoryApi,
} from "service/inventory";
import { showError } from "utils/ToastUtils";
import {
  getStoreApi,
  getVariantByStoreApi,
  uploadFileApi,
} from "service/inventory/transfer/index.service";
import { Store } from "model/inventory/transfer";
import { takeEvery } from "typed-redux-saga";
import { VariantStore } from "model/inventory/variant";
import { VariantResponse } from "model/product/product.model";

function* inventoryGetSaga(action: YodyAction) {
  let { query, onResult } = action.payload;
  try {
    const response: BaseResponse<PageResponse<AllInventoryResponse>> =
      yield call(inventoryGetApi, query);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        onResult(false);
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* inventoryGetHistorySaga(action: YodyAction) {
  let { query, onResult } = action.payload;
  try {
    const response: BaseResponse<PageResponse<HistoryInventoryResponse>> =
      yield call(inventoryGetHistoryApi, query);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        onResult(false);
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* inventorySenderStoreSaga(action: YodyAction) {
  let { queryParams, onResult } = action.payload;
  try {
    const response: BaseResponse<Array<Store>> = yield call(
      getStoreApi,
      queryParams
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        onResult(false);
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* inventoryVariantBySenderStoreSaga(action: YodyAction) {
  let { queryParams, onResult } = action.payload;
  try {
    const response: BaseResponse<Array<VariantResponse>> = yield call(
      getVariantByStoreApi,
      queryParams
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        onResult(false);
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* inventoryUploadFilesSaga(action: YodyAction) {
  let { queryParams, onResult } = action.payload;
  try {
    const response: BaseResponse<Array<VariantStore>> = yield call(
      uploadFileApi,
      queryParams
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        onResult(false);
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* inventoryGetDetailVariantIdsSaga(action: YodyAction) {
  const { variant_id, store_id, setData } = action.payload;
  try {
    console.log(variant_id)
    const response: BaseResponse<Array<InventoryResponse>> = yield call(
      inventoryGetDetailVariantIdsApi,
      variant_id,
      store_id
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
        setData(null);
        break;
    }
  } catch (error) {
    setData(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* inventorySaga() {
  yield takeLatest(InventoryType.GET_DETAIL_lIST_VARIANT,inventoryGetDetailVariantIdsSaga);
  yield takeLatest(InventoryType.GET, inventoryGetSaga);
  yield takeLatest(InventoryType.GET_HISTORY, inventoryGetHistorySaga);
  yield takeLatest(InventoryType.GET_STORE, inventorySenderStoreSaga);
  yield takeLatest(
    InventoryType.GET_VARIANT_BY_STORE,
    inventoryVariantBySenderStoreSaga
  );
  yield takeEvery(InventoryType.UPLOAD_FILES, inventoryUploadFilesSaga);
}
