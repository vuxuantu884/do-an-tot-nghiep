import { SizeType } from '../../types/product.type';
import { SizeResponse } from '../../../model/response/products/size.response';
import { call,  takeLatest } from '@redux-saga/core/effects';
import { YodyAction } from 'base/BaseAction';
import BaseResponse from 'base/BaseResponse';
import { HttpStatus } from 'config/HttpStatus';
import { getAllSizeApi } from 'service/product/size.service';
import { showError } from 'utils/ToastUtils';
import { PageResponse } from 'model/response/base-metadata.response';

function* getAllSizeSaga(action: YodyAction) {
  const {setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<SizeResponse>> = yield call(getAllSizeApi);
    debugger;
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data.items);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError('Có lỗi vui lòng thử lại sau');
  }
}

export function* sizeSaga() {
  yield takeLatest(SizeType.GET_ALL_SIZE_REQUEST, getAllSizeSaga);
}