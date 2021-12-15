import { CustomerDuplicateModel } from './../../../model/order/duplicate.model';
import { OrderType } from 'domain/types/order.type';
import {getOrderDuplicateService, putOrderCancelService, putOrderMergeService} from "./../../../service/order/order-duplicate.service";
import {call,takeLatest,put} from "@redux-saga/core/effects";
import {YodyAction} from "base/base.action";
import {showError} from "utils/ToastUtils";
import BaseResponse from "base/base.response";
import {HttpStatus} from "config/http-status.config";
import {PageResponse} from "model/base/base-metadata.response";
import {unauthorizedAction} from "./../../actions/auth/auth.action";

function* getOrderDuplicateSaga(action: YodyAction) {
  let {param, setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<CustomerDuplicateModel>> = yield call(
      getOrderDuplicateService,
      param
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
          response.errors.forEach((e)=>showError(e));
        break;
    }
  } catch {
    showError("Có lỗi khi lấy dữ liệu khach hàng có đơn trùng! Vui lòng thử lại sau!");
  }
}

function* putOrderDuplicateMergeSaga(action:YodyAction){
  let{origin_id,ids,setData}=action.payload;
  try{
    let response:BaseResponse<any>=yield call(putOrderMergeService,origin_id, ids);
    switch(response.code)
    {
      case HttpStatus.SUCCESS:
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e:any)=>showError(e));
        break;
    }
  }
  catch{
    showError("Có lỗi xảy ra khi thực hiện thao tác gộp đơn trùng")
  }
}

function* putOrderDuplicateCancelSaga(action:YodyAction)
{
  let{ids,setData}=action.payload;
  try{
    let response:BaseResponse<any>= yield call(putOrderCancelService,ids);
    switch(response.code)
    {
      case HttpStatus.SUCCESS:
        setData(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e:any)=>showError(e));
        break;
    }
  }
  catch{
    showError("Có lỗi xảy ra khi thực hiện thao tác hủy đơn trùng");
  }
}

export function* OrderDuplicateSaga(){
    yield takeLatest(OrderType.GET_ORDER_DUPLICATE_LIST, getOrderDuplicateSaga);
    yield takeLatest(OrderType.PUT_ORDER_DUPLICATE_MERGE,putOrderDuplicateMergeSaga);
    yield takeLatest(OrderType.PUT_ORDER_DUPLICATE_CANCEL,putOrderDuplicateCancelSaga);
}