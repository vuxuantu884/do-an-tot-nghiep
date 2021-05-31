import { VariantModel } from './../../model/other/ProductModel';
import { ListDataModel } from './../../model/other/ListDataModel';
import { showError } from '../../utils/ToastUtils';
import BaseResponse from 'base/BaseResponse';
import { YodyAction } from 'base/BaseAction';
import { SearchType } from 'domain/types/search.type';
import { call, takeLatest, put, select } from 'redux-saga/effects';
import { getVariantByBarcode, getVariants } from 'service/product/variant.service';
import { HttpStatus } from 'config/HttpStatus';
import { clearResult, UpdateResultSearch } from '../actions/search.action';
import { addOrderRequest } from 'domain/actions/order.action';
import { RootReducerType } from 'model/reducers/RootReducerType';

const PAGE = 0;
const LIMIT = 10;


function* onKeySearchChange(action: YodyAction) {
  let {payload} = action;
  try {
    if(payload.key.length >= 3) {
      const response: BaseResponse<ListDataModel<VariantModel>> = yield call(getVariants,PAGE, LIMIT, payload.key);
      if(response.code === HttpStatus.SUCCESS) {
        payload.setData(response.data.items);
      }
    } else {
      yield put(clearResult());
    }
  } catch (error) {
    yield put(clearResult());
  }
}

function* searchBarCodeSaga(action: YodyAction) {
  let {payload} = action;
  try {
    let response: BaseResponse<VariantModel> = yield call(getVariantByBarcode, payload.barcode);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        let splitLine: boolean = yield select((state: RootReducerType) => state.appSettingReducer.data.splitLine);
        yield put(addOrderRequest(response.data, splitLine));
        break;
      default:
        showError('Không tìm thấy sản phẩm')
        break;
    }
  } catch (error) {
    showError('Không tìm thấy sản phẩm')
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
  yield takeLatest(SearchType.SEARCH_BAR_CODE, searchBarCodeSaga);
  yield takeLatest(SearchType.SEARCH_GIFT, searchGiftSaga);
}