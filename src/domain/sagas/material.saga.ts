import { getMaterialApi } from './../../service/product/material.service';
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

export function* materialSaga() {
  yield takeLatest(MaterialType.GET_MATERIAL_REQUEST, getMaterialSaga);
}