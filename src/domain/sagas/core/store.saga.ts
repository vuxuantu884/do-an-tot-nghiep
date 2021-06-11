import BaseResponse from 'base/BaseResponse';
import { YodyAction } from 'base/BaseAction';
import { showError } from 'utils/ToastUtils';
import { StoreResponse } from 'model/response/core/store.response';
import { getListStore } from 'service/core/store.service';
import { call, put, takeLatest } from '@redux-saga/core/effects';
import { hideLoading, showLoading } from 'domain/actions/loading.action';
import { HttpStatus } from 'config/HttpStatus';
import { StoreType } from 'domain/types/core.type';
import { PageResponse } from 'model/base/base-metadata.response';
import { storeGetApi } from 'service/core/store.services';

function* storeGetAllSaga(action: YodyAction) {
  let {setData} = action.payload;
  try {
    let response: BaseResponse<Array<StoreResponse>> = yield call(getListStore);
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

function* storeSearchSaga(action: YodyAction) {
  const {query, setData} = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<PageResponse<StoreResponse>> = yield call(storeGetApi, query);
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

function* StoreSaga(){
  yield takeLatest(StoreType.GET_LIST_STORE_REQUEST, storeGetAllSaga);
  yield takeLatest(StoreType.STORE_SEARCH, storeSearchSaga);
}

export default StoreSaga;
