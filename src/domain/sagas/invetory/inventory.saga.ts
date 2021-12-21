import { InventoryResponse } from './../../../model/inventory/index';
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { InventoryConfigType, InventoryType } from "domain/types/inventory.type";
import { PageResponse } from "model/base/base-metadata.response";
import { AllInventoryResponse, HistoryInventoryResponse } from "model/inventory";
import { call, put, takeLatest } from "redux-saga/effects";
import { createInventoryConfigService, getInventoryByVariantsApi, getInventoryConfigService, inventoryGetApi, inventoryGetDetailApi, inventoryGetDetailVariantIdsApi, inventoryGetDetailVariantIdsExtApi, inventoryGetHistoryApi, updateInventoryConfigService } from "service/inventory";
import { showError } from "utils/ToastUtils";
import { FilterConfig } from 'model/other';

function* inventoryGetSaga(action: YodyAction) {
  let { query, onResult } = action.payload;
  try {
    const response: BaseResponse<PageResponse<AllInventoryResponse>> = yield call(
      inventoryGetApi,
      query
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

function* inventoryGetDetailSaga(action: YodyAction) {
  let { query, onResult } = action.payload;
  try {
    const response: BaseResponse<PageResponse<AllInventoryResponse>> = yield call(
      inventoryGetDetailApi,
      query
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

function* inventoryGetHistorySaga(action: YodyAction) {
  let { query, onResult } = action.payload;
  try {
    const response: BaseResponse<PageResponse<HistoryInventoryResponse>> = yield call(
      inventoryGetHistoryApi,
      query
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
    const response: BaseResponse<PageResponse<Array<InventoryResponse>>> = yield call(
      inventoryGetDetailVariantIdsApi,
      variant_id,
      store_id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data.items);
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
    showError("Có lỗi khi lấy chi tiết tồn kho hàng! Vui lòng thử lại sau!");
  }
}


function* inventoryGetDetailVariantIdsExtSaga(action: YodyAction) {
  const { variant_id, store_id, setData } = action.payload;
  try {
    console.log(variant_id)
    const response: BaseResponse<PageResponse<Array<InventoryResponse>>> = yield call(
      inventoryGetDetailVariantIdsExtApi,
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

function* inventoryByVariantsSaga(action: YodyAction) {
  const {query, onResult} = action.payload;
  try {
    console.log(query);
    const response: BaseResponse<Array<InventoryResponse>> = yield call(
      getInventoryByVariantsApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        console.log(response.data);
        
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        throw new Error(response.errors.toString());
    }
  } catch (error: any) {
    console.log(error);
    
    // error.split(',').forEach((e:string) => showError(e));
  }
}

function* getConfigInventorySaga(action: YodyAction) {
  const {code, onResult } = action.payload;
  try {
    let response: BaseResponse<Array<FilterConfig>> = yield call(
      getInventoryConfigService,
      code
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult(error);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* createConfigInventorySaga(action: YodyAction) {
  const { request, onResult } = action.payload;
  try {
    let response: BaseResponse<FilterConfig> = yield call(
      createInventoryConfigService,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult(false);
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* updateConfigInventorySaga(action: YodyAction) {
  const {id, request, onResult } = action.payload;
  try {
    let response: BaseResponse<FilterConfig> = yield call(
      updateInventoryConfigService,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult(false);
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* inventorySaga() {
  yield takeLatest(InventoryType.GET, inventoryGetSaga);
  yield takeLatest(InventoryType.GET_DETAIL, inventoryGetDetailSaga);
  yield takeLatest(InventoryType.GET_HISTORY, inventoryGetHistorySaga);
  yield takeLatest(InventoryType.GET_DETAIL_lIST_VARIANT, inventoryGetDetailVariantIdsSaga);
  yield takeLatest(InventoryType.GET_DETAIL_lIST_VARIANT_EXT, inventoryGetDetailVariantIdsExtSaga);
  yield takeLatest(InventoryType.GET_BY_VARIANTS, inventoryByVariantsSaga);
 
  yield takeLatest(InventoryConfigType.GET_INVENTORY_CONFIG, getConfigInventorySaga);
  yield takeLatest(InventoryConfigType.CREATE_INVENTORY_CONFIG, createConfigInventorySaga);
  yield takeLatest(InventoryConfigType.UPDATE_INVENTORY_CONFIG, updateConfigInventorySaga);
}
