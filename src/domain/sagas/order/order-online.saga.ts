import { unauthorizedAction } from 'domain/actions/auth/auth.action';
import { orderPostApi } from 'service/order/source.service';
import { OrderType } from 'domain/types/order.type';
import BaseResponse from 'base/BaseResponse';
import { put, call, takeLatest } from 'redux-saga/effects';
import { HttpStatus } from 'config/HttpStatus';
import { YodyAction } from 'base/BaseAction';
import { showError } from 'utils/ToastUtils';
import { OrderResponse } from 'model/response/order/order-online.response';


function* orderCreateSaga(action: YodyAction) {
    const {request, setData} = action.payload;
    try {
      let response: BaseResponse<OrderResponse> = yield call(orderPostApi, request);
      switch(response.code) {
        case HttpStatus.SUCCESS:
          setData(response.data);
          break;
        case HttpStatus.UNAUTHORIZED:
          yield put(unauthorizedAction());
          break;
        default:
          response.errors.forEach((e) => showError(e));
          break;
      }
    } catch (error) {
      showError(error);
    }
  }

function* OrderOnlineSaga(){
    yield takeLatest(OrderType.CREATE_ORDER_REQUEST, orderCreateSaga)
}

export default OrderOnlineSaga;