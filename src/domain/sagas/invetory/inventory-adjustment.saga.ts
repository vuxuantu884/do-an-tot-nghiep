import {YodyAction} from "base/base.action";
import BaseResponse from "base/base.response";
import {HttpStatus} from "config/http-status.config";
import {unauthorizedAction} from "domain/actions/auth/auth.action";
import {InventoryType} from "domain/types/inventory.type";
import {PageResponse} from "model/base/base-metadata.response";
import {call, put, takeLatest} from "redux-saga/effects";
import {showError} from "utils/ToastUtils";
import {
  adjustInventoryApi,
  createInventorAdjustmentGetApi,
  getDetailInventorAdjustmentGetApi,
  getLinesItemAdjustmentApi,
  getListInventoryAdjustmentApi,
  getPrintTicketIdsService,
  getVariantHasOnHandByStoreApi,
  updateInventorAdjustmentApi,
  updateItemOnlineInventoryApi,
  updateOnlineInventoryApi,
} from "service/inventory/adjustment/index.service";
import {InventoryAdjustmentDetailItem} from "model/inventoryadjustment";
import { callApiSaga } from "utils/ApiUtils";

function* getListInventoryAdjustmentSaga(action: YodyAction) {
  let {queryParams, onResult} = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      getListInventoryAdjustmentApi,
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getDetailInventorAdjustmentGetSaga(action: YodyAction) {
  const {id, onResult} = action.payload;
  try {
    let response: BaseResponse<InventoryAdjustmentDetailItem> = yield call(
      getDetailInventorAdjustmentGetApi,
      id
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* createInventoryAdjustmentSaga(action: YodyAction) {
  let {data, onResult} = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(
      createInventorAdjustmentGetApi,
      data
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* updateItemOnlineInventorySaga(action: YodyAction) {
  let {id, lineId, data, onResult} = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(
      updateItemOnlineInventoryApi,
      id,
      lineId,
      data
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}
function* updateOnlineInventorySaga(action: YodyAction) {
  let {id, onResult} = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(updateOnlineInventoryApi, id);
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* adjustInventorySaga(action: YodyAction) {
  let {id, onResult} = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(adjustInventoryApi, id);
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* printAdjustInventorySaga(action: YodyAction) {
  let {queryPrint, onResult} = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(
      getPrintTicketIdsService,
      queryPrint
    );
    onResult(response);
  } catch (error) {
    onResult(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getLinesItemAdjustmentSaga(action: YodyAction) {
  let {id, queryString, onResult} = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      getLinesItemAdjustmentApi,
      id,
      queryString
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* updateInventoryAdjustmentSaga(action: YodyAction) {
  let {data,id, onResult} = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(
      updateInventorAdjustmentApi,
      id,
      data
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
    onResult(error);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}


function* getVariantHasOnHandByStoreSaga(action: YodyAction) {
  let {query, onResult} = action.payload;
  yield callApiSaga({notifyAction:"SHOW_ALL"},onResult, getVariantHasOnHandByStoreApi,query);
}

export function* inventoryAdjustmentSaga() {
  yield takeLatest(
    InventoryType.GET_LIST_INVENTORY_ADJUSTMENT,
    getListInventoryAdjustmentSaga
  );
  yield takeLatest(
    InventoryType.GET_DETAIL_INVENTORY_ADJUSTMENT,
    getDetailInventorAdjustmentGetSaga
  );
  yield takeLatest(
    InventoryType.CREATE_INVENTORY_ADJUSTMENT,
    createInventoryAdjustmentSaga
  );
  yield takeLatest(
    InventoryType.UPDATE_ITEM_ONLINE_INVENTORY,
    updateItemOnlineInventorySaga
  );
  yield takeLatest(InventoryType.UPDATE_ONLINE_INVENTORY, updateOnlineInventorySaga);
  yield takeLatest(InventoryType.UPDATE_ADJUSTMENT_INVENTORY, adjustInventorySaga);
  yield takeLatest(InventoryType.PRINT_ADJUSTMENT_INVENTORY, printAdjustInventorySaga);
  yield takeLatest(InventoryType.GET_LINES_ITEM_ADJUSTMENT, getLinesItemAdjustmentSaga);
  yield takeLatest(InventoryType.UPDATE_ADJUSTMENT, updateInventoryAdjustmentSaga);
  yield takeLatest(InventoryType.GET_VARIANT_HAS_ON_HAND_BY_STORE, getVariantHasOnHandByStoreSaga);
}
