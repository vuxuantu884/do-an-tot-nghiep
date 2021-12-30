import {
  updatePurchaseProcumentService,
  updateStatusPO,
  deletePurchaseProcumentService,
  searchProcurementApi,
  importProcumentApi,
  confirmPoProcumentService,
  approvalPurchaseProcumentService,
} from "service/purchase-order/purchase-procument.service";
import { createPurchaseProcumentService } from "service/purchase-order/purchase-procument.service";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { showError } from "utils/ToastUtils";
import { POProcumentType } from "domain/types/purchase-order.type";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import { PageResponse } from "model/base/base-metadata.response";

function* poProcumentCreateSaga(action: YodyAction) {
  const { poId, request, createCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchaseProcument>> = yield call(
      createPurchaseProcumentService,
      poId,
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* poProcumentUpdateSaga(action: YodyAction) {
  const { poId, procumentId, request, updateCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchaseProcument>> = yield call(
      updatePurchaseProcumentService,
      poId,
      procumentId,
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* approvalPoProcumentUpdateSaga(action: YodyAction) {
  const { poId, procumentId, request, updateCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchaseProcument>> = yield call(
      approvalPurchaseProcumentService,
      poId,
      procumentId,
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* confirmPoProcumentConfirmSaga(action: YodyAction) {
  const { poId, procumentId, request, updateCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchaseProcument>> = yield call(
      confirmPoProcumentService,
      poId,
      procumentId,
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* poProcumentFinishSaga(action: YodyAction) {
  const { poId, updateCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchaseProcument>> = yield call(
      updateStatusPO,
      poId,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}
function* poProcumentDeleteSaga(action: YodyAction) {
  const { poId, procumentId, deleteCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchaseProcument>> = yield call(
      deletePurchaseProcumentService,
      poId,
      procumentId
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        deleteCallback(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        deleteCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        deleteCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    deleteCallback(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* searchProcurementSaga(action: YodyAction) {
  const { query, onResult } = action.payload;
  try {
    let response: BaseResponse<PageResponse<PurchaseProcument>> = yield call(
      searchProcurementApi,
      query,
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

function* importProcumentSaga(action: YodyAction) {
  const { params, onResult } = action.payload;
  try {
    let response: BaseResponse<any> = yield call(
      importProcumentApi,
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

export function* poProcumentSaga() {
  yield takeLatest(
    POProcumentType.CREATE_PO_PROCUMENT_REQUEST,
    poProcumentCreateSaga
  );
  yield takeLatest(
    POProcumentType.UPDATE_PO_PROCUMENT_REQUEST,
    poProcumentUpdateSaga
  );
  yield takeLatest(
    POProcumentType.FINNISH_PO_PROCUMENT_REQUEST,
    poProcumentFinishSaga
  );
  yield takeLatest(
    POProcumentType.DELETE_PO_PROCUMENT_REQUEST,
    poProcumentDeleteSaga
  );
  yield takeEvery(
    POProcumentType.SEARCH_PROCUREMENT,
    searchProcurementSaga
  );
  yield takeEvery(
    POProcumentType.IMPORT_PROCUMENT,
    importProcumentSaga
  );
  yield takeEvery(POProcumentType.APROVAL_PROCUMENT, approvalPoProcumentUpdateSaga);
  yield takeEvery(POProcumentType.CONFIRM_PROCUMENT, confirmPoProcumentConfirmSaga);
} 