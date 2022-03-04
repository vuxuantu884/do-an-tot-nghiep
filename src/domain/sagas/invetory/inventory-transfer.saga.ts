import { InventoryResponse } from "./../../../model/inventory/index";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { InventoryType } from "domain/types/inventory.type";
import { PageResponse } from "model/base/base-metadata.response";
import {
  AllInventoryResponse,
} from "model/inventory";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  inventoryGetApi,
  logisticGateAwayGetApi,
} from "service/inventory";
import { showError } from "utils/ToastUtils";
import {
  getStoreApi,
  getVariantByStoreApi,
  uploadFileApi,
  createInventoryTransfer,
  getListInventoryTransferApi,
  inventorGetDetailApi,
  DeleteInventoryService,
  updateInventoryTransfer,
  getListLogInventoryTransferApi,
  inventoryTransferGetDetailVariantIdsApi,
  createInventoryTransferShipment,
  receivedInventoryTransfer,
  adjustmentInventory,
  getInfoDeliveryFees,
  inventorGetCopyDetailApi,
  cancelShipmentInventoryTransfer,
  exportShipmentInventoryTransfer,
} from "service/inventory/transfer/index.service";
import { InventoryTransferDetailItem, InventoryTransferLog, Store } from "model/inventory/transfer";
import { takeEvery } from "typed-redux-saga";
import { VariantStore } from "model/inventory/variant";
import { VariantResponse } from "model/product/product.model";
import { FeesResponse } from "model/response/order/order.response";

function* inventoryGetListSaga(action: YodyAction) {
  let { queryParams, onResult } = action.payload;

  try {
    const response: BaseResponse<PageResponse<any>> =
      yield call(getListInventoryTransferApi, queryParams);
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

function* inventoryGetLogListSaga(action: YodyAction) {
  let { queryParams, onResult } = action.payload;

  try {
    const response: BaseResponse<PageResponse<Array<InventoryTransferLog>>> =
      yield call(getListLogInventoryTransferApi, queryParams);
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* logisticGateAwayGetSaga(action: YodyAction) {
  let { onResult } = action.payload;
  try {
    const response: BaseResponse<AllInventoryResponse> =
      yield call(logisticGateAwayGetApi);
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

function* inventoryGetDetailSaga(action: YodyAction) {

  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<InventoryTransferDetailItem> = yield call(
      inventorGetDetailApi,
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

function* inventoryGetCopyDetailSaga(action: YodyAction) {

  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<InventoryTransferDetailItem> = yield call(
      inventorGetCopyDetailApi,
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

function* inventoryTransferDeleteSaga(action: YodyAction) {

  const { id, request, setData } = action.payload;
  try {
    let response: BaseResponse<InventoryTransferDetailItem> = yield call(
      DeleteInventoryService,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setData(false);
        yield put(unauthorizedAction());
        break;
      default:
        setData(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    setData(false);
    // showError("Có lỗi vui lòng thử lại sau");
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
    // showError("Có lỗi vui lòng thử lại sau");
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
    // showError("Có lỗi vui lòng thử lại sau");
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* inventoryGetDetailVariantIdsSaga(action: YodyAction) {
  const { variant_id, store_id, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<Array<InventoryResponse>>> = yield call(
      inventoryTransferGetDetailVariantIdsApi,
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

//POST

function* createInventoryTransferSaga(action: YodyAction) {
  let { data, onResult } = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(
      createInventoryTransfer,
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

function* createInventoryTransferShipmentSaga(action: YodyAction) {
  let { pathVariantId, body, onResult } = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(
      createInventoryTransferShipment,
      pathVariantId,
      body
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

function* adjustmentInventorySaga(action: YodyAction) {
  let { id, onResult } = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(
      adjustmentInventory,
      id,
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

//UPDATE
function* updateInventoryTransferSaga(action: YodyAction) {
  let { id, data, onResult } = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(
      updateInventoryTransfer,
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
    onResult(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* receivedInventoryTransferSaga(action: YodyAction) {
  let { id, data, onResult } = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(
      receivedInventoryTransfer,
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
    onResult(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* cancelShipmentInventoryTransferSaga(action: YodyAction) {
  let { transferId, shipmentId, onResult } = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(
      cancelShipmentInventoryTransfer,
      transferId,
      shipmentId
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

function* exportShipmentInventoryTransferSaga(action: YodyAction) {
  let { transferId, shipmentId, onResult } = action.payload;

  try {
    const response: BaseResponse<Array<[]>> = yield call(
      exportShipmentInventoryTransfer,
      transferId,
      shipmentId
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

function* InfoFeesSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    let response: BaseResponse<Array<FeesResponse>> = yield call(
      getInfoDeliveryFees,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* inventoryTransferSaga() {
  yield takeLatest(InventoryType.GET_LIST_INVENTORY_TRANSFER, inventoryGetListSaga);
  yield takeLatest(InventoryType.GET_LIST_LOG_INVENTORY_TRANSFER, inventoryGetLogListSaga);
  yield takeLatest(InventoryType.GET_LOGISTIC_SERVICE, logisticGateAwayGetSaga);
  yield takeLatest(InventoryType.GET_DETAIL_INVENTORY_TRANSFER, inventoryGetDetailSaga);
  yield takeLatest(InventoryType.GET_COPY_DETAIL_INVENTORY_TRANSFER, inventoryGetCopyDetailSaga);
  yield takeLatest(InventoryType.GET_INFO_FEES_INVENTORY, InfoFeesSaga);
  yield takeLatest(InventoryType.DELETE_INVENTORY_TRANSFER, inventoryTransferDeleteSaga);
  yield takeLatest(InventoryType.CREATE_INVENTORY_TRANSFER, createInventoryTransferSaga);
  yield takeLatest(InventoryType.CANCEL_SHIPMENT_INVENTORY, cancelShipmentInventoryTransferSaga);
  yield takeLatest(InventoryType.EXPORT_INVENTORY, exportShipmentInventoryTransferSaga);
  yield takeLatest(InventoryType.CREATE_INVENTORY_TRANSFER_SHIPMENT, createInventoryTransferShipmentSaga);
  yield takeLatest(InventoryType.ADJUSTMENT_INVENTORY, adjustmentInventorySaga);
  yield takeLatest(InventoryType.UPDATE_INVENTORY_TRANSFER, updateInventoryTransferSaga);
  yield takeLatest(InventoryType.RECEIVED_INVENTORY__TRANSFER, receivedInventoryTransferSaga);
  yield takeLatest(InventoryType.GET_DETAIL_lIST_VARIANT_TRANSFER, inventoryGetDetailVariantIdsSaga);
  yield takeLatest(InventoryType.GET, inventoryGetSaga);
  yield takeLatest(InventoryType.GET_STORE, inventorySenderStoreSaga);
  yield takeLatest(
    InventoryType.GET_VARIANT_BY_STORE,
    inventoryVariantBySenderStoreSaga
  );
  yield takeEvery(InventoryType.UPLOAD_FILES, inventoryUploadFilesSaga);
}
