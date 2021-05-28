import { call, put, takeLatest } from '@redux-saga/core/effects';
import { YodyAction } from 'base/BaseAction';
import BaseResponse from 'base/BaseResponse';
import { HttpStatus } from 'config/HttpStatus';
import { hideLoading, showLoading } from 'domain/actions/loading.action';
import { CategoryType } from 'domain/types/category.type';
import { CategoryResponse } from 'model/response/category.response';
import { getCategoryApi } from 'service/product/category.service';
import { showError } from 'utils/ToastUtils';

function* getCategorySaga(action: YodyAction) {
  const {query, setData} = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<Array<CategoryResponse>> = yield call(getCategoryApi, query);
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

export function* categorySaga() {
  yield takeLatest(CategoryType.GET_CATEGORY_REQUEST, getCategorySaga);
}