import BaseResponse from 'base/BaseResponse';
import { YodyAction } from '../../../base/BaseAction';
import { HttpStatus } from "config/HttpStatus";
import { getListStoreError, saveAccounts } from 'domain/actions/core/store.action';
import {StoreType} from "domain/types/product.type";
import { call, put, takeLatest } from "redux-saga/effects";
import { getListStore, getStoreDetail } from "service/product/store.service";
import { StoreModel } from 'model/other/StoreModel';
import { hideLoading, showLoading } from 'domain/actions/loading.action';
import { getCompanyByGroupId } from 'service/content/company.service';
import { CompanyModel } from 'model/other/CompanyModel';
import { companyChange } from 'domain/actions/appsetting.action';



function* getDataStore(action: YodyAction) {
  let {setData} = action.payload;
  try {
    let response: BaseResponse<Array<StoreModel>> = yield call(getListStore);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        yield put(getListStoreError());
        break;
    }
  } catch (error) {
    yield put(getListStoreError());
  }
}

function* validateStoreSaga(action: YodyAction) {
  try {
    yield put(showLoading())
    let response: BaseResponse<StoreModel> = yield call(getStoreDetail, action.payload.id);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        let company: CompanyModel = yield call(getCompanyId, response.data.group_id);
        yield put(companyChange(company));
        yield put(saveAccounts(response.data.accounts));
        action.payload.verify(true);
        yield put(hideLoading())
        break;
      default:
        break;
    }
  } catch (error) {
    
  }
}

function* getCompanyId(groupId: number) {
  try {
    let response: BaseResponse<CompanyModel> = yield call(getCompanyByGroupId, groupId);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        return response.data;
      default:
        return null;
    }
  } catch(error) {
    return null;
  }
}

function* StoreSaga(){
  yield takeLatest(StoreType.GET_LIST_STORE_REQUEST, getDataStore);
  yield takeLatest(StoreType.VALIDATE_STORE, validateStoreSaga);
}

export default StoreSaga;
