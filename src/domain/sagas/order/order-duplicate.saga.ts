import { OrderType } from 'domain/types/order.type';
import {getOrderDuplicateService} from "./../../../service/order/order-duplicate.service";
import {call,takeLatest,put} from "@redux-saga/core/effects";
import {CustomerDuplicateModel} from "model/duplicate/duplicate.model";
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

export function* OrderDuplicateSaga(){
    yield takeLatest(OrderType.GET_ORDER_DUPLICATE_LIST, getOrderDuplicateSaga);
}