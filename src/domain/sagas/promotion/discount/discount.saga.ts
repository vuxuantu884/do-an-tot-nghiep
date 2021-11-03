import { DiscountResponse } from 'model/response/promotion/discount/list-discount.response';
import {YodyAction} from "../../../../base/base.action";
import BaseResponse from "../../../../base/base.response";
import {call, put} from "@redux-saga/core/effects";
import {HttpStatus} from "../../../../config/http-status.config";
import {unauthorizedAction} from "../../../actions/auth/auth.action";
import {showError} from "../../../../utils/ToastUtils";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {searchDiscountList, deletePriceRuleById, getPriceRuleById} from "../../../../service/promotion/discount/discount.service";
import {takeLatest} from "typed-redux-saga";
import {DiscountType} from "../../../types/promotion.type";

function* getDiscounts(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    const response: BaseResponse<PageResponse<DiscountResponse>> = yield call(
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
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* deletePriceRuleByIdAct(action: YodyAction) {
  console.log('deletePriceRuleByIdAct - action : ', action);
  const { id, onDeleteSuccess } = action.payload;
  try {
    const response: BaseResponse<DiscountResponse> = yield call(
      deletePriceRuleById,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onDeleteSuccess()
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* getPromoCodeDetail(action: YodyAction) {
  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<DiscountResponse> = yield call(
      getPriceRuleById,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        onResult(false);
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* discountSaga() {
  yield takeLatest(DiscountType.GET_PROMO_CODE_DETAIL, getPromoCodeDetail);
  yield takeLatest(DiscountType.GET_LIST_DISCOUNTS, getDiscounts);
  yield takeLatest(DiscountType.DELETE_PRICE_RULE_BY_ID, deletePriceRuleByIdAct);
}
