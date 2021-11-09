import {
  createPriceRule,
  searchDiscountList,
  deletePriceRuleById,
  getPriceRuleById,
  bulkEnablePriceRules,
  bulkDeletePriceRules,
  bulkDisablePriceRules
} from 'service/promotion/discount/discount.service';
import { DiscountResponse } from 'model/response/promotion/discount/list-discount.response';
import { YodyAction } from "../../../../base/base.action";
import BaseResponse from "../../../../base/base.response";
import {call, put} from "@redux-saga/core/effects";
import {HttpStatus} from "../../../../config/http-status.config";
import {unauthorizedAction} from "../../../actions/auth/auth.action";
import {showError} from "../../../../utils/ToastUtils";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {takeLatest} from "typed-redux-saga";
import {DiscountType} from "../../../types/promotion.type";
import { all } from "redux-saga/effects";

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
        setData(null);
        yield put(unauthorizedAction());
        break;
      default:
        setData(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    setData(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* deletePriceRuleByIdAct(action: YodyAction) {
  const { id, onResult } = action.payload;
  try {
    let response: BaseResponse<DiscountResponse> = yield call(
      deletePriceRuleById,
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

function* addPriceRule(action: YodyAction) {
  console.log('addPriceRule - action : ', action);
  const { body, createCallback } = action.payload;
  try {
    const response: BaseResponse<DiscountResponse> = yield call(
      createPriceRule,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        createCallback(response.data)
        break;
      case HttpStatus.UNAUTHORIZED:
        createCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        createCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    createCallback(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* bulkEnablePriceRulesAct(action: YodyAction) {
  console.log('bulkEnablePriceRulesAct - action : ', action);
  const { body, enableCallback } = action.payload;
  try {
    const response: BaseResponse<DiscountResponse> = yield call(
      bulkEnablePriceRules,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        enableCallback(true)
        break;
      case HttpStatus.UNAUTHORIZED:
        enableCallback(false);
        yield put(unauthorizedAction());
        break;
      default:
        enableCallback(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    enableCallback(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* bulkDisablePriceRulesAct(action: YodyAction) {
  console.log('bulkDisablePriceRulesAct - action : ', action);
  const { body, disableCallback } = action.payload;
  try {
    const response: BaseResponse<DiscountResponse> = yield call(
      bulkDisablePriceRules,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        disableCallback(true)
        break;
      case HttpStatus.UNAUTHORIZED:
        disableCallback(false);
        yield put(unauthorizedAction());
        break;
      default:
        disableCallback(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    disableCallback(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* bulkDeletePriceRulesAct(action: YodyAction) {
  console.log('bulkDeletePriceRulesAct - action : ', action);
  const { body, deleteCallback } = action.payload;
  try {
    const response: BaseResponse<DiscountResponse> = yield call(
      bulkDeletePriceRules,
      body
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        deleteCallback(true)
        break;
      case HttpStatus.UNAUTHORIZED:
        deleteCallback(false);
        yield put(unauthorizedAction());
        break;
      default:
        deleteCallback(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    deleteCallback(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* discountSaga() {
  yield all([
    takeLatest(DiscountType.GET_LIST_DISCOUNTS, getDiscounts),
    takeLatest(DiscountType.GET_PROMO_CODE_DETAIL, getPromoCodeDetail),
    takeLatest(DiscountType.DELETE_PRICE_RULE_BY_ID, deletePriceRuleByIdAct),
    takeLatest(DiscountType.ADD_PRICE_RULE, addPriceRule),
    takeLatest(DiscountType.ENABLE_PRICE_RULE, bulkEnablePriceRulesAct),
    takeLatest(DiscountType.DISABLE_PRICE_RULE, bulkDisablePriceRulesAct),
    takeLatest(DiscountType.DELETE_BULK_PRICE_RULE, bulkDeletePriceRulesAct)
  ])
}
