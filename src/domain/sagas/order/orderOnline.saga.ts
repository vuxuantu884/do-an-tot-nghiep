import { OrderRequest } from 'model/request/order.request';
import { orderPostApi } from './../../../service/order/source.service';
import { SourceResponse } from 'model/response/order/source.response';
import { OrderType } from '../../types/order.type';
import BaseResponse from 'base/BaseResponse';
import { put, call, takeLatest } from 'redux-saga/effects';
import { HttpStatus } from 'config/HttpStatus';
import { getSources } from '../../../service/order/source.service';
import { YodyAction } from '../../../base/BaseAction';
import { getListSourceError } from 'domain/actions/order/orderOnline.action';
import { showError } from 'utils/ToastUtils';
import { hideLoading, showLoading } from 'domain/actions/loading.action';
import { OrderRespose } from 'model/response/order/order-online.response';

function* getDataSource(action: YodyAction) {
    let { setData } = action.payload;
    try {
        let response: BaseResponse<Array<SourceResponse>> = yield call(getSources);
        switch (response.code) {
            case HttpStatus.SUCCESS:
                setData(response.data)
                break;
            default:
                yield put(getListSourceError());
                break;
        }
    } catch (error) {
        yield put(getListSourceError())
    }
}

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
    yield takeLatest(OrderType.GET_LIST_SOURCE_REQUEST, getDataSource);
    yield takeLatest(OrderType.CREATE_ORDER_REQUEST, orderCreateSaga)
}

export default OrderOnlineSaga;