import { call, put, takeLatest } from '@redux-saga/core/effects';
import { YodyAction } from 'base/BaseAction';
import BaseResponse from 'base/BaseResponse';
import { HttpStatus } from 'config/HttpStatus';
import { unauthorizedAction } from 'domain/actions/auth/auth.action';
import { actionFetchListOrderSourcesFailed, actionFetchListOrderSourcesSuccessful } from 'domain/actions/settings/order-sources.action';
import { SETTING_TYPES } from 'domain/types/settings.type';
import { PageResponse } from 'model/base/base-metadata.response';
import { SizeResponse } from 'model/product/size.model';
import { OrderSourceModel } from 'model/response/order/order-source.response';
import { getSources, getSourcesWithParams } from 'service/order/order.service';
import { searchVariantsApi } from 'service/product/product.service';
import { showError } from 'utils/ToastUtils';

function* listAllOrderSourceSaga(action: YodyAction) {
  console.log('action', action)
  const { params } = action.payload;
  try {
    // const {params} = action.payload;
    // console.log('action', action)
    // console.log('22');
    /**
    * chỗ này phải sửa sau, đợi api
    */
     let response: BaseResponse<PageResponse<OrderSourceModel>> = yield call(
      getSourcesWithParams, params
    );
    console.log('response', response)

    switch (response.code) {
      case HttpStatus.SUCCESS:
        const {total} = response.data.metadata;
        const listOrderSources = response.data.items;
        yield put(actionFetchListOrderSourcesSuccessful(listOrderSources, total))
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
    yield put(actionFetchListOrderSourcesFailed(error))
    showError('Có lỗi vui lòng thử lại sau');
  }
}

export function* settingOrderSourcesSaga() {
  yield takeLatest(SETTING_TYPES.orderSources.listAll, listAllOrderSourceSaga);
}
