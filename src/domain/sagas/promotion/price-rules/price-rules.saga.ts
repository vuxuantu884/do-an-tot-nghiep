import { searchListDiscountCode } from './../../../../service/promotion/price-rules/price-rules.service';
import { searchPriceRules } from './../../../../service/promotion/price-rules/price-rules.service';
import {YodyAction} from "../../../../base/base.action";
import BaseResponse from "../../../../base/base.response";
import {call, put} from "@redux-saga/core/effects";
import {HttpStatus} from "../../../../config/http-status.config";
import {unauthorizedAction} from "../../../actions/auth/auth.action";
import {showError} from "../../../../utils/ToastUtils";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {takeLatest} from "typed-redux-saga";
import {DiscountType} from "../../../types/promotion.type";

function* getPriceRules(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      searchPriceRules,
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
    console.log('searchPriceRules - error: ', error)
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getListDiscountCode(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<any>> = yield call(
      searchListDiscountCode,
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
    console.log('getListDiscountCode - error: ', error)
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* priceRulesSaga() {
  yield takeLatest(DiscountType.GET_PRICE_RULES, getPriceRules);
  yield takeLatest(DiscountType.GET_LIST_DISCOUNT_CODE, getListDiscountCode);
}