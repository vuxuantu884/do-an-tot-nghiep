import { OrderType } from '../../types/order.type';
import BaseResponse from 'base/BaseResponse';
import { put, call, takeLatest } from 'redux-saga/effects';
import { HttpStatus } from 'config/HttpStatus';
import { getSources } from '../../../service/order/source.service';
import { SourceModel } from 'model/other/SourceModel';
import { YodyAction } from '../../../base/BaseAction';
import { getListSourceError } from 'domain/actions/order/orderOnline.action';

function* getDataSource(action: YodyAction) {
    let { setData } = action.payload;
    try {
        let response: BaseResponse<Array<SourceModel>> = yield call(getSources);
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

function* OrderOnlineSaga(){
    yield takeLatest(OrderType.GET_LIST_SOURCE_REQUEST, getDataSource);
}

export default OrderOnlineSaga;