import {
  deleteOneMaterialApi,
  deleteManyMaterialApi,
  getMaterialApi,
  createMaterialApi,
  detailMaterialApi,
  updateMaterialApi,
} from "service/product/material.service";
import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { MaterialType } from "domain/types/product.type";
import { PageResponse } from "model/base/base-metadata.response";
import { MaterialResponse } from "model/product/material.model";
import { showError } from "utils/ToastUtils";
import { unauthorizedAction } from "domain/actions/auth/auth.action";

function* materialGetSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<MaterialResponse>> = yield call(
      getMaterialApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data)
        break;
      case HttpStatus.UNAUTHORIZED:
        setData(false);
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    setData(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* materialSearchAllSaga(action: YodyAction) {
  const { setData } = action.payload;
  try {

    let response: BaseResponse<PageResponse<MaterialResponse>> = yield call(
      getMaterialApi,
      {limit: 500}
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

function* materialDeleteOneSaga(action: YodyAction) {
  let { id, onDeleteSuccess } = action.payload;
  try {

    let response: BaseResponse<string> = yield call(deleteOneMaterialApi, id);

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

function* materialDeleteManySaga(action: YodyAction) {
  let { ids, onDeleteSuccess } = action.payload;
  try {

    let response: BaseResponse<string> = yield call(deleteManyMaterialApi, ids);

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

function* materialCreateSaga(action: YodyAction) {
  let { request, onCreateSuccess } = action.payload;
  try {

    let response: BaseResponse<MaterialResponse> = yield call(
      createMaterialApi,
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

function* materialDetailSaga(action: YodyAction) {
  let { id, setMaterial } = action.payload;
  try {

    let response: BaseResponse<MaterialResponse> = yield call(
      detailMaterialApi,
      id
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        setMaterial(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setMaterial(false);
        yield put(unauthorizedAction());
        break;
      default:
        setMaterial(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    setMaterial(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

function* materialUpdateSaga(action: YodyAction) {
  let { id, request, onUpdate } = action.payload;
  try {

    let response: BaseResponse<MaterialResponse> = yield call(
      updateMaterialApi,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onUpdate(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onUpdate(false);
        yield put(unauthorizedAction());
        break;
      default:
        onUpdate(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onUpdate(false);
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* materialSaga() {
  yield takeLatest(MaterialType.GET_MATERIAL_REQUEST, materialGetSaga);
  yield takeLatest(
    MaterialType.SEARCH_ALL_MATERIAL_REQUEST,
    materialSearchAllSaga
  );
  yield takeLatest(
    MaterialType.DELETE_ONE_MATERIAL_REQUEST,
    materialDeleteOneSaga
  );
  yield takeLatest(
    MaterialType.DELETE_MANY_MATERIAL_REQUEST,
    materialDeleteManySaga
  );
  yield takeLatest(MaterialType.CREATE_MATERIAL_REQUEST, materialCreateSaga);
  yield takeLatest(MaterialType.DETAIL_MATERIAL_REQUEST, materialDetailSaga);
  yield takeLatest(MaterialType.UPDATE_MATERIAL_REQUEST, materialUpdateSaga);
}
