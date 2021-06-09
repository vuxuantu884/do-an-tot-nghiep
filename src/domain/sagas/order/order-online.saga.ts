import { orderPostApi } from '../../../service/order/source.service';
import { OrderType } from '../../types/order.type';
import BaseResponse from 'base/BaseResponse';
import { put, call, takeLatest } from 'redux-saga/effects';
import { HttpStatus } from 'config/HttpStatus';
import { YodyAction } from '../../../base/BaseAction';
import { showError } from 'utils/ToastUtils';
import { hideLoading, showLoading } from 'domain/actions/loading.action';
import { OrderRespose } from 'model/response/order/order-online.response';


function* orderCreateSaga(action: YodyAction) {
    const {request, setData} = action.payload;
    console.log("test", request);
    try {
      console.log("test", request);
      yield put(showLoading());
      let response: BaseResponse<OrderRespose> = yield call(orderPostApi, request);
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

function* OrderOnlineSaga(){
    yield takeLatest(OrderType.CREATE_ORDER_REQUEST, orderCreateSaga)
}

export default OrderOnlineSaga;