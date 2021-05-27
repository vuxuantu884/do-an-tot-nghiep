import { VariantResponse } from 'model/response/products/variant.response';
import { call, put, takeLatest } from '@redux-saga/core/effects';
import { YodyAction } from 'base/BaseAction';
import BaseResponse from 'base/BaseResponse';
import { HttpStatus } from 'config/HttpStatus';
import { hideLoading, showLoading } from 'domain/actions/loading.action';
import { AccountType } from 'domain/types/account.type';
import { getAccountByDepartment } from 'service/account/account.service';
import { showError } from 'utils/ToastUtils';
import { PageResponse } from 'model/response/base-metadata.response';
import { AccountDetailResponse } from "model/response/accounts/account-detail.response";




function* searchAccountByDepartment(action: YodyAction) {
  const {
    department_id,
    setData
  } = action.payload;
  try {
    
    let response: BaseResponse<PageResponse<AccountDetailResponse>> = yield call(getAccountByDepartment, department_id);
    
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data.items);
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
  yield takeLatest(AccountType.GET_ACCOUNT_DEPARTMENT_REQUEST, searchAccountByDepartment);
}