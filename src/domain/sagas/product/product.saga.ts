import { VariantResponse } from "model/product/product.model";
import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { ProductType } from "domain/types/product.type";
import {
  createProductApi,
  getVariantApi,
  searchVariantsApi,
} from "service/product/product.service";
import { showError } from "utils/ToastUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { unauthorizedAction } from "domain/actions/auth/auth.action";

function* searchVariantSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<PageResponse<VariantResponse>> = yield call(
      searchVariantsApi,
      query
    );
    yield put(hideLoading());
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
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* searchVariantOrderSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    if (query.info.length >= 3) {
      let response: BaseResponse<PageResponse<VariantResponse>> = yield call(
        searchVariantsApi,
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
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* createProductSaga(action: YodyAction) {
  const { request, onCreateSuccess } = action.payload;
  try {
    let response: BaseResponse<PageResponse<VariantResponse>> = yield call(
      createProductApi,
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* variantDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<VariantResponse> = yield call(getVariantApi, id);
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
    console.log("error ", error);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* productSaga() {
  yield takeLatest(ProductType.SEARCH_PRODUCT_REQUEST, searchVariantSaga);
  yield takeLatest(
    ProductType.SEARCH_PRODUCT_FOR_ORDER_REQUEST,
    searchVariantOrderSaga
  );
  yield takeLatest(ProductType.CREATE_PRODUCT_REQEUST, createProductSaga);
  yield takeLatest(ProductType.VARIANT_DETAIL_REQUEST, variantDetailSaga);
}
