import { deleteOneMaterialApi, deleteManyMaterialApi, getMaterialApi, createMaterialApi } from './../../service/product/material.service';
import { call, put, takeLatest } from '@redux-saga/core/effects';
import { YodyAction } from 'base/BaseAction';
import BaseResponse from 'base/BaseResponse';
import { HttpStatus } from 'config/HttpStatus';
import { hideLoading, showLoading } from 'domain/actions/loading.action';
import { MaterialType } from 'domain/types/product.type';
import { PageResponse } from 'model/response/base-metadata.response';
import { MaterialResponse } from 'model/response/product/material.response';
import { showError } from 'utils/ToastUtils';

function* getMaterialSaga(action: YodyAction) {
  const {
    query,
    setData,
    setMetadata
  } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<PageResponse<MaterialResponse>> = yield call(getMaterialApi, query);
    yield put(hideLoading());
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setMetadata(response.data.metadata);
        setData(response.data.items);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading());
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* deleteOneMaterialSaga(action: YodyAction) {
  let {id, onDeleteSuccess} = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<string> = yield call(deleteOneMaterialApi, id);
    yield put(hideLoading());
    switch(response.code) {
      case HttpStatus.SUCCESS:
        onDeleteSuccess();
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading());
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* deleteManyMaterialSaga(action: YodyAction) {
  let {ids, onDeleteSuccess} = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<string> = yield call(deleteManyMaterialApi, ids);
    yield put(hideLoading());
    switch(response.code) {
      case HttpStatus.SUCCESS:
        onDeleteSuccess();
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading());
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* createMaterialSaga(action: YodyAction) {
  let {request, onCreateSuccess} = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<MaterialResponse> = yield call(createMaterialApi, request);
    yield put(hideLoading());
    switch(response.code) {
      case HttpStatus.SUCCESS:
        onCreateSuccess();
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading());
    showError('Có lỗi vui lòng thử lại sau');
  }
}

export function* materialSaga() {
  yield takeLatest(MaterialType.GET_MATERIAL_REQUEST, getMaterialSaga);
  yield takeLatest(MaterialType.DELETE_ONE_MATERIAL_REQUEST, deleteOneMaterialSaga);
  yield takeLatest(MaterialType.DELETE_MANY_MATERIAL_REQUEST, deleteManyMaterialSaga);
  yield takeLatest(MaterialType.CREATE_MATERIAL_REQUEST, createMaterialSaga);
}