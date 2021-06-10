import { StoreResponse } from './../../../model/response/core/store.response';
import BaseResponse from 'base/BaseResponse';
import { YodyAction } from '../../../base/BaseAction';
import { HttpStatus } from "config/HttpStatus";
import {StoreType} from "domain/types/product.type";
import { call, put, takeLatest } from "redux-saga/effects";
import { getListStore, getStoreDetail } from "service/core/store.service";
import { showLoading } from 'domain/actions/loading.action';

function* getDataStore(action: YodyAction) {
  let {setData} = action.payload;
  try {
    let response: BaseResponse<Array<StoreResponse>> = yield call(getListStore);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        
        break;
    }
  } catch (error) {
  }
}

function* validateStoreSaga(action: YodyAction) {
  let {payload} = action;
  try {
    yield put(showLoading())
    let response: BaseResponse<StoreResponse> = yield call(getStoreDetail, action.payload.id);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        payload.setData(response.data);
        break;
      default:
        break;
    }
  } catch (error) {
    
  }
}

function* StoreSaga(){
  yield takeLatest(StoreType.GET_LIST_STORE_REQUEST, getDataStore);
  yield takeLatest(StoreType.VALIDATE_STORE, validateStoreSaga);
}

export default StoreSaga;
