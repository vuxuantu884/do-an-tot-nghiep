import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { PRINTER_TYPES } from "domain/types/printer.type";
import { PageResponse } from "model/base/base-metadata.response";
import { PrinterResponseModel } from "model/response/printer.response";
import {
  getListPrinterService,
  getPrinterDetailService,
} from "service/printer/printer.service";
import { showError } from "utils/ToastUtils";

function* listDataPrinterSaga(action: YodyAction) {
  const { params, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<PrinterResponseModel>> = yield call(
      getListPrinterService,
      params
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
  const { id, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<PrinterResponseModel>> = yield call(
      getPrinterDetailService,
      id
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

export function* settingPrinterSaga() {
  yield takeLatest(PRINTER_TYPES.listPrinter, listDataPrinterSaga);
  yield takeLatest(PRINTER_TYPES.getPrinterDetail, getPrinterDetailSaga);
}
