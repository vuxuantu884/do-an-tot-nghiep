import {
  cancelPurchaseOrderApi,
  createPurchaseOrderConfigService,
  deletePurchaseOrderConfigService,
  getPurchaseOrderConfigService,
  returnPurchaseOrder,
  updateNotePurchaseOrder,
  updatePurchaseOrderConfigService
} from "./../../../service/purchase-order/purchase-order.service";
import {
  searchPurchaseOrderApi,
  updatePurchaseOrder,
  updatePurchaseOrderFinancialStatus,
} from "service/purchase-order/purchase-order.service";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { POConfig, POLogHistory, POType } from "domain/types/purchase-order.type";
import { PageResponse } from "model/base/base-metadata.response";
import {
  PurchaseOrder,
  PurchaseOrderPrint,
} from "model/purchase-order/purchase-order.model";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  createPurchaseOrder,
  getPurchaseOrderApi,
  deletePurchaseOrder,
  getPrintContent,
} from "service/purchase-order/purchase-order.service";
import { showError } from "utils/ToastUtils";
import { exportPOApi } from "./../../../service/purchase-order/purchase-order.service";
import { ImportResponse } from "model/other/files/export-model";
import { FilterConfig } from "model/other";
import { getLogDetailProcurements, getLogProcurements } from "service/purchase-order/purchase-procument.service";

function* poCreateSaga(action: YodyAction) {
  const { request, createCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchaseOrder>> = yield call(
      createPurchaseOrder,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        createCallback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        createCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        createCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    createCallback(null);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* poUpdateSaga(action: YodyAction) {
  const { id, request, updateCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchaseOrder>> = yield call(
      updatePurchaseOrder,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        updateCallback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        updateCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        updateCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    updateCallback(null);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}


function* poUpdateNoteSaga(action: YodyAction) {
  const { id, request, updateCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchaseOrder>> = yield call(
      updateNotePurchaseOrder,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        updateCallback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        updateCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        updateCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    updateCallback(null);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* poUpdateFinancialStatusSaga(action: YodyAction) {
  const { id, updateCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchaseOrder>> = yield call(
      updatePurchaseOrderFinancialStatus,
      id,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        updateCallback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        updateCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        updateCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    updateCallback(null);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* poDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<PurchaseOrder> = yield call(
      getPurchaseOrderApi,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        setData(null);
        // response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error ", error);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}
function* poSearchSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<PurchaseOrder>> = yield call(
      searchPurchaseOrderApi,
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
    console.log(error);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}
function* poDeleteSaga(action: YodyAction) {
  const { id, deleteCallback } = action.payload;
  try {
    let response: BaseResponse<any | null> = yield call(
      deletePurchaseOrder,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        deleteCallback(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        deleteCallback(false);
        // response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error ", error);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}
function* poReturnSaga(action: YodyAction) {
  const { id, request, returnCallback } = action.payload;
  try {
    let response: BaseResponse<any | null> = yield call(
      returnPurchaseOrder,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        returnCallback(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        returnCallback(false);
        yield put(unauthorizedAction());
        break;
      default:
        returnCallback(false);
        break;
    }
  } catch (error) {
    returnCallback(false);
    console.log("error ", error);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* poPrintSaga(action: YodyAction) {
  const { id, updatePrintCallback } = action.payload;
  try {
    let response: Array<PurchaseOrderPrint> = yield call(getPrintContent, id);
    updatePrintCallback(response);
  } catch (error) {
    console.log("error ", error);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* poCancelSaga(action: YodyAction) {
  const { id, cancelCallback } = action.payload;
  try {
    let response: BaseResponse<PurchaseOrder> = yield call(
      cancelPurchaseOrderApi,
      id,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        cancelCallback(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        cancelCallback(false);
        yield put(unauthorizedAction());
        break;
      default:
        cancelCallback(false);
        break;
    }
  } catch (error) {
    cancelCallback(false);
    console.log("error ", error);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* exportPOSaga(action: YodyAction) {
  const { params, onResult } = action.payload;
  try {
    let response: BaseResponse<ImportResponse> = yield call(
      exportPOApi,
      params,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error: any) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau "+ error.message);
  }
}

function* getConfigPoSaga(action: YodyAction) {
  const {code, onResult } = action.payload;
  try {
    let response: BaseResponse<Array<FilterConfig>> = yield call(
      getPurchaseOrderConfigService,
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* createConfigPoSaga(action: YodyAction) {
  const { request, onResult } = action.payload;
  try {
    let response: BaseResponse<FilterConfig> = yield call(
      createPurchaseOrderConfigService,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult && onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult && onResult(false);
        yield put(unauthorizedAction());
        break;
      default:
        onResult && onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult && onResult(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* updateConfigPoSaga(action: YodyAction) {
  const {request, onResult } = action.payload;
  try {
    let response: BaseResponse<FilterConfig> = yield call(
      updatePurchaseOrderConfigService,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult && onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult && onResult(false);
        yield put(unauthorizedAction());
        break;
      default:
        onResult && onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult && onResult(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* deleteConfigPoSaga(action: YodyAction) {
  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<FilterConfig> = yield call(
      deletePurchaseOrderConfigService,
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

function* getLogDetailPOHistory(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<PurchaseOrder> = yield call(
      getLogDetailProcurements,
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
        break;
    }
  } catch (error) {
    console.log(error);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getLogPOHistory(action: YodyAction) {
  const { code, setData } = action.payload;
  try {
    let response: BaseResponse<PurchaseOrder> = yield call(
      getLogProcurements,
      code
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
    console.log(error);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* poSaga() {
  yield takeLatest(POType.CREATE_PO_REQUEST, poCreateSaga);
  yield takeLatest(POType.DETAIL_PO_REQUEST, poDetailSaga);
  yield takeLatest(POType.SEARCH_PO_REQUEST, poSearchSaga);
  yield takeLatest(POType.UPDATE_PO_REQUEST, poUpdateSaga);
  yield takeLatest(POType.UPDATE_NOTE_PO_REQUEST, poUpdateNoteSaga);
  yield takeLatest(POType.DELETE_PO_REQUEST, poDeleteSaga);
  yield takeLatest(POType.RETURN_PO_REQUEST, poReturnSaga);
  yield takeLatest(POType.GET_PRINT_CONTENT, poPrintSaga);
  yield takeLatest(
    POType.UPDATE_PO_FINANCIAL_STATUS_REQUEST,
    poUpdateFinancialStatusSaga
  );
  yield takeLatest(
    POType.CANCEL_PO_REQUEST,
    poCancelSaga
  );
  yield takeLatest(
    POType.EXPORT_PO,
    exportPOSaga
  );
  yield takeLatest(POConfig.GET_PO_CONFIG, getConfigPoSaga);
  yield takeLatest(POConfig.CREATE_PO_CONFIG, createConfigPoSaga);
  yield takeLatest(POConfig.UPDATE_PO_CONFIG, updateConfigPoSaga);
  yield takeLatest(POConfig.DELETE_PO_CONFIG, deleteConfigPoSaga);
  yield takeLatest(POLogHistory.GET_LOG_DETAIL_PO, getLogDetailPOHistory);
  yield takeLatest(POLogHistory.GET_LOG_PO, getLogPOHistory);
}
