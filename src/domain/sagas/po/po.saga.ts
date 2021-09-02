import { returnPurchaseOrder } from "./../../../service/purchase-order/purchase-order.service";
import {
  searchPurchaseOrderApi,
  updatePurchaseOrder,
  updatePurchaseOrderFinancialStatus,
} from "service/purchase-order/purchase-order.service";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { POType } from "domain/types/purchase-order.type";
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
    showError("Có lỗi vui lòng thử lại sau");
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* poUpdateFinancialStatusSaga(action: YodyAction) {
  const { id, financialstatus, updateCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchaseOrder>> = yield call(
      updatePurchaseOrderFinancialStatus,
      id,
      financialstatus
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
    showError("Có lỗi vui lòng thử lại sau");
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
    showError("Có lỗi vui lòng thử lại sau");
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
    showError("Có lỗi vui lòng thử lại sau");
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}
function* poPrintSaga(action: YodyAction) {
  const { id, updatePrintCallback } = action.payload;
  try {
    let response: Array<PurchaseOrderPrint> = yield call(getPrintContent, id);
    console.log('response print', response);
    updatePrintCallback(response);
  } catch (error) {
    console.log("error ", error);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* poSaga() {
  yield takeLatest(POType.CREATE_PO_REQUEST, poCreateSaga);
  yield takeLatest(POType.DETAIL_PO_REQUEST, poDetailSaga);
  yield takeLatest(POType.SEARCH_PO_REQUEST, poSearchSaga);
  yield takeLatest(POType.UPDATE_PO_REQUEST, poUpdateSaga);
  yield takeLatest(POType.DELETE_PO_REQUEST, poDeleteSaga);
  yield takeLatest(POType.RETURN_PO_REQUEST, poReturnSaga);
  yield takeLatest(POType.GET_PRINT_CONTENT, poPrintSaga);
  yield takeLatest(
    POType.UPDATE_PO_FINANCIAL_STATUS_REQUEST,
    poUpdateFinancialStatusSaga
  );
}
