import { searchColorApi } from '../../../service/product/color.service';
import { call,  takeEvery,  takeLatest } from '@redux-saga/core/effects';
import { YodyAction } from 'base/BaseAction';
import BaseResponse from 'base/BaseResponse';
import { HttpStatus } from 'config/HttpStatus';
import { showError } from 'utils/ToastUtils';
import { PageResponse } from 'model/response/base-metadata.response';
import { ColorResponse } from '../../../model/response/products/color.response';
import { ColorType } from '../../types/product.type';

function* searchColorSaga(action: YodyAction) {
  const {query,setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<ColorResponse>> = yield call(searchColorApi,query);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError('Có lỗi vui lòng thử lại sau');
  }
}

function* getColorSaga(action: YodyAction) {
  const {query, setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<ColorResponse>> = yield call(searchColorApi,query);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError('Có lỗi vui lòng thử lại sau');
  }
}

export function* colorSaga() {
  yield takeLatest(ColorType.SEARCH_COLOR_REQUEST, searchColorSaga);
  yield takeEvery(ColorType.GET_COLOR_REQUEST, getColorSaga);
}