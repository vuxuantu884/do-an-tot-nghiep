import { VariantResponse } from 'model/response/products/variant.response';
import { call, put, takeLatest } from '@redux-saga/core/effects';
import { YodyAction } from 'base/BaseAction';
import BaseResponse from 'base/BaseResponse';
import { HttpStatus } from 'config/HttpStatus';
import { hideLoading, showLoading } from 'domain/actions/loading.action';
import { ProductType } from 'domain/types/product.type';
import { searchVariantsApi } from 'service/product/product.service';
import { showError } from 'utils/ToastUtils';

function* searchVariantSaga(action: YodyAction) {
  const {info, barcode, setData} = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<Array<VariantResponse>> = yield call(searchVariantsApi, info, barcode);
    yield put(hideLoading());
    switch(response.code) {
      case HttpStatus.SUCCESS:
        let arrResult: Array<VariantResponse> = response.data;
        setData(arrResult);
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
}
