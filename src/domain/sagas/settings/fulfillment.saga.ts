import { call, put, takeLatest } from '@redux-saga/core/effects';
import { YodyAction } from 'base/BaseAction';
import BaseResponse from 'base/BaseResponse';
import { HttpStatus } from 'config/HttpStatus';
import { unauthorizedAction } from 'domain/actions/auth/auth.action';
import { actionFetchListFailed, actionFetchListSuccessful } from 'domain/actions/settings/fulfillment.action';
import { SETTING_TYPES } from 'domain/types/settings.type';
import { PageResponse } from 'model/base/base-metadata.response';
import { SizeResponse } from 'model/product/size.model';
import { searchVariantsApi } from 'service/product/product.service';
import { showError } from 'utils/ToastUtils';

function* listAllSaga(action: YodyAction) {
  console.log('action', action)
  const { params } = action.payload;
  try {
    // const {params} = action.payload;
    // console.log('action', action)
    // console.log('22');
    /**
    * chỗ này phải sửa sau, đợi api
    */
     let response: BaseResponse<PageResponse<SizeResponse>> = yield call(
      searchVariantsApi, params
    );
    console.log('response', response)

    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log('response.data.items',response.data.items)
        yield put(actionFetchListSuccessful(response.data.items))
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log('error', error)
    yield put(actionFetchListFailed(error))
    showError('Có lỗi vui lòng thử lại sau');
  }
}

export function* settingFulfillmentSaga() {
  yield takeLatest(SETTING_TYPES.fulfillment.listAll, listAllSaga);
}
