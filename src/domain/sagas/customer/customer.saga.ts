import { PageResponse } from "model/base/base-metadata.response";
import { CustomerResponse } from "model/response/customer/customer.response";
import BaseResponse from "base/BaseResponse";
import { YodyAction } from "base/BaseAction";
import { call, takeLatest, put } from "redux-saga/effects";
import { HttpStatus } from "config/HttpStatus";
import { getCustomers } from "service/cusomer/customer.service";
import { CustomerType } from "domain/types/customer.type";
import { showError } from "utils/ToastUtils";
import { unauthorizedAction } from "domain/actions/auth/auth.action";

function* onKeySearchCustomerChange(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    if (query.request.length >= 3) {
      const response: BaseResponse<PageResponse<CustomerResponse>> = yield call(
        getCustomers,
        query
      );
      switch (response.code) {
        case HttpStatus.SUCCESS:
          setData(response.data.items);
          break;
        case HttpStatus.UNAUTHORIZED:
          yield put(unauthorizedAction());
          break;
        default:
          response.errors.forEach((e) => showError(e));
          break;
      }
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export default function* customerSagas() {
  yield takeLatest(
    CustomerType.KEY_SEARCH_CUSTOMER_CHANGE,
    onKeySearchCustomerChange
  );
}
