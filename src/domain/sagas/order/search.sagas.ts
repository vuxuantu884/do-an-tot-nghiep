import { VariantModel } from 'model/other/Product/product-model';
import { ListDataModel } from 'model/other/list-data-model';
import BaseResponse from 'base/BaseResponse';
import { YodyAction } from 'base/BaseAction';
import { SearchType } from 'domain/types/search.type';
import { call, takeLatest, put } from 'redux-saga/effects';
import {  getVariants } from 'service/product/variant.service';
import { HttpStatus } from 'config/HttpStatus';
import { clearResult } from '../../actions/search.action';

const PAGE = 0;
const LIMIT = 10;


function* onKeySearchChange(action: YodyAction) {
  let {payload} = action;
  try {
    if(payload.key.length >= 3) {
      const response: BaseResponse<ListDataModel<VariantModel>> = yield call(getVariants,PAGE, LIMIT, payload.key);
      if(response.code === HttpStatus.SUCCESS) {
        console.log(response.data.items)
        payload.setData(response.data.items);
      }
    } else {
      yield put(clearResult());
    }
  } catch (error) {
    yield put(clearResult());
  }
}

function* searchGiftSaga(action: YodyAction) {
  let {payload} = action;
  try {
    if(payload.key.length >= 3) {
      const response: BaseResponse<ListDataModel<VariantModel>> = yield call(getVariants,PAGE, LIMIT, payload.key);
      if(response.code === HttpStatus.SUCCESS) {
        payload.setData(response.data.items);
      }
    } else {
      payload.setData([]);
    }
  } catch (error) {
    payload.setData([]);
  }
}

export default function* searchSagas() {
  yield takeLatest(SearchType.KEY_SEARCH_CHANGE, onKeySearchChange);
  yield takeLatest(SearchType.SEARCH_GIFT, searchGiftSaga);
}