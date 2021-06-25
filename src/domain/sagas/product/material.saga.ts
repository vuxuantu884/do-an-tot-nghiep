import {
  deleteOneMaterialApi,
  deleteManyMaterialApi,
  getMaterialApi,
  createMaterialApi,
  detailMaterialApi,
  updateMaterialApi,
} from "service/product/material.service";
import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { MaterialType } from "domain/types/product.type";
import { PageResponse } from "model/base/base-metadata.response";
import { MaterialResponse } from "model/product/material.model";
import { showError } from "utils/ToastUtils";
import { unauthorizedAction } from "domain/actions/auth/auth.action";

function* materialGetSaga(action: YodyAction) {
  const { query, setData, setMetadata } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<PageResponse<MaterialResponse>> = yield call(
      getMaterialApi,
      query
    );
    yield put(hideLoading());
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setMetadata(response.data.metadata);
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
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* materialSearchAllSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<PageResponse<MaterialResponse>> = yield call(
      getMaterialApi,
      query
    );
    yield put(hideLoading());
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
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* materialDeleteOneSaga(action: YodyAction) {
  let { id, onDeleteSuccess } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<string> = yield call(deleteOneMaterialApi, id);
    yield put(hideLoading());
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
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* materialDeleteManySaga(action: YodyAction) {
  let { ids, onDeleteSuccess } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<string> = yield call(deleteManyMaterialApi, ids);
    yield put(hideLoading());
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
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* materialCreateSaga(action: YodyAction) {
  let { request, onCreateSuccess } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<MaterialResponse> = yield call(
      createMaterialApi,
      request
    );
    yield put(hideLoading());
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
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* materialDetailSaga(action: YodyAction) {
  let { id, setMaterial } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<MaterialResponse> = yield call(
      detailMaterialApi,
      id
    );
    yield put(hideLoading());
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setMaterial(response.data);
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

function* materialUpdateSaga(action: YodyAction) {
  let { id, request, onUpdateSuccess } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<MaterialResponse> = yield call(
      updateMaterialApi,
      id,
      request
    );
    yield put(hideLoading());
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
    yield put(hideLoading());
    showError("Có lỗi vui lòng thử lại sau");
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
