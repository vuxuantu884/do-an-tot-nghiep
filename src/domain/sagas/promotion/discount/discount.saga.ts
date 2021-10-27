import {YodyAction} from "../../../../base/base.action";
import BaseResponse from "../../../../base/base.response";
import {call, put} from "@redux-saga/core/effects";
import {HttpStatus} from "../../../../config/http-status.config";
import {unauthorizedAction} from "../../../actions/auth/auth.action";
import {showError} from "../../../../utils/ToastUtils";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {searchDiscountList} from "../../../../service/promotion/discount/discount.service";
import {takeLatest} from "typed-redux-saga";
import {DiscountType} from "../../../types/promotion.type";

function* getDiscounts(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      searchDiscountList,
      query
    );
    switch (response.code) {
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
    console.log('getDiscounts - error: ', error)
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* discountSaga() {
  yield takeLatest(DiscountType.GET_LIST_DISCOUNTS, getDiscounts);
}