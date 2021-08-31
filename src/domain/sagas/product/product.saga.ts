import { VariantResponse } from "model/product/product.model";
import { call, put, takeEvery, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { ProductType } from "domain/types/product.type";
import {
  createProductApi,
  getVariantApi,
  productUploadApi,
  searchVariantsApi,
} from "service/product/product.service";
import { showError } from "utils/ToastUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { updateVariantApi } from "service/product/variant.service";
import { ProductUploadModel } from "model/product/product-upload.model";

function* searchVariantSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<VariantResponse>> = yield call(
      searchVariantsApi,
      query
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response);
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
  const { request, createCallback } = action.payload;
  try {
    let response: BaseResponse<PageResponse<VariantResponse>> = yield call(
      createProductApi,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
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

function* variantDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<VariantResponse> = yield call(getVariantApi, id);
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

function* uploadProductSaga(action: YodyAction) {
  const { files, folder, setData } = action.payload;
  try {
    let response: BaseResponse<Array<ProductUploadModel>> = yield call(
      productUploadApi,
      files,
      folder
    );
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

function* variantUpdateSaga(action: YodyAction) {
  const { id, request, onUpdateSuccess } = action.payload;
  try {
    let response: BaseResponse<VariantResponse> = yield call(
      updateVariantApi,
      id,
      request
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        onUpdateSuccess(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onUpdateSuccess(null);
        yield put(unauthorizedAction());
        break;
      default:
        onUpdateSuccess(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onUpdateSuccess(null);
    console.log("Update Variant: " + error);
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
  yield takeLatest(ProductType.VARIANT_UPDATE_REQUEST, variantUpdateSaga);
  yield takeEvery(ProductType.UPLOAD_PRODUCT_REQUEST, uploadProductSaga);
}
