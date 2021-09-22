import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { ORDER_RETURN_TYPES } from "domain/types/order-return";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  createOrderReturnService,
  getOrderReturnService,
  setIsReceivedProductOrderReturnService,
} from "service/order/return.service";
import { showError, showSuccess } from "utils/ToastUtils";
import { YodyAction } from "../../../base/base.action";
import { unauthorizedAction } from "../../actions/auth/auth.action";
import { OrderType } from "../../types/order.type";

function* getOrderReturnDetailsSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(getOrderReturnService, id);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* createOrderReturnSaga(action: YodyAction) {
  const { params, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(
      createOrderReturnService,
      params
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        showSuccess("Tạo đơn đổi hàng thành công");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* setIsReceivedProductReturnSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<any> = yield call(
      setIsReceivedProductOrderReturnService,
      id
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        showSuccess("Thay đổi trạng thái đã nhận hàng thành công!");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

export function* OrderReturnSaga() {
  yield takeLatest(
    OrderType.return.GET_RETURN_DETAIL,
    getOrderReturnDetailsSaga
  );
  yield takeLatest(OrderType.CREATE_RETURN, createOrderReturnSaga);
  yield takeLatest(
    ORDER_RETURN_TYPES.SET_IS_RECEIVED_PRODUCT,
    setIsReceivedProductReturnSaga
  );
}
