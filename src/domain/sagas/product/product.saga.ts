import { ListDataModel } from './../../../model/other/list-data-model';
import { VariantResponse } from 'model/response/products/variant.response';
import { call, put, takeLatest } from '@redux-saga/core/effects';
import { YodyAction } from 'base/BaseAction';
import BaseResponse from 'base/BaseResponse';
import { HttpStatus } from 'config/HttpStatus';
import { hideLoading, showLoading } from 'domain/actions/loading.action';
import { ProductType } from 'domain/types/product.type';
import { searchVariantsApi } from 'service/product/product.service';
import { showError } from 'utils/ToastUtils';
import { PageResponse } from 'model/response/base-metadata.response';

function* searchVariantSaga(action: YodyAction) {
  const {
    query,
    setData
  } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<PageResponse<VariantResponse>> = yield call(searchVariantsApi, query);
    yield put(hideLoading());
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
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

export function* productSaga() {
  yield takeLatest(ProductType.SEARCH_PRODUCT_REQUEST, searchVariantSaga);
  yield takeLatest(ProductType.UPLOAD_PRODUCT_REQUEST, productUploadSaga);
}
