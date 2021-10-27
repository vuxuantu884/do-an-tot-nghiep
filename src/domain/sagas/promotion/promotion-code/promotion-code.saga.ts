import {YodyAction} from "../../../../base/base.action";
import BaseResponse from "../../../../base/base.response";
import {call, put} from "@redux-saga/core/effects";
import {HttpStatus} from "../../../../config/http-status.config";
import {unauthorizedAction} from "../../../actions/auth/auth.action";
import {showError} from "../../../../utils/ToastUtils";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {searchPromotionCodeList} from "../../../../service/promotion/promotion-code/promotion-code.service";
import {takeLatest} from "typed-redux-saga";
import {DiscountType} from "../../../types/promotion.type";

function* getPromotionCode(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      searchPromotionCodeList,
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
    console.log('getPromotionCode - error: ', error)
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* promotionCodeSaga() {
  yield takeLatest(DiscountType.GET_LIST_PROMOTION_CODE, getPromotionCode);
}