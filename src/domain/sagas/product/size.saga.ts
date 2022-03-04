import { SizeType } from "domain/types/product.type";
import { SizeResponse } from "model/product/size.model";
import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import {
  getAllSizeApi,
  getSearchSize,
  sizeCreateApi,
  sizeDeleteManyApi,
  sizeDeleteOneApi,
  sizeDetailApi,
  sizeUpdateApi,
} from "service/product/size.service";
import { showError } from "utils/ToastUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { unauthorizedAction } from "domain/actions/auth/auth.action";

function* getAllSizeSaga(action: YodyAction) {
  const { setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<SizeResponse>> = yield call(
      getAllSizeApi
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
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* sizeSearchSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {

    let response: BaseResponse<PageResponse<SizeResponse>> = yield call(
      getSearchSize,query
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* sizeCreateSaga(action: YodyAction) {
  const { request, onCreateSuccess } = action.payload;
  try {
    let response: BaseResponse<SizeResponse> = yield call(
      sizeCreateApi,
      request
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        onCreateSuccess();
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* sizeDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<SizeResponse> = yield call(sizeDetailApi, id);

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

function* sizeUpdateSaga(action: YodyAction) {
  const { id, request, onUpdateSuccess } = action.payload;
  try {
    let response: BaseResponse<SizeResponse> = yield call(
      sizeUpdateApi,
      id,
      request
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        onUpdateSuccess();
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* sizeDeleteSaga(action: YodyAction) {
  const { id, onDeleteSuccess } = action.payload;
  try {
    let response: BaseResponse<SizeResponse> = yield call(sizeDeleteOneApi, id);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onDeleteSuccess();
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* sizeDeleteManySaga(action: YodyAction) {
  const { ids, onDeleteSuccess } = action.payload;
  try {
    let response: BaseResponse<string> = yield call(sizeDeleteManyApi, ids);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onDeleteSuccess();
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* sizeSaga() {
  yield takeLatest(SizeType.GET_ALL_SIZE_REQUEST, getAllSizeSaga);
  yield takeLatest(SizeType.SEARCH_SIZE_REQUEST, sizeSearchSaga);
  yield takeLatest(SizeType.CREATE_SIZE_REQUEST, sizeCreateSaga);
  yield takeLatest(SizeType.DETAIL_SIZE_REQUEST, sizeDetailSaga);
  yield takeLatest(SizeType.UPDATE_SIZE_REQUEST, sizeUpdateSaga);
  yield takeLatest(SizeType.DELETE_SIZE_REQUEST, sizeDeleteSaga);
  yield takeLatest(SizeType.DELETE_MANY_SIZE_REQUEST, sizeDeleteManySaga);
}
