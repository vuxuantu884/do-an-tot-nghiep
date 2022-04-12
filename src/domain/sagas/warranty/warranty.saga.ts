import { call, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { PageResponse } from "model/base/base-metadata.response";
// import { showError } from "utils/ToastUtils";
import { put } from "redux-saga/effects";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { createWarrantyService, getWarrantiesService, getWarrantyDetailService, getWarrantyReasonsService, updateWarranty } from "service/warranty/warranty.service";
import { WarrantyType } from "domain/types/warranty.type";
import { showError } from "utils/ToastUtils";

function* GetDataWarranties(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<any>> = yield call(
      getWarrantiesService
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        setData(false);
        break;
    }
  } catch (e) {
    setData(false);
  }
}

function* GetDetailsWarranty(action: YodyAction) {
  let { id, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<any>> = yield call(
      getWarrantyDetailService,
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
        break;
    }
  } catch (e) {}
}

function* CreateWarranty(action: YodyAction) {
  let { body, setData } = action.payload;
  console.log('CreateWarranty', body);
  
  try {
    let response: BaseResponse<PageResponse<any>> = yield call(
      createWarrantyService,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        setData(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (e) {
    setData(false);
  }
}

function* UpdateWarranty(action: YodyAction) {
  let { id, body, setData } = action.payload;
  console.log('UpdateWarranty', body);
  
  try {
    let response: BaseResponse<PageResponse<any>> = yield call(
      updateWarranty,
      id,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        setData(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (e) {
    setData(false);
  }
}


function* GetWarrantyReasons(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<any>> = yield call(
      getWarrantyReasonsService
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        setData(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (e) {
    setData(false);
  }
}

export function* warrantySaga() {
  yield takeLatest(WarrantyType.GET_DATA_WARRANTIES_REQUEST, GetDataWarranties);
  yield takeLatest(WarrantyType.GET_DETAILS_WARRANTY_REQUEST, GetDetailsWarranty);
  yield takeLatest(WarrantyType.CREATE_WARRANTY_REQUEST, CreateWarranty);
  yield takeLatest(WarrantyType.UPDATE_WARRANTY_REQUEST, UpdateWarranty);
  yield takeLatest(WarrantyType.GET_WARRANTY_REASONS_REQUEST, GetWarrantyReasons);
  
}
