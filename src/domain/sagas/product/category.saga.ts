import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { CategoryType } from "domain/types/product.type";
import { CategoryResponse } from "model/product/category.model";
import {
  createCategoryApi,
  getCategoryApi,
  categoryDetailApi,
  updateCategoryApi,
  categoryDeleteApi,
} from "service/product/category.service";
import { showError } from "utils/ToastUtils";

function* getCategorySaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    let response: BaseResponse<Array<CategoryResponse>> = yield call(getCategoryApi, query);

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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* createCategorySaga(action: YodyAction) {
  const { request, onCreateSuccess } = action.payload;
  try {
    let response: BaseResponse<CategoryResponse> = yield call(createCategoryApi, request);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onCreateSuccess(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* categoryDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<CategoryResponse> = yield call(categoryDetailApi, id);

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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* categoryUpdateSaga(action: YodyAction) {
  const { id, request, onUpdateSuccess } = action.payload;
  try {
    let response: BaseResponse<CategoryResponse> = yield call(updateCategoryApi, id, request);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        onUpdateSuccess(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* categoryDeleteSaga(action: YodyAction) {
  const { id, onDeleteSuccess } = action.payload;
  try {
    let response: BaseResponse<string> = yield call(categoryDeleteApi, id);

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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* categorySaga() {
  yield takeLatest(CategoryType.GET_CATEGORY_REQUEST, getCategorySaga);
  yield takeLatest(CategoryType.CREATE_CATEGORY_REQUEST, createCategorySaga);
  yield takeLatest(CategoryType.DETAIL_CATEGORY_REQUEST, categoryDetailSaga);
  yield takeLatest(CategoryType.UPDATE_CATEGORY_REQUEST, categoryUpdateSaga);
  yield takeLatest(CategoryType.DELETE_CATEGORY_REQUEST, categoryDeleteSaga);
}
