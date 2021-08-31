import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { PRINTER_TYPES } from "domain/types/printer.type";
import { PageResponse } from "model/base/base-metadata.response";
import {
  PrinterResponseModel,
  PrinterVariableResponseModel,
  PrintFormByOrderIdsResponseModel,
} from "model/response/printer.response";
import {
  createPrinterService,
  getListPrinterService,
  getListPrinterVariablesService,
  getPrinterDetailService,
  getPrintFormByOrderIdsService,
} from "service/printer/printer.service";
import { showError, showSuccess } from "utils/ToastUtils";

function* listDataPrinterSaga(action: YodyAction) {
  const { queryParams, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<PrinterResponseModel>> = yield call(
      getListPrinterService,
      queryParams
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        /**
         * call function handleData in payload, variables are taken from the response -> use when dispatch
         */
        handleData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* getPrinterDetailSaga(action: YodyAction) {
  const { id, queryParams, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<PrinterResponseModel>> = yield call(
      getPrinterDetailService,
      id,
      queryParams
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        /**
         * call function handleData in payload, variables are taken from the response -> use when dispatch
         */
        handleData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}
function* createPrinterSaga(action: YodyAction) {
  const { handleData, formValue } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<PrinterResponseModel>> = yield call(
      createPrinterService,
      formValue
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        /**
         * call function handleData in payload, variables are taken from the response -> use when dispatch
         */
        showSuccess("Tạo mới mẫu in thành công");
        handleData();
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* fetchListPrinterVariablesSaga(action: YodyAction) {
  const { handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<PrinterVariableResponseModel>> =
      yield call(getListPrinterVariablesService);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        /**
         * call function handleData in payload, variables are taken from the response -> use when dispatch
         */
        handleData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* fetchPrintFormByOrderIdsSaga(action: YodyAction) {
  const { ids, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<BaseResponse<PrintFormByOrderIdsResponseModel>> =
      yield call(getPrintFormByOrderIdsService, ids);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        /**
         * call function handleData in payload, variables are taken from the response -> use when dispatch
         */
        handleData(response);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

export function* settingPrinterSaga() {
  yield takeLatest(PRINTER_TYPES.listPrinter, listDataPrinterSaga);
  yield takeLatest(PRINTER_TYPES.getPrinterDetail, getPrinterDetailSaga);
  yield takeLatest(PRINTER_TYPES.createPrinter, createPrinterSaga);
  yield takeLatest(
    PRINTER_TYPES.getListPrinterVariables,
    fetchListPrinterVariablesSaga
  );
  yield takeLatest(
    PRINTER_TYPES.getPrintFormByOrderIds,
    fetchPrintFormByOrderIdsSaga
  );
}
