import {
  colorCreateApi,
  colorDeleteManyApi,
  colorDeleteOneApi,
  colorDetailApi,
  colorSearchApi,
  colorUpdateApi,
} from "service/product/color.service";
import { call, takeLatest, takeEvery } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { showError } from "utils/ToastUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { ColorResponse } from "model/product/color.model";
import { ColorType } from "domain/types/product.type";
import { put } from "redux-saga/effects";
import { unauthorizedAction } from "domain/actions/auth/auth.action";

function* searchColorSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<ColorResponse>> = yield call(
      colorSearchApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
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

function* getListColorSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<ColorResponse>> = yield call(
      colorSearchApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        setData(response.data.items);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        console.log("getListColorSaga:" + response.errors);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("getListColorSaga:" + error);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getColorSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<ColorResponse>> = yield call(
      colorSearchApi,
      query
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
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* deleteColorSaga(action: YodyAction) {
  const { id, onDeleteSuccess } = action.payload;
  try {
    let response: BaseResponse<string> = yield call(colorDeleteOneApi, id);
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

function* deleteManyColorSaga(action: YodyAction) {
  const { ids, onDeleteSuccess } = action.payload;
  try {
    let response: BaseResponse<string> = yield call(colorDeleteManyApi, ids);
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

export function* colorCreateSaga(action: YodyAction) {
  const { request, createCallback } = action.payload;
  try {
    let response: BaseResponse<ColorResponse> = yield call(
      colorCreateApi,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        createCallback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        createCallback(null);
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

export function* colorUpdateSaga(action: YodyAction) {
  const { id, request, onCreateSuccess } = action.payload;
  try {
    let response: BaseResponse<string> = yield call(
      colorUpdateApi,
      id,
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

export function* colorDetailRequest(action: YodyAction) {
  const { id, getColorCallback } = action.payload;
  try {
    let response: BaseResponse<ColorResponse> = yield call(colorDetailApi, id);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        getColorCallback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());

        break;
      default:
        response.errors.forEach((e) => showError(e));
        getColorCallback(false);
        break;
    }
  } catch (error) {
    getColorCallback(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* colorSaga() {
  yield takeLatest(ColorType.SEARCH_COLOR_REQUEST, searchColorSaga);
  yield takeEvery(ColorType.GET_COLOR_REQUEST, getColorSaga);
  yield takeLatest(ColorType.DELETE_COLOR_REQUEST, deleteColorSaga);
  yield takeLatest(ColorType.DELETE_MANY_COLOR_REQUEST, deleteManyColorSaga);
  yield takeEvery(ColorType.LIST_COLOR_REQUEST, getListColorSaga);
  yield takeLatest(ColorType.CREATE_COLOR_REQUEST, colorCreateSaga);
  yield takeLatest(ColorType.DETAIL_COLOR_REQUEST, colorDetailRequest);
  yield takeLatest(ColorType.UPDATE_COLOR_REQUEST, colorUpdateSaga);
}
