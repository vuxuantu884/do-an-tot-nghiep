import { SourceResponse } from 'model/response/order/source.response';
import { OrderType } from '../../types/order.type';
import BaseResponse from 'base/BaseResponse';
import { call, takeLatest } from 'redux-saga/effects';
import { HttpStatus } from 'config/HttpStatus';
import { getSources } from '../../../service/order/source.service';
import { YodyAction } from '../../../base/BaseAction';

function* getDataSource(action: YodyAction) {
    let { setData } = action.payload;
    try {
        let response: BaseResponse<Array<SourceResponse>> = yield call(getSources);
        switch (response.code) {
            case HttpStatus.SUCCESS:
                setData(response.data);
                break;
            default:
                break;
        }
    } catch (error) {}
}

function* sourceSaga(){
     yield takeLatest(OrderType.GET_LIST_SOURCE_REQUEST, getDataSource);
}

export default sourceSaga;